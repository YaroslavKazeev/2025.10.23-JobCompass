// React imports
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// Context, Component imports
import { UseUser } from "../../context/UserContext";
import AlertMessage from "../AlertMessage/AlertMessage";
import PopupForSave from "../SuccessPopup/PopupForSave";
import SkillsTipPopup from "../SuccessPopup/SkillsTipPopup";
import AIPopup from "./AIPopup";
// Hook & Utility imports
import useFetch from "../../hooks/useFetch";
import useAlert from "../../hooks/useAlert";
import cleanUpText from "../../util/cleanUpText";
import normalizeText from "../../../../shared/normalizeText";
import validateSkillInput from "../../util/skillValidation";
import { gif } from "../../assets/index.js";
// Styles
import "./SkillsSettings.css";

export default function SkillsSettings() {
  const navigate = useNavigate();
  const skillInputRef = useRef(null);
  const { alert, setAlert, clearAlert, delayedClearAlert } = useAlert();
  const [showAll, setShowAll] = useState(false);
  const [showTipPopup, setShowTipPopup] = useState(false);
  const maxVisible = 4;
  const { user, dispatch } = UseUser();
  const { skills } = user;
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [showAIPopup, setShowAIPopup] = useState(false);
  const handleSkillsResultsRef = useRef(() => {});
  const [aiSkills, setAiSkills] = useState([]);

  const { isLoading, performFetch } = useFetch(
    "/users/change-skills",
    (result) => handleSkillsResultsRef.current(result),
    (errorMessage) => {
      setAlert({ type: "error", message: String(errorMessage) });
      delayedClearAlert();
    },
  );

  function prepareSkillsUpdate(
    nextSkills,
    successMessage,
    alertType = "success",
  ) {
    handleSkillsResultsRef.current = async () => {
      dispatch({
        type: "SET_SKILLS",
        payload: nextSkills,
      });
      setAlert({
        type: alertType,
        message: successMessage,
      });
    };
  }

  async function changeSkillsHelper(skills) {
    performFetch({
      method: "POST",
      body: { skills },
      credentials: "include",
    });
  }

  // -------------------- ADD SKILL --------------------
  async function addSkill(skill) {
    if (!user?.id) {
      setShowSavePopup(true);
      return;
    }
    let newAiSkills = [...aiSkills];
    const newSkill = cleanUpText(skill);
    const normalizedNewSkill = normalizeText(newSkill);
    const validationError = validateSkillInput({ skill: newSkill, skills });
    if (validationError) {
      setAlert(validationError);
      delayedClearAlert();
      return;
    }

    const combined = [...skills, newSkill].sort((a, b) =>
      normalizeText(a).localeCompare(normalizeText(b)),
    );
    newAiSkills = newAiSkills.filter(
      (aiSkill) => normalizeText(aiSkill) !== normalizedNewSkill,
    );
    setAiSkills(newAiSkills);

    prepareSkillsUpdate(
      combined,
      "The skill has been added to the user's profile!",
    );
    await changeSkillsHelper(combined);
    delayedClearAlert();
  }

  // -------------------- ADD ALL AI SKILLS --------------------
  async function addAllAIskills() {
    if (!user?.id) {
      setShowSavePopup(true);
      return;
    }

    const combined = [...skills, ...aiSkills].sort((a, b) =>
      normalizeText(a).localeCompare(normalizeText(b)),
    );
    setAiSkills([]);

    prepareSkillsUpdate(
      combined,
      "All AI suggestions have been added to the user's profile!",
    );

    await changeSkillsHelper(combined);
    delayedClearAlert();
  }

  async function handleInputSkill() {
    const skillInput = skillInputRef.current;
    if (skillInput) {
      await addSkill(skillInput.value);
      skillInput.value = "";
      skillInput.focus();
    }
  }

  // -------------------- REMOVE SKILL --------------------
  async function removeSkill(skill) {
    if (!user?.id) {
      setShowSavePopup(true);
      return;
    }
    const filtered = skills.filter((s) => s !== skill);

    prepareSkillsUpdate(
      filtered,
      "The skill has been removed from the user's profile!",
    );
    await changeSkillsHelper(filtered);
    delayedClearAlert();
  }
  // -------------------- REMOVE ALL SKILLS --------------------
  async function removeAllSkills() {
    setAiSkills([]);
    if (!user?.id) {
      setShowSavePopup(true);
    } else {
      prepareSkillsUpdate(
        [],
        "All skills have been removed from the user's profile!",
      );
      await changeSkillsHelper([]);
      delayedClearAlert();
    }
  }

  const visibleSkills = showAll ? skills : skills.slice(0, maxVisible);

  return (
    <div className="skills-container">
      <div className="skills-section">
        <h3 className="skills-heading">
          Skills
          <button
            className="skills-tip-btn"
            type="button"
            onClick={() => setShowTipPopup(true)}
            aria-label="Open skill matching tips"
            aria-haspopup="dialog"
          >
            Tips
          </button>
        </h3>
        {/* Skills management */}
        <div className="skills-controls">
          <input
            id="skillInput"
            ref={skillInputRef}
            type="text"
            placeholder="e.g. React, TypeScript, Docker"
            className="skill-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInputSkill();
            }}
            onChange={clearAlert}
          />

          <button
            id="addSkillBtn"
            onClick={handleInputSkill}
            className="add-skill-btn"
            type="button"
          >
            Add skill
            {isLoading && (
              <img src={gif.spinner} alt="Loading..." className="spinner" />
            )}
          </button>

          <button
            className="ai-assistance-btn"
            onClick={() => setShowAIPopup(true)}
            type="button"
          >
            AI assistance
          </button>

          <button
            id="removeAllSkillsBtn"
            onClick={removeAllSkills}
            className="remove-all-btn"
            type="button"
          >
            Remove all
            {isLoading && (
              <img src={gif.spinner} alt="Loading..." className="spinner" />
            )}
          </button>
        </div>

        {alert.message && (
          <AlertMessage type={alert.type} message={alert.message} />
        )}

        {/* Skills List */}
        <div className="skills-list-row">
          <div id="skillsList" className="skills-list">
            {visibleSkills.map((s, idx) => (
              <div key={`${s}-${idx}`} className="skill-item">
                <span className="skill-name">{s}</span>
                <button
                  className="skill-remove-btn"
                  onClick={() => removeSkill(s)}
                  aria-label={`Remove ${s}`}
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <img
                      src={gif.spinner}
                      alt="Loading..."
                      className="spinner"
                    />
                  ) : (
                    <svg
                      className="skill-remove-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
          {(skills.length > maxVisible || aiSkills.length > 0) && (
            <button
              className="show-all-btn"
              onClick={() => {
                if (showAll) {
                  setAiSkills([]);
                }
                setShowAll(!showAll);
              }}
              type="button"
            >
              {showAll ? "Collapse panel" : "Expand panel"}
              {showAll ? (
                <svg
                  className="show-all-icon"
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M3 10l5-5 5 5H3z" />
                </svg>
              ) : (
                <svg
                  className="show-all-icon"
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M3 6l5 5 5-5H3z" />
                </svg>
              )}
            </button>
          )}
        </div>
        {/* AI Suggested Skills List */}
        {showAll && aiSkills.length > 0 && (
          <div className="ai-skills-section">
            <h4 className="ai-skills-heading">AI Suggested Skills</h4>
            <div className="skills-list">
              {aiSkills.map((s, idx) => (
                <div key={`ai-${s}-${idx}`} className="skill-item">
                  <span className="skill-name">{s}</span>
                  <button
                    className="skill-remove-btn"
                    onClick={() => {
                      skillInputRef.current &&
                        (skillInputRef.current.value = s);
                      handleInputSkill();
                    }}
                    aria-label={`Add ${s}`}
                    type="button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <img
                        src={gif.spinner}
                        alt="Loading..."
                        className="spinner"
                      />
                    ) : (
                      <svg
                        className="skill-remove-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 5v14M5 12h14"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
              {aiSkills.length > 0 && (
                <button
                  className="add-all-ai-btn"
                  onClick={addAllAIskills}
                  type="button"
                  disabled={isLoading}
                >
                  Add all AI suggestions
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showTipPopup && (
        <SkillsTipPopup onClose={() => setShowTipPopup(false)} />
      )}

      {showSavePopup && (
        <PopupForSave
          title="You are not logged in"
          message="Please log in or sign up to manage your skills."
          handleLoginRedirect={() => {
            navigate("/login");
            setShowSavePopup(false);
          }}
          setShowSavePopup={setShowSavePopup}
        />
      )}
      {showAIPopup && (
        <AIPopup
          setShowAll={setShowAll}
          onClose={() => setShowAIPopup(false)}
          setAiSkills={setAiSkills}
        />
      )}
    </div>
  );
}
