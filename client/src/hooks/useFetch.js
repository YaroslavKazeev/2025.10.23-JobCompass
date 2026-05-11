import { useState } from "react";

/**
 * Our useFetch hook should be used for all communication with the server.
 *
 * route - This is the route you want to access on the server. It should NOT include the /api part, so should be /user or /user/{id}
 * onReceived - a function that will be called with the response of the server. Will only be called if everything went well!
 *
 * Our hook will give you an object with the properties:
 *
 * isLoading - true if the fetch is still in progress
 * performFetch - this function will trigger the fetching. It is up to the user of the hook to determine when to do this!
 */
export default function useFetch(route, onReceived, onError = () => {}) {
  const [isLoading, setIsLoading] = useState(false);

  // Add any args given to the function to the fetch function
  function performFetch(options) {
    setIsLoading(true);

    const isFormData = options?.body instanceof FormData;
    const isObject =
      options?.body && typeof options.body === "object" && !isFormData;

    const baseOptions = {
      method: "GET",
      headers: isFormData
        ? {}
        : {
            "content-type": "application/json",
          },
    };

    if (isObject) {
      options.body = JSON.stringify(options.body);
    }

    async function fetchData() {
      // We add the /api subsection here to make it a single point of change if our configuration changes

      try {
        const url = `/api${route}`;
        const res = await fetch(url, { ...baseOptions, ...options });
        let jsonResult = null;
        try {
          jsonResult = await res.json();
        } catch (err) {
          console.error("Error parsing JSON response for URL:", url, err);
        }

        if (jsonResult?.success) {
          onReceived(jsonResult);
        } else {
          onError(jsonResult?.msg || "The backend returned an error");
        }

        setIsLoading(false);
      } catch (error) {
        onError(error?.message || "An error occurred during fetch");
        setIsLoading(false);
      }
    }

    fetchData();
  }

  return { isLoading, performFetch };
}
