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
 * error - will contain an Error object if something went wrong
 * performFetch - this function will trigger the fetching. It is up to the user of the hook to determine when to do this!
 * cancelFetch - this function will cancel the fetch, call it when your component is unmounted
 */
export default function useFetch(route, onReceived) {
  /**
   * We use the AbortController which is supported by all modern browsers to handle cancellations
   * For more info: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
   */
  const controller = new AbortController();
  const signal = controller.signal;
  function cancelFetch() {
    controller.abort();
  }

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add any args given to the function to the fetch function
  function performFetch(options) {
    setError(null);
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
        const res = await fetch(url, { ...baseOptions, ...options, signal });
        let jsonResult = null;
        try {
          jsonResult = await res.json();
        } catch (err) {
          console.error("Error parsing JSON response for URL:", url, err);
        }

        if (jsonResult && jsonResult.success === true) {
          onReceived(jsonResult);
        } else {
          setError(
            (jsonResult && jsonResult.msg) ||
              `The result from our backend did not have an error message. Received: ${JSON.stringify(
                jsonResult,
              )}`,
          );
        }

        setIsLoading(false);
      } catch (error) {
        setError(error.message || "An error occurred during fetch");
        setIsLoading(false);
      }
    }

    fetchData();
  }

  return { isLoading, error, performFetch, cancelFetch };
}
