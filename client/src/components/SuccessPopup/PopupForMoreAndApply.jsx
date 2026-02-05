import handleKeyDown from "../../util/handleKeyDown";

export default function PopupForMoreAndApply({
  handleLoginRedirect,
  setShowPopup,
}) {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h2>Want to apply for this job?</h2>
        <p>Log in to hop on board!</p>
        <div className="popup-buttons">
          <button
            className="btn-primary"
            autoFocus
            onClick={handleLoginRedirect}
            onKeyDown={(e) => handleKeyDown(e, handleLoginRedirect)}
          >
            Log in
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowPopup(false)}
            onKeyDown={(e) => handleKeyDown(e, () => setShowPopup(false))}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
