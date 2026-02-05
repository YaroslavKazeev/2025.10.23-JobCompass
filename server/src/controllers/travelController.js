import { logError, logWarning } from "../util/logging.js";
import getTransitRouteSummary from "../services/googleMapsApi.js";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatAddress(address) {
  const streetAddress = [
    address?.homeStreet,
    address?.homeStreet && address?.homeHouseNumber,
    address?.homeCity,
  ]
    .filter(Boolean)
    .join(" ");

  return [streetAddress, address?.homeCountry].filter(Boolean).join(", ");
}

const workPlacesSet = new Set([
  "Brabantine City Row",
  "Drenthe, Netherlands",
  "Flevoland, Netherlands",
  "Friesland, Netherlands",
  "Gelderland, Netherlands",
  "Groningen, Netherlands",
  "Limburg, Netherlands",
  "Netherlands",
  "Noord-Brabant, Netherlands",
  "Noord-Holland, Netherlands",
  "Overijssel, Netherlands",
  "Utrecht, Netherlands",
  "Zeeland, Netherlands",
  "Zuid-Holland, Netherlands",
]);

export default async function calculateBatchTravelTime(req, res) {
  try {
    const { homeAddress, workCities } = req.body || {};

    if (!homeAddress || !workCities || !Array.isArray(workCities)) {
      logWarning("Invalid request body for batch travel calculation");
      return res.status(400).json({
        success: false,
        msg: "Missing homeAddress or workCities array",
      });
    }

    const { homeCity } = homeAddress;
    const formattedHomeAddress = formatAddress(homeAddress);

    const re = homeCity
      ? new RegExp(escapeRegExp(" " + homeCity + " "), "i")
      : null;

    // Filter out non-string work cities and process
    const validWorkCities = workCities.filter(
      (city) => typeof city === "string",
    );

    const promises = validWorkCities.map((workCity) => {
      const normalizedWorkCity = workCity.replace(",", " ");
      if (re && re.test(" " + normalizedWorkCity + " ")) {
        return Promise.resolve({
          workCity,
          travel_time: 0,
          least_transfers: 0,
        });
      }
      if (workPlacesSet.has(workCity)) {
        return Promise.resolve({
          workCity,
          travel_time: null,
          least_transfers: null,
        });
      }
      return getTransitRouteSummary(formattedHomeAddress, workCity)
        .then((travelData) => {
          return {
            workCity,
            travel_time: Math.round(travelData.travel_time),
            least_transfers: travelData.least_transfers,
          };
        })
        .catch((error) => {
          logWarning(`Travel fetch failed for ${workCity}: ${error.message}`);
          return {
            workCity,
            error: error.message,
          };
        });
    });

    const results = await Promise.all(promises);
    return res.status(200).json({
      success: true,
      result: {
        homeAddress: formattedHomeAddress,
        travelDetails: results,
      },
    });
  } catch (error) {
    logError(`Batch travel calculation error: ${error}`);
    return res.status(500).json({
      success: false,
      msg: "An unexpected error occurred during travel calculation",
      error: error.message,
    });
  }
}
