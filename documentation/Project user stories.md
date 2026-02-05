# Job Finder Application – MVP User Stories

1. ## Learning the app and Building Trust

**As a Jobless Jack**  
 **I want** to quickly learn how to use the app and build trust in it  
 **So that** less time is spent figuring out what actions should be taken and their succession to find relevant jobs.

**Acceptance Criteria:**

- There should be [CTA & notifications](#cta--notifications)
- There should be [Demo-Guest mode](#demo-guest-mode)
- There should be [Creators' Info, Policies](#creators-info-policies)

**Priority:** High

<a id="cta--notifications"></a>

1. ### CTA & notifications

**As a Jobless Jack**  
 **I want** to be guided throughout the steps  
 **So that** he can spend less time figuring out what actions should be taken and their succession to find relevant jobs.

**Acceptance Criteria:**

- Every component containing an action, whether a button or a clickable link, must have a call to action (CTA).
- If placing a CTA directly within a component containing an action is impossible or impractical, the CTA should be placed within its parent component.
- CTA should be concise and to the point, yet sufficiently descriptive of its action(s).
- Every component containing an action should inform the user of a pending or unsatisfactory state of the action path.
- The message about an unsatisfactory path should include the suggestion of correction steps.

**Priority:** High

<a id="demo-guest-mode"></a> 2. ### Demo-Guest mode

**As a Jobless Jack**  
 **I want** to learn how to use the app by doing, and use the app features for demo purposes  
 **So that** he can have an impression of what the app is capable of before registration and bearing accompanying costs.

**Acceptance Criteria:**

- The app should provide demo functionality without registration.
- In demo mode, the user’s current session :
  - Changing [Favorited Status](#favorited-status).
  - Use the Apply button in [Job Post](#job-post).
  - Save settings on [ProfilePage](#profilepage).
- The Guest user mode has **default user demo settings** automatically applied:
  - address → default value
  - skills → pre-filled for demo (e.g., for “IT Specialist”)

**Priority:** High

<a id="creators-info-policies"></a> 3. ### Creators' Info, Policies

**As a Jobless Jack**  
 **I want** to quickly build trust in the app  
 **So that** he is sure that his data is secure and will not be used inappropriately.

**Acceptance Criteria:**

- There is the page ‘About’ with the credentials of the app development team.
- There is an explanation on how the user’s email, home address will be used.
- These are links to the GDPR policies that were incorporated into the [User Info Access Restriction](#user-info-access-restriction) features.

**Priority:** High

2. ## JobSearchPage

**As a Jobless Jack**  
 **I want** to search for jobs using a combination of dynamic input for job titles and predefined settings for their location and travel options.  
 **So that** he can find relevant job openings near him or in the preferred area.

**Acceptance Criteria:**

- The headline/slogan of the page is short and exciting.
- The JobSearchPage has the [JobTitles Search Form](#jobtitles-search-form).
- The [ProfilePage](#profilepage) has skills, location, and travel settings.

**Priority:** High

<a id="jobtitles-search-form"></a>

1. ### JobTitles Search Form

**As a Jobless Jack**  
 **I want** to use an input field to type a job title and initiate the search  
 **So that** he will see the search results on the [OpenPositionsPage](#openpositionspage).

**Acceptance Criteria:**

- The search form (bar) has an input field to type a job title in.
- The search bar has a button ‘Search’
- When clicked, the user is redirected to the [OpenPositionsPage](#openpositionspage).

**Priority:** High

<a id="profilepage"></a> 3. ## ProfilePage

**As a Jobless Jack**  
 **I want** to set his skill set, the address to use as home address, the search area, and the maximum acceptable travel time.  
 **So that** he can use these predefined settings in his search using the [JobTitles Search Form](#jobtitles-search-form).

**Acceptance Criteria:**

- There are the [Skill Set Form](#skill-set-form), [Address Settings](#address-settings), and travel settings.
- There is a CTA: “Set your CV skill set and location preferences to find the most relevant jobs close to you’
- There is the avatar setter.
- There is the “Security” section with the functionality to update name, email, and password.
- There is a button “Save”
- There is a message area about the user actions' results close to the ‘Save’ button.
- There is the text “Do you want to delete your info? With the button “Delete profile” below. There is a message area associated with the ‘Delete’ button.

**Priority:** High

<a id="skill-set-form"></a>

1. ### Skill Set Form

**As a Jobless Jack**  
 **I want to** add, view, and remove my professional skills  
 **So that** he can use this predefined skill set in his search using the [JobTitles Search Form](#jobtitles-search-form).

**Acceptance Criteria:**

- The form includes an input field to type a skill.
- The form includes a button labeled **“Add Skill”** to add a new skill to the list.
- The list of added skills is displayed below, and each skill has a **“Remove”(X)** button next to it.
- When a skill is added, it appears immediately in the list displayed below.
- If the skill list is empty, the message below must be displayed: “Using shorter words increases the chance to find a match, e.g., ‘Node’ is better than ‘Node.js’”

**Priority:** High

<a id="address-settings"></a> 2. ### Address Settings

**As a Jobless Jack**  
 **I want to** specify my location  
 **So that** he can use [JobTitles Search Form](#jobtitles-search-form) to get the jobs that are nearby at the top of the list on [OpenPositionsPage](#openpositionspage).

**Acceptance Criteria:**

- The form includes input fields for **Province, City**, **Street**, and **House Number**.
- If the travel form is empty, the following message must appear: “The more specific the location and travel options are, the more suitable travel routes can be provided by the app.”

**Priority:** High

<a id="openpositionspage"></a> 4. ## OpenPositionsPage

**As a Jobless Jack**  
 **I want to** view a list of available job postings after performing a search  
 **So that** he can easily browse, review, sort, filter, and save to [MyFavoritesPage](#myfavoritespage), and decide which jobs to apply for.

**Acceptance Criteria:**

- Job results are displayed as a list of [Job Post](#job-post)s.
- Search must show results corresponding to user settings in the [ProfilePage](#profilepage).
- There should be a bar with [Filters and Sorting](#multi-criteria-filters-and-cascade-sort).  
  **Priority:** High

<a id="multi-criteria-filters-and-cascade-sort"></a>

1. ### Multi-Criteria Filters and Cascade Sort

**As a Jobless Jack**  
 **I want to** apply multiple filters and sorting  
 **So that** he can narrow down search results to the jobs that best fit my criteria.

**Acceptance Criteria:**

- Filters can be used simultaneously.
- Results update instantly when filters are selected or removed.
- Selected filters are displayed clearly and can be reset by the “Clear All Filters” button.
- There are filters for all tags, listed in [Job Post](#job-post), except for skill matches, the number of applicants, the date of posting, and the travel time which are the part of Cascade Sort.

**Priority:** High

<a id="job-post"></a> 5. ## Job Post

**As a Jobless Jack**  
 **I want to** see job posts on [OpenPositionsPage](#openpositionspage) and [MyFavoritesPage](#myfavoritespage) with all details  
 **So that** he can easily decide what jobs are the most relevant or continue to work on their job application.

**Acceptance Criteria:**

- Each job post shows the company logo, name, company website link, job posting info, and a [Favorited Status](#favorited-status)/’heart” button to add to [MyFavoritesPage](#myfavoritespage).
- Clicking a job title or Apply/More button opens the detailed job page with a full description and requirements on LinkedIn.
- Each Job post has tags with Experience(Seniority) level, Work arrangement type (mode), Date of posting, Number of Applicants, Location, Travel Time, and Number of Transport Transfers
- Each Job post has the Skill Match Tags bar and a truncated description (raw HTML).

**Priority:** High

<a id="favorited-status"></a>

1. ### Favorited Status

**As a Jobless Jack**  
 **I want to** see job posts that I have previously marked as favorites  
 **So that** he can easily review and access my favourite job opportunities later.

**Acceptance Criteria:**

- Each job has a heart icon that indicates its favourite status (empty or filled).
- Clicking an empty heart adds the job to the user’s favourites list.
- Clicking a filled heart removes the job from the favourites list.
- There should be a message to show the user if the job is not saved to the DB successfully
- Saved job posts persist after logout and can be viewed on the [MyFavoritesPage](#myfavoritespage).
- A tooltip or label indicates the function of the icon (e.g., “Save job to favourites” / “Remove from favourites”).

**Priority:** High

<a id="myfavoritespage"></a> 6. ## MyFavoritesPage

**As a Jobless Jack**  
**I want to** view all the jobs I have previously saved to favorites (marked as favorites)  
**So that** he can easily review and access my favourite job opportunities later.

**Acceptance Criteria:**

- The page displays jobs with [Favorited Status](#favorited-status) in an unordered list.
- All the jobs that have a filled heart icon should be displayed on this page
- Users can remove jobs from favourites directly on this page.
- If there are no saved jobs, a message such as “You haven’t saved any jobs yet” is displayed.

**Priority:** High

7. ## Header/Navigation

**As a Jobless Jack**  
**I want to** see a consistent header with the app logo and navigation button with links  
**So that** he can easily move between the main pages of the application.

**Acceptance Criteria:**

- The header is the same for all pages.
- Includes links to all app pages.
- The active page is visually highlighted.

**Priority:** High

8. ## Personalization and User Info Access Restriction

**As a Jobless Jack**  
**I want to** personalize settings and restrict others from accessing my info  
**So that** he does not spend time on readjustments and keeps his info safe.

**Acceptance Criteria:**

- There is a [User Info Access Restriction](#user-info-access-restriction).
- The app provides [Personalization](#personalization) features.

**Priority:** High

<a id="user-info-access-restriction"></a>

1. ### User Info Access Restriction

**As a Jobless Jack**  
**I want to** exclude other users from access to the information that I save in the app  
**So that** he is sure that his data is secure and will not be used inappropriately.

**Acceptance Criteria:**

- The app follows common web standards for users’ authorization and authentication \- email, password, and JWT.
- The AuthPage has Registration(SignUp) and Secure Login and Logout components.

**Priority:** High

<a id="personalization"></a> 2. ### Personalization

**As a Jobless Jack**  
**I want to** create an account with my basic information,  
**So that** he can log in and use personalized features like favorites and settings.

**Acceptance Criteria:**

- The registration form includes required fields:
  - Name
  - Email address
  - Password
- There is the [ProfilePage](#profilepage) to set personalized settings

**Priority:** High

9. ## Footer

**As a Jobless Jack**  
**I want** to see a footer at the bottom of every page with **Privacy** and **Contact** links  
**So that** he can easily access important information.

**Acceptance Criteria:**

- The footer is visible on all pages
- The footer contains:
  - App copyright.
  - Privacy link that redirects to the external Privacy Policy page.
  - Contact link that redirects to the About page.
- The footer design is consistent with the header (colors, font, layout).
- The footer stays at the bottom of the page, even on short content pages.

**Priority:** High

# Brainstorming Ideas – Future User Stories

1. **More job posts are shown**

**As a Jobless Jack**  
**I want to** view more jobs on the Open Positions page  
**So that** he has more job opportunities at their disposal.

**Acceptance Criteria:**

- Adding the API \- LinkedIn Jobs Scraper \- PPR to the existing fetching process.
- Making multiple requests from the front end and assembling them.
- Changing the UI to inform the user about the fetching process (spinners and/or messages)

**Priority:** Medium

2. **Saving Filter and Sorting Settings**

**As a Jobless Jack**  
 **I want** all the adjustments on all pages to persist between sessions  
 **So that** he can save time and not adjust them again from the default state

**Acceptance Criteria:**

- Not only are the settings of the [ProfilePage](#profilepage) persistent across sessions, but also the adjustments made to Filters and Sorting on the [OpenPositionsPage](#openpositionspage).

**Priority:** Medium

3. **Interface Language Selector**

**As a Jobless Jack**  
 I want to select my preferred interface language  
 So that I can navigate the platform comfortably.

**Acceptance Criteria:**

- Users can select from available languages.
- The interface updates to the chosen language.
- The language preference is saved for future visits.

**Priority:** Medium

4. **Filter by Transportation Mode**

**As a Jobless Jack**  
 I want to specify my primary method of travel  
 So that I can find jobs accessible by my preferred transport.

**Acceptance Criteria:**

- Users can choose a transportation mode (car, walk, bike).
- The system prioritizes nearby or accessible jobs.

**Priority:** Low

5. **Closed Vacancies Notifications**

**As a Jobless Jack**  
 I want closed or expired jobs to be clearly marked  
 So that I don’t waste time applying to unavailable positions.

**Acceptance Criteria:**

- Closed jobs display a “Closed” or “Expired” label.
- Saved closed jobs remain visible but not actionable.
- The system auto-updates job status.

**Priority:** Medium

6. **Job Post Subscription**

**As a Jobless Jack**  
 I want to receive a notification or see an indicator when new jobs matching my profile are available  
 So that I don't have to search manually every day.

**Acceptance Criteria:**

- A simple way to make users stay and visit again.

**Priority:** Medium

7. **Job Post Language Filtering**

**As a Jobless Jack**  
 I want to define my preferred spoken and written language(s)  
 So that I only see open positions that require languages I am proficient in (e.g., Dutch, English).

**Acceptance Criteria:**

- Make things more useful and clearer in a workplace with many languages.

**Priority:** Medium

8. **Travel to JobPlace Plotting**

**As a Jobless Jack**  
 I want to see the map with the calculated route to the job location  
 So that I can see more about travelling before applying.

**Acceptance Criteria:**

- Opens the Google Maps window with the plotted route.

**Priority:** Medium

9. **Changing, Restoring the Credentials**

**As a Jobless Jack**

I want to change or restore my credentials using email.  
 So that I can restore my forgotten password.

**Acceptance Criteria:**

- User enters email
- Receives reset link via email
- Sets a new password

**Priority:** Medium

10. **Using Google Authentication**

**As a Jobless Jack**

I want to use Google Authentication,  
 So that I will not bother to save credentials for this app.

**Acceptance Criteria:**

- Google Auth

**Priority:** Medium

11. **User Address Autocompletion**

**As a Jobless Jack**

I want to type my address in one input field and see an autocompletion suggestion.  
 So that I will not spend too much time filling in individual fields in the address section of the user profile

**Acceptance Criteria:**

- There are five text strings with address autocomplete suggestions below the input field. When one of them is clicked, it gets added to the input.
- There is a button “Use address” to save the address in the profile and parse it into individual address fields for province, city, street, and house number.

**Priority:** Medium

12. **AI-generated skill set suggestion**

**As a Jobless Jack**

I would like suggestions on how to fill the skills area, including the AI-generated skill set, that I can easily update.  
 So that I will not spend too much time thinking about filling in those in the profile settings section

**Acceptance Criteria:**

- There is a form with the suggestion to generate a skill set, using AI
- The user can enter the job title in the text input field and use the button ‘Suggest Skills’
- The skills are displayed below; each skill has a ‘remove’ or ‘X’ button.
- The button ‘Add skill(s)’ can add both one individual skill from the text input field and several skills generated by AI in this feature.

**Priority:** Medium

13. **Automatic Extraction of the skill set from the CV**

**As a Jobless Jack**

I would like the app to extract the skill set from my CV  
So that I will save some time on thinking and extracting these myself

**Acceptance Criteria:**

- There is a text input form to put the CV text in, with the button “Extract Skills”
- The skills are displayed below; each skill has a ‘remove’ or ‘X’ button.
- The button ‘Add skill(s)’ can add both an individual skill from the text input field and several skills extracted by AI in this feature.

**Priority:** Medium

14. **FTUX Redirection of a Newcomer to where they were**

**As a Jobless Jack**  
**I want to** be redirected back to the exact page from where I was before I was redirected to login because of the restrictions of the Guest mode  
**So that** he is not bothered with doing it themselves

**Acceptance Criteria:**

- Saving the route name for a newcomer in the context.

**Priority:** Medium

15. **User Email Change**

**As a Jobless Jack**  
**I want to** change my email  
**So that** he does not have to delete his profile or create another one

**Acceptance Criteria:**

- Adding the input field for the new email on the Profile Page
- Deciding on whether some verification is needed before doing the change.

**Priority:** Medium

16. **Lowering the number of Google Maps calls**

**As a Product Owner**  
**I want to** cut the number of Google Maps calls  
**So that** the costs of using the app are lower

**Acceptance Criteria:**

- Add the userTravels array to the DB
- This array includes the travel details (travel_time, number_transfers) to each city that the user has ever fetched in their job search

**Priority:** Medium

17. **Open Positions Stay on Rerender**

**As a Jobless Jack**  
**I want to** persist the fetch job results on page reload  
**So that** he does not have to search again if the page is reloaded

**Acceptance Criteria:**

- Save results (e.g., localStorage) to keep them after reload.

**Priority:** Medium
