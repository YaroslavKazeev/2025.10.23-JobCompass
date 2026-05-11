import { useRef, useState } from "react";
import useFetch from "../../hooks/useFetch";
import useAlert from "../../hooks/useAlert";
import { gif } from "../../assets/index.js";
import AlertMessage from "../AlertMessage/AlertMessage";
import { UseUser } from "../../context/UserContext";
import validateSkillInput from "../../util/skillValidation";
import normalizeText from "../../../../shared/normalizeText.js";

export default function AIPopup({ setShowAll, onClose, setAiSkills }) {
  const { user } = UseUser();
  const [aiInputText, setAiInputText] = useState("");
  const { alert, setAlert, clearAlert, delayedClearAlert } = useAlert();
  const isCVRef = useRef(true);

  const { isLoading, performFetch } = useFetch(
    "/ai/assist-skills",
    (result) => {
      if (
        result.skills &&
        Array.isArray(result.skills) &&
        result.skills.length > 0
      ) {
        const acceptedSkills = [];

        const filtered = result.skills
          .filter((skill) => {
            const validationError = validateSkillInput({
              skill,
              skills: [...(user?.skills ?? []), ...acceptedSkills],
            });
            if (validationError) {
              return false;
            }
            acceptedSkills.push(skill);
            return true;
          })
          .sort((a, b) => normalizeText(a).localeCompare(normalizeText(b)));

        if (filtered.length === 0) {
          setAlert({
            type: "warning",
            message:
              "AI returned skills, but they do not pass validation checks or are already in your list.",
          });
          delayedClearAlert();
          setAiSkills([]);
        } else {
          setAiSkills(filtered);
        }
        setShowAll(true);
        onClose();
      } else {
        setAlert({
          type: "error",
          message: "AI failed to return any skills. Please try again.",
        });
        delayedClearAlert();
        setAiSkills([]);
      }
    },
    (errorMessage) => {
      setAlert({
        type: "error",
        message: String(errorMessage || "AI service returned an error."),
      });
      delayedClearAlert();
    },
  );

  async function handleGetSkills(isCV) {
    clearAlert();
    isCVRef.current = isCV;

    performFetch({
      method: "POST",
      body: { isCV, prompt: aiInputText },
    });
  }

  return (
    <div className="ai-popup-overlay">
      <div className="ai-popup">
        <div className="ai-popup-header">
          <h2>AI Assistance</h2>
          <button
            className="ai-popup-close"
            onClick={onClose}
            aria-label="Close AI assistance popup"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="ai-popup-content">
          <p className="ai-popup-cta">
            Paste your CV here or enter the title of your aimed position.
          </p>
          <textarea
            className="ai-popup-textarea"
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            placeholder="Enter your CV text or job title here..."
            rows="8"
          />
          {alert.message && (
            <AlertMessage type={alert.type} message={alert.message} />
          )}
          <div className="ai-popup-buttons">
            <button
              className="ai-popup-btn primary"
              onClick={() => handleGetSkills(true)}
              disabled={isLoading || !aiInputText.trim()}
            >
              {isLoading && isCVRef.current
                ? "Extracting..."
                : "Get skills from CV"}
              {isLoading && isCVRef.current && (
                <img src={gif.spinner} alt="Loading..." className="spinner" />
              )}
            </button>
            <button
              className="ai-popup-btn secondary"
              onClick={() => handleGetSkills(false)}
              disabled={isLoading || !aiInputText.trim()}
            >
              {isLoading && !isCVRef.current
                ? "Identifying..."
                : "Get typical job skills"}
              {isLoading && !isCVRef.current && (
                <img src={gif.spinner} alt="Loading..." className="spinner" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
