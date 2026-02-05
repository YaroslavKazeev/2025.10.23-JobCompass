import normalizeDescription from "./normalizeDescription.js";
import validateJob from "./validateJob.js";
import normalizeUrl from "./normalizeUrl.js";
import checkExperienceLevel from "./checkExperienceLevel.js";

export default function processScraperJob(job) {
  const {
    applyUrl: url1,
    link: url2,
    title,
    postedAt: date_posted,
    employmentType: employment_type,
    location,
    seniorityLevel,
    descriptionText = "",
    descriptionHtml: description_text = "",
    companyName: organization,
    companyWebsite,
    companyLogo: organization_logo,
  } = job || {};

  // normalize seniority values coming from the job source
  let normalizedSeniority;
  switch (seniorityLevel) {
    case "Not Applicable":
      normalizedSeniority = checkExperienceLevel(title);
      break;
    default:
      normalizedSeniority = seniorityLevel;
  }

  const url = normalizeUrl(url1) || normalizeUrl(url2);

  const processedJob = {
    id: url,
    url,
    title,
    date_posted,
    employment_type: employment_type || null,
    work_mode: null,
    display_location: location || null,
    seniority: normalizedSeniority,
    description_text,
    normalized_description:
      normalizeDescription(title) + normalizeDescription(descriptionText),
    travel_time: null,
    least_transfers: null,
    organization,
    organization_url: normalizeUrl(companyWebsite),
    organization_logo,
  };

  return validateJob(processedJob) ? processedJob : null;
}
