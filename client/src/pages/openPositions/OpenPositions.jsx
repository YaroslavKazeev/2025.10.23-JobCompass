// React hooks
import { useMemo, useState, useEffect } from "react";
// Lucide React icons
import { GraduationCap, Briefcase, Monitor, MapPin } from "lucide-react";
// Components
import AlertMessage from "../../components/AlertMessage/AlertMessage";
import DropdownFilter from "../../components/DropdownFilter/DropdownFilter";
import DropdownSort from "../../components/DropdownSort/DropdownSort";
import JobCard from "../../components/JobCard/JobCard";
import Pagination from "../../components/Pagination/Pagination";
import SkillsSettings from "../../components/SkillsSettings/SkillsSettings";
// Context
import { UseJobs } from "../../context/JobsContext";
import { UseUser } from "../../context/UserContext";
// Utils
import createSortComparator from "../../util/createSortComparator";
import { DELAYED_CLEAR_INTERVAL } from "../../util/constants";
import { findFilterOptions, filterJobs } from "../../util/filterJobs";
import getSkillsInDescription from "../../util/getSkillsInDescription";
// Assets
import { gif } from "../../assets/index.js";
// Styles
import "./OpenPositions.css";

export default function OpenPositions() {
  const { user } = UseUser();
  const [alert, setAlert] = useState({ type: "", message: "" });

  const {
    allJobs,
    searchString,
    isJobsLoading,
    jobFetchError,
    travelFetchError,
    serverMessage,
    setServerMessage,
  } = UseJobs();

  const favorites = Array.isArray(user?.favorites) ? user.favorites : [];
  const skills = user?.skills || [];

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  const [activeFilters, setActiveFilters] = useState({
    seniorityLevel: new Set(),
    employmentType: new Set(),
    work_mode: new Set(),
    locationPrecision: new Set(),
  });

  const [selectedSort, setSelectedSort] = useState([
    "Fewest transport transfers",
    "Nearest first",
    "Most skill matches",
    "Newest first",
  ]);

  function handleClearAlert() {
    setAlert({ type: "", message: "" });
  }

  function delayedClearAlert() {
    setTimeout(() => {
      handleClearAlert();
    }, DELAYED_CLEAR_INTERVAL);
  }

  useEffect(() => {
    if (jobFetchError) {
      setAlert({ type: "error", message: String(jobFetchError) });
      delayedClearAlert();
    } else if (travelFetchError) {
      setAlert({ type: "error", message: String(travelFetchError) });
      delayedClearAlert();
    } else if (serverMessage) {
      setAlert({ type: "info", message: serverMessage });
      setServerMessage("");
      delayedClearAlert();
    }
  }, [jobFetchError, travelFetchError, serverMessage, setServerMessage]);

  const jobsWithSkills = useMemo(() => {
    return allJobs.map((job) => {
      const skillsInDescription = getSkillsInDescription(
        job.normalized_description || "",
        skills,
      );
      return {
        ...job,
        skillsInDescription,
        skillsMatch: String(skillsInDescription.length).padStart(2, "0"),
      };
    });
  }, [allJobs, skills]);

  const filterOptions = useMemo(() => {
    return findFilterOptions(allJobs);
  }, [allJobs]);

  function handleFilterChange(filterKey, value, isChecked) {
    setActiveFilters((prev) => {
      const newSet = new Set(prev[filterKey]);
      isChecked ? newSet.add(value) : newSet.delete(value);
      setCurrentPage(1);
      return { ...prev, [filterKey]: newSet };
    });
  }

  function handleClearFilters() {
    setActiveFilters({
      seniorityLevel: new Set(),
      employmentType: new Set(),
      work_mode: new Set(),
      locationPrecision: new Set(),
    });
    setCurrentPage(1);
  }

  const sortedJobs = useMemo(() => {
    const result =
      selectedSort.length === 0
        ? jobsWithSkills
        : [...jobsWithSkills].sort(createSortComparator(selectedSort));
    return result;
  }, [jobsWithSkills, selectedSort]);

  const filteredJobs = useMemo(() => {
    return filterJobs(sortedJobs, activeFilters);
  }, [sortedJobs, activeFilters]);

  //pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  return (
    <div className="open-positions content-container">
      {isJobsLoading && (
        <div className="loader-overlay">
          <img src={gif.boat} alt="Loading..." className="loader-gif" />
        </div>
      )}

      <div className="open-positions">
        <SkillsSettings />
        <div className="job-filters-bar">
          <div className="filters-container">
            <DropdownSort
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
            />
            <div className="filter-dropdowns">
              <DropdownFilter
                filterKey="seniorityLevel"
                label="Experience"
                options={filterOptions.experienceOptions}
                activeValues={activeFilters.seniorityLevel}
                onFilterChange={handleFilterChange}
                icon={<GraduationCap />}
              />
              <DropdownFilter
                filterKey="employmentType"
                label="Job type"
                options={filterOptions.jobTypeOptions}
                activeValues={activeFilters.employmentType}
                onFilterChange={handleFilterChange}
                icon={<Briefcase />}
              />
              <DropdownFilter
                filterKey="work_mode"
                label="Work mode"
                options={filterOptions.workModeOptions}
                activeValues={activeFilters.work_mode}
                onFilterChange={handleFilterChange}
                icon={<Monitor />}
              />
              <DropdownFilter
                filterKey="locationPrecision"
                label="Location"
                options={filterOptions.locationPrecisionOptions}
                activeValues={activeFilters.locationPrecision}
                onFilterChange={handleFilterChange}
                icon={<MapPin />}
              />
              <button
                onClick={handleClearFilters}
                className="clear-filters-btn"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>

        {alert.message && (
          <div className="md:w-auto">
            <AlertMessage type={alert.type} message={alert.message} />
          </div>
        )}

        {!isJobsLoading && filteredJobs.length === 0 && (
          <div className="md:w-auto">
            <AlertMessage
              type="info"
              message="No jobs are shown. Go to Job search or Clear filters to see more results."
            />
          </div>
        )}

        {!isJobsLoading && filteredJobs.length > 0 && (
          <>
            <p className="job-message">
              Found {allJobs.length} jobs in total for {searchString}.
              {!Object.values(activeFilters).every(
                (filterSet) => filterSet.size === 0,
              ) && ` Filtered ${filteredJobs.length} jobs`}
            </p>
            <ul className="jobs-list">
              {currentJobs.map((job, idx) => (
                <JobCard
                  key={job.id || idx}
                  job={job}
                  isInFavorites={favorites.some((fav) => fav.id === job.id)}
                  onApplyClick={(url) => window.open(url, "_blank")}
                />
              ))}
            </ul>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
