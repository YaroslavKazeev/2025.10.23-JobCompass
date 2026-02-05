import normalizeDescription from "./normalizeDescription.js";
import validateJob from "./validateJob.js";
import normalizeUrl from "./normalizeUrl.js";
import checkExperienceLevel from "./checkExperienceLevel.js";

export default function processRapidAPIjob(job) {
  const {
    external_apply_url: url1,
    url: url2,
    title,
    date_posted,
    employment_type = [],
    remote_derived = false,
    locations_derived = [],
    seniority,
    description_text = "",
    organization,
    linkedin_org_url,
    organization_logo,
  } = job || {};
  // normalize seniority values coming from the job source
  let normalizedSeniority;
  switch (seniority) {
    case "Stagiair":
      normalizedSeniority = "Internship";
      break;
    case "Instapniveau":
      normalizedSeniority = "Entry level";
      break;
    case "Medewerker":
      normalizedSeniority = "Associate";
      break;
    case "Senior medewerker":
      normalizedSeniority = "Mid-Senior level";
      break;
    case "Directeur":
      normalizedSeniority = "Director";
      break;
    case "Algemeen directeur":
      normalizedSeniority = "Executive";
      break;
    case "Niet van toepassing":
      normalizedSeniority = checkExperienceLevel(title);
      break;
    default:
      normalizedSeniority = seniority;
  }

  const url = normalizeUrl(url1) || normalizeUrl(url2);

  function normalizeEmploymentType(type) {
    if (type === "Intern") {
      return "Internship";
    }
    return type;
  }

  const processedJob = {
    id: url,
    url,
    title,
    date_posted,
    employment_type:
      Array.isArray(employment_type) && employment_type.length > 0
        ? normalizeEmploymentType(
            (employment_type[0].charAt(0).toUpperCase() + employment_type,
            [0].slice(1).toLowerCase()).replace("_", "-"),
          )
        : null,
    work_mode: remote_derived === true ? "Remote" : "On-site",
    display_location:
      Array.isArray(locations_derived) && locations_derived.length > 0
        ? locations_derived[0]
        : null,
    seniority: normalizedSeniority,
    description_text,
    normalized_description:
      normalizeDescription(title) + normalizeDescription(description_text),
    travel_time: null,
    least_transfers: null,
    organization,
    organization_url: normalizeUrl(linkedin_org_url),
    organization_logo,
  };

  return validateJob(processedJob) ? processedJob : null;
}
