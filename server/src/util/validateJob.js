/**
 * Validates a job object to ensure it meets the criteria for database insertion
 * @param {Object} job - The job object to validate
 * @returns {boolean} - True if the job is valid, false otherwise
 */
export default function validateJob(job) {
  // Ensure a job object exists to avoid runtime errors
  if (!job || typeof job !== "object") {
    return false;
  }

  // Validate the presence and correctness of date_posted
  const datePosted = new Date(job.date_posted);
  if (!Number.isFinite(datePosted.getTime())) {
    return false;
  }

  // Check if job date is within the last 30 days
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (datePosted < oneMonthAgo) {
    return false;
  }

  // Check if all required fields are non-null
  // (excluding travel_time, least_transfers, and work_mode)
  const hasNullValues = Object.entries(job)
    .filter(
      ([key]) =>
        key !== "travel_time" &&
        key !== "least_transfers" &&
        key !== "work_mode",
    )
    .some(([, value]) => {
      return value === null || value === undefined;
    });

  return !hasNullValues;
}
