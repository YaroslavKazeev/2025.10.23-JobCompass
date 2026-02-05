export function findFilterOptions(allJobs) {
  const experienceSet = new Set();
  const jobTypeSet = new Set();
  const workModeSet = new Set();
  const locationModeSet = new Set();
  for (const job of allJobs) {
    if (job.seniority) {
      experienceSet.add(job.seniority);
    }
    if (job.employment_type) {
      jobTypeSet.add(job.employment_type);
    }
    if (job.work_mode) {
      workModeSet.add(job.work_mode);
    }
    if (job.travel_time === null || job.travel_time === undefined) {
      locationModeSet.add("approximate");
    } else {
      locationModeSet.add("precise");
    }
  }
  return {
    experienceOptions: Array.from(experienceSet),
    jobTypeOptions: Array.from(jobTypeSet),
    workModeOptions: Array.from(workModeSet),
    locationPrecisionOptions: Array.from(locationModeSet),
  };
}

function hasApproximateLocation(job) {
  return job.travel_time === null || job.travel_time === undefined;
}

export function filterJobs(allJobs, activeFilters) {
  const { seniorityLevel, employmentType, work_mode, locationPrecision } =
    activeFilters;

  return allJobs.filter((job) => {
    const matchesSeniority =
      seniorityLevel.size === 0 || seniorityLevel.has(job.seniority);
    const matchesJobType =
      employmentType.size === 0 || employmentType.has(job.employment_type);
    const matchesWorkMode =
      work_mode.size === 0 || work_mode.has(job.work_mode);
    const matchesLocationPrecision =
      locationPrecision.size === 0 ||
      (locationPrecision.has("approximate") && hasApproximateLocation(job)) ||
      (locationPrecision.has("precise") && !hasApproximateLocation(job));

    return (
      matchesSeniority &&
      matchesJobType &&
      matchesWorkMode &&
      matchesLocationPrecision
    );
  });
}
