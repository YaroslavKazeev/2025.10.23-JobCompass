import { UseUser } from "./UserContext";
import { createContext, useContext, useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";

const JobsContext = createContext();
function UseJobs() {
  return useContext(JobsContext);
}

function JobsProvider({ children }) {
  const { user } = UseUser();
  const [allJobs, setAllJobs] = useState([]);
  const [searchString, setSearchString] = useState(""); //  global search term
  const [serverMessage, setServerMessage] = useState("");

  // Clear jobs when user logs in/out
  useEffect(() => {
    setAllJobs([]);
  }, [user.id]);

  // jobs fetch
  const {
    isLoading: isJobsLoading,
    error: jobFetchError,
    performFetch: performJobFetch,
  } = useFetch("/jobs/search", (data) => {
    setAllJobs(data.result);
    if (data.msg) {
      setServerMessage(data.msg);
    }
    fetchBatchTravelDetails(data.result);
  });

  // travel details fetch
  function getCitiesToFetch(jobsArray) {
    return [
      ...new Set(jobsArray.map((job) => job.display_location).filter(Boolean)),
    ];
  }

  async function handleTravelFetchResults(data) {
    if (data.result && Array.isArray(data.result.travelDetails)) {
      const travelDetailsMap = {};
      data.result.travelDetails.forEach(
        ({ workCity, travel_time, least_transfers }) => {
          travelDetailsMap[workCity] = {
            travel_time,
            least_transfers,
          };
        },
      );
      setAllJobs((prevJobs) =>
        prevJobs.map((job) => {
          const workCity = job.display_location;
          return {
            ...job,
            travel_time: travelDetailsMap[workCity]?.travel_time,
            least_transfers: travelDetailsMap[workCity]?.least_transfers,
          };
        }),
      );
    }
  }

  const {
    isLoading: isTravelLoading,
    error: travelFetchError,
    performFetch: performTravelFetch,
  } = useFetch("/travel/batch", handleTravelFetchResults);

  async function fetchBatchTravelDetails(jobsArray) {
    const citiesToFetch = getCitiesToFetch(jobsArray);
    if (citiesToFetch.length === 0) {
      return;
    }

    const homeAddress = {
      homeStreet: user?.street,
      homeHouseNumber: user?.house_number,
      homeCity: user?.city,
      homeCountry: user?.country,
    };

    performTravelFetch({
      method: "POST",
      body: JSON.stringify({ homeAddress, workCities: citiesToFetch }),
    });
  }

  return (
    <JobsContext.Provider
      value={{
        allJobs,
        setAllJobs,
        isJobsLoading,
        jobFetchError,
        isTravelLoading,
        travelFetchError,
        searchString,
        setSearchString,
        performJobFetch,
        serverMessage,
        setServerMessage,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export { JobsProvider, UseJobs };
