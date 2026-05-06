import { useState } from "react";
import { LogIn, Mail, Eye, EyeOff } from "lucide-react";
import { UseUser } from "../context/UserContext";
import AlertMessage from "../components/AlertMessage/AlertMessage";
import { gif } from "../assets";
import useFetch from "../hooks/useFetch";
import useAlert from "../hooks/useAlert";
import DonationPopup from "../components/DonationPopup/DonationPopup";

export default function LoginForm({
  setLoginSuccessPopup,
  switchToSignup,
  switchToForgotPassword,
}) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { alert, setAlert, clearAlert } = useAlert();
  const [donationPopup, setDonationPopup] = useState(false);
  const { dispatch } = UseUser();

  function handleLoginResults(data) {
    const favoriteJobs = data.user.favorites;

    dispatch({
      type: "LOGIN",
      payload: {
        ...data.user,
        skills: data.user.skills,
        favorites: favoriteJobs,
      },
    });
    if (data.user.time_to_donate) {
      setDonationPopup(true);
    } else {
      setLoginSuccessPopup(true);
    }
  }

  const { isLoading, performFetch } = useFetch(
    "/users/login",
    handleLoginResults,
    (errorMessage) => {
      setAlert({ type: "error", message: String(errorMessage) });
      setLoginSuccessPopup(false);
      setDonationPopup(false);
    },
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    clearAlert();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    performFetch({
      method: "POST",
      body: {
        email: loginData.email,
        password: loginData.password,
      },
      credentials: "include",
    });
  }

  return (
    <div className="form-card" id="login-form">
      <form onSubmit={handleSubmit}>
        <label>
          Email <span style={{ color: "red", marginLeft: "2px" }}>*</span>
        </label>
        <div className="input-wrapper">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={loginData.email}
            onChange={handleChange} // call handleChange
            required
            style={{ paddingRight: "35px" }}
          />
          <Mail size={18} className="input-icon-right" />
        </div>
        <label>
          Password <span style={{ color: "red", marginLeft: "2px" }}>*</span>
        </label>
        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleChange} //call handleChange
            required
            style={{ paddingRight: "35px" }}
          />
          {showPassword ? (
            <EyeOff
              size={18}
              className="input-icon-right"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye
              size={18}
              className="input-icon-right"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {alert.message && (
          <AlertMessage type={alert.type} message={alert.message} />
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span>Logging in...</span>
              <img src={gif.spinner} className="spinner" />
            </>
          ) : (
            <>
              <LogIn size={16} style={{ marginRight: "5px" }} />
              Login
            </>
          )}
        </button>
      </form>

      <p className="switch-text">
        Don’t have a profile?{" "}
        <span className="switch-link" onClick={switchToSignup}>
          Sign Up
        </span>
      </p>
      <p className="forgot-text">
        <a
          href="#"
          className="forgot-link"
          onClick={(e) => {
            e.preventDefault(); // prevent page reload
            switchToForgotPassword();
          }}
        >
          Forgot Password?
        </a>
      </p>
      <p
        className="gdpr-text"
        style={{
          fontSize: "12px",
          marginTop: "10px",
          color: "#666",
          lineHeight: "1.4",
        }}
      >
        By signing up, you agree to the{" "}
        <a
          href="https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0070f3", textDecoration: "underline" }}
        >
          GDPR & Privacy Policy
        </a>
        . We handle your data according to GDPR rules. Your information is
        secure and will be deleted if you remove your account.
      </p>
      {donationPopup && (
        <DonationPopup onClose={() => setDonationPopup(false)} />
      )}
    </div>
  );
}
