/**
 * Validates a job object to ensure it meets the criteria for database insertion
 * @param {Object} job - The job object to validate
 * @returns {boolean} - True if the job is valid, false otherwise
 */
export default function validateJob(job) {
  if (!job || typeof job !== "object") {
    return false;
  }

  const datePosted = new Date(job.date_posted);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (isNaN(datePosted) || datePosted < oneMonthAgo) {
    return false;
  }

  const optionalFields = ["travel_time", "least_transfers", "work_mode"];
  return Object.entries(job).every(([key, value]) => {
    if (optionalFields.includes(key)) return true;
    return value !== null && value !== undefined;
  });
}
