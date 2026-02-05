import { Link } from "react-router-dom";
import SearchInput from "../../components/SearchInput/SearchInput";
import "./JobSearch.css";
import { defaultUser } from "../../data/defaultUser.js";
import { formatAddress } from "../../data/defaultUser.js";
import { UseUser } from "../../context/UserContext";
import AlertMessage from "../../components/AlertMessage/AlertMessage";

export default function JobSearch() {
  const displayedSkills = defaultUser.skills
    .map((s) => s.skill)
    .slice(0, 3)
    .join(", ");
  const { user } = UseUser();

  return (
    <div className="job-search-container">
      <div className="mission-section">
        <h1>
          Master navigating the sea of irrelevant jobs with{" "}
          <span>JobCompass</span>
        </h1>
        <p className="subtitle">
          Tell us your skills, role, location, and we’ll steer you to the right
          job with the least commute time
        </p>
      </div>
      <SearchInput />
      {(!user || !user.id) && (
        <div className="guest-notice">
          <AlertMessage
            type="info"
            message={`Guest mode is limited to default settings — general skills such as ${displayedSkills.toLowerCase()}, and others, along with the guest’s home address ${formatAddress(defaultUser)}, and may provide as few as five job posts.`}
          />
          <p style={{ textAlign: "center" }}>
            <Link to="/login" className="login-link">
              Log in
            </Link>
            <span> to get more relevant results!</span>
          </p>
        </div>
      )}
    </div>
  );
}
