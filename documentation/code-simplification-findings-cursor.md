# Code simplification findings (excessive safeguards)

This note lists spots where logic looks over-defensive or more complex than needed, along with concrete simplification ideas. The goal is **fewer branches and fewer “impossible state” checks** while keeping behavior the same.

## Backend

### `server/src/controllers/jobData.js` — DB connection flow + branching can be flattened

**What’s excessive**
- Connection handling is `if (connectionError) ... else { try { ... } finally { ... } }`, which forces a large `else` block and makes the happy path harder to scan.
- `is_auth` is set to `req?.user?.id || null`, but it’s used as an auth flag *and* an id. Naming suggests boolean but value is id or null.
- `if (is_whole_string === undefined || searchWords.length > 1)` is an odd condition: `is_whole_string` sounds boolean but is checked against `undefined`. This reads like a “safety hedge” that obscures intent.
- Cached jobs are added with a `forEach` guarded by `if (cachedJobsPerSearchString.length > 0)` (the `forEach` already no-ops on empty arrays).

**Simplify**
- Use early-return for connection error and wrap the rest in a single `try/finally`:
  - Connect → if error return → try main flow → finally close connection.
- Rename `is_auth` to `userId` (or `authUserId`) and treat it consistently as an id (or switch to boolean `isAuthenticated` if that’s what downstream expects).
- Replace the `undefined` check with an explicit, intention-revealing condition such as:
  - “If whole-string isn’t fully cached” vs “If whole-string is cached”.
  - That probably means changing `getCachedJobsBySearchString` to always return `is_whole_string: boolean` (or `isWholeStringCached`) rather than sometimes `undefined`.
- Drop the redundant `length > 0` guard before iterating.

---

### `server/src/middleware/authVerify.js` — complex “soft auth” flow + in-memory blacklist details

**What’s excessive**
- `msg` is mutated across multiple branches, and the middleware falls through to a final route check. This creates a “collect errors then decide later” pattern that’s harder to reason about than early returns.
- Job search is treated as a special-case inside auth middleware:
  - If route starts with `/api/jobs/search`, it forces `req.user = null` and continues even on invalid token.
  - This mixes two responsibilities: verifying auth *and* deciding which routes allow guests.
- Token blacklist stored as an array (`blacklistedTokens.includes(token)`) is \(O(n)\) and grows without bound. That’s not just defensive—it’s a scalability footgun.

**Simplify**
- Prefer route-level composition instead of a special-case string match:
  - Mount `/api/jobs/search` without auth middleware, or use a separate “optional auth” middleware for that router.
- If you keep this file, flatten with early returns:
  - If `/api/jobs/search`: attempt decode if token present; otherwise `req.user=null`; `next()`.
  - Else: require token and require valid decode; `next()`; on failure `next(httpError)`.
- Replace `blacklistedTokens` array with a `Set` and add an expiry strategy (or move blacklist persistence to DB/Redis if you truly need logout invalidation for JWTs).

---

### `server/src/services/apifyScraperFetchPersister.js` — double-negative condition + redundant `else`

**What’s excessive**
- The main guard is `if (!is_whole_string && is_auth && !inProgressScraperFetch[search_string]) { ... } else { return ""; }`.
  - This mixes 3 conditions with a double-negative (`!is_whole_string`) and then returns empty string in the `else`.

**Simplify**
- Prefer guard clauses:
  - If not authenticated → return `""`.
  - If whole string already cached → return `""`.
  - If already in progress → return `""`.
  - Otherwise start background job and return message.
- Consider returning `null` instead of `""` for “no message” (and handling it consistently on the client). Empty string is a defensive workaround that tends to leak into UI logic.

---

### `server/src/controllers/toggleFavoriteJob.js` — repeated validation + multi-step DB changes without normalization

**What’s excessive**
- Multiple overlapping validations:
  - `jobId` is checked, then `job`/`job.title` checked, then later insert uses `job.title || null` anyway.
- Favorite toggle requires multiple queries:
  - `SELECT job` → maybe `INSERT job` → `SELECT favorite` → `DELETE` or `INSERT favorite`.
  - This is safe, but it’s more complicated than necessary and can race under concurrency.

**Simplify**
- Normalize validation to one “required minimum” rule:
  - If `job?.id` missing → 400.
  - If `job?.title` missing → 400 (if you truly require it).
  - Avoid validating fields you’re willing to store as null anyway.
- Use Postgres `INSERT ... ON CONFLICT DO NOTHING` for job existence (assuming `jobs.id` is PK).
- Consider a transaction if you need “exactly once” semantics (less defensive branching in app code, more enforced by DB).

---

### `server/src/controllers/changeSkills.js` — compound “skills” validation can read clearer

**What’s excessive**
- Validation is a single compound expression with negations and a nested conditional:
  - `!skills || !Array.isArray(skills) || (skills.length !== 0 && skills.some(...))`
  - This works, but it’s a “defensive blob” that’s easy to mis-edit.

**Simplify**
- Use guard clauses:
  - If `!Array.isArray(skills)` → 400.
  - If `skills.some((s) => typeof s !== "string")` → 400.
  - Allow empty array naturally.

---

### `server/src/controllers/user.js` — redundant safety checks + duplicated cookie settings + repeated row-to-favorites mapping

**What’s excessive**
- `getMe` includes a “safety check” for `req.user` even though the route is already protected by `verifyToken`. If middleware guarantees it, checking again is defensive redundancy (and can hide bugs if the middleware is mis-mounted).
- Cookie options are duplicated between `createUser` and `loginUser`.
- `loginUser` and `getMe` both expand `rows` into `user` and `favorites` using very similar code, with lots of field copying.

**Simplify**
- Rely on middleware guarantees in `getMe` (or enforce them by mounting correctly), and remove redundant checks that cannot happen in a correct configuration.
- Extract shared cookie options and/or a helper like `setAuthCookie(res, token)`.
- Extract a helper to map the DB join rows → `{ user, favorites }` once.
  - This reduces duplicated “safeguard mapping” and avoids drift.

---

### `server/src/services/linkedInScraperFetch.js` — polling state can be expressed without extra flags

**What’s excessive**
- `let polling = true; while (polling) { ... switch(status) ... polling=false }` is more state than needed.
- Multiple `if (!response.ok) throw ...` checks are fine, but a few are redundant given the try/catch that already collapses errors into logs + empty return.

**Simplify**
- Convert polling loop to `for (;;)` with explicit `break` on success, or `while (true)` without the extra boolean.
- Consider whether “swallow errors and return []” is intended; if not, propagate error up and let controller decide. Catch-all logging is a common “defensive” pattern that can make failures invisible.

---

### `server/src/middleware/errorHandler.js` — generally fine; one small nit

**What’s potentially excessive**
- `if (res.headersSent) return next(err);` is standard Express practice.

**Simplify (optional)**
- If you standardize on `createHttpError` everywhere, you might not need `Number.isInteger` (but it’s also fine and explicit).

## Frontend

### `client/src/hooks/useFetch.js` — response parsing logic is over-generalized

**What’s excessive**
- It reads `res.text()` for every response, then conditionally parses JSON using a nested try/catch, and falls back to custom error messages.
- It also “guards” for routes that include `api/` by throwing at hook creation time (`route.includes("api/")`), which is helpful but also a runtime footgun if `route` is user-controlled or computed.
- It treats a “successful HTTP response” as success only if `jsonResult.success === true`, otherwise errors—even if the API endpoint intentionally returns a different JSON shape.

**Simplify**
- Decide on a single API contract and rely on it:
  - If backend always returns `{ success, msg, ... }` then parse JSON directly when content-type is JSON.
  - Otherwise, treat `res.ok` as primary success and let each call site decide what constitutes “success”.
- Avoid nested parsing:
  - If `content-type` includes JSON, use `await res.json()` and handle parse failure once.
  - If not JSON, use `await res.text()`.
- Consider allowing the hook to accept a `parse` function (or `expected: "json" | "text"`) so it doesn’t need defensive logic for every endpoint.

---

### `client/src/context/UserContext.jsx` — defensive re-mapping of favorites duplicates backend shape

**What’s excessive**
- `handleFetchMeResults` reconstructs each favorite job by copying each property one by one.
  - This is defensive (it ensures only “known fields” are stored) but it’s also brittle and high-maintenance.

**Simplify**
- If the backend already controls the favorite shape, consider:
  - `favorites: Array.isArray(data.user.favorites) ? data.user.favorites : []`
  - Or do a minimal normalization (e.g., ensure `id` exists) rather than field-by-field copying.
- If you *do* want allowlisting, extract a helper `pickFavoriteFields(job)` so the mapping isn’t duplicated and is easy to update.

---

### `client/src/context/JobsContext.jsx` — some checks can be simplified / made more robust

**What’s excessive**
- `useEffect(() => setAllJobs([]), [user.id])` assumes `user` always has `id`. If `defaultUser` changes, this becomes brittle.
- `handleTravelFetchResults` checks `data.result && Array.isArray(data.result.travelDetails)`; this is fine, but then it rebuilds a map imperatively and maps jobs each time.

**Simplify**
- Prefer `useEffect(..., [user?.id])` (or use a stable `userId` value).
- Consider returning `travelDetails` already keyed by `workCity` from the backend to avoid local mapping logic.
- If keeping current shape, `Object.fromEntries` can build the map more concisely than `forEach` + mutation.

---

### `client/src/util/searchValidation.js` — missing type guard is an “implicit defensive gap”

**What’s odd**
- It only checks `text === ""`, not whether `text` is a string. If `text` is `null/undefined`, `.test(text)` will coerce to `"null"` / `"undefined"` which is surprising.

**Simplify**
- Make the function consistent with `validateSkillInput`:
  - Guard `typeof text !== "string"` early, or coerce to `String(text ?? "")` intentionally.

---

### `client/src/util/skillValidation.js` — fine overall; one opportunity to reduce work

**What’s potentially excessive**
- `const normalizedSkills = skills.map(...)` runs every call, even though `skills` is likely stable within a render.

**Simplify (optional)**
- If this runs frequently, normalize `skills` once at the call site (memoize) and pass normalized values in.

## Shared

### `shared/formatAddress.js` — OK; optional minor readability tweak

**What’s potentially excessive**
- Uses optional chaining repeatedly; it’s fine, but a local `const a = address ?? {}` can reduce repetition.

**Simplify (optional)**
- `const a = address ?? {};` then read `a.street`, etc.

