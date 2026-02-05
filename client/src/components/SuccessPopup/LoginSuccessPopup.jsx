import { useNavigate } from "react-router-dom";
import handleKeyDown from "../../util/handleKeyDown";

export default function LoginSuccessPopup({ onClose }) {
  const navigate = useNavigate();

  function handleContinue() {
    onClose(); // Close the popup
    navigate("/"); // Redirect to home page
  }

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <h2>Success!</h2>
        <p>You successfully logged in!</p>
        <div className="popup-buttons">
          <button
            className="btn-primary"
            autoFocus
            onClick={handleContinue}
            onKeyDown={(e) => handleKeyDown(e, handleContinue)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
