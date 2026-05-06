import { useState, useEffect } from "react";
import useAlert from "../../hooks/useAlert";
import SkillsSettings from "../../components/SkillsSettings/SkillsSettings";
import AddressSettings from "../../components/AddressSettings/AddressSettings";
import AlertMessage from "../../components/AlertMessage/AlertMessage";
import ChangePassword from "../../components/ChangePassword";
import cleanUpText from "../../util/cleanUpText";
import validateAddressTextInputs from "../../util/addressTextsValidation";
import validateHouseNoInput from "../../util/addressHouseNoValidation";
import {
  validatePassword,
  validatePasswordMatch,
} from "../../util/AuthValidation";
import { UseUser } from "../../context/UserContext";
import useFetch from "../../hooks/useFetch";
import AvatarUploader from "../../components/AvatarUploader/AvatarUploader";
import DeleteProfilePopup from "../../components/DeleteProfilePopup/DeleteProfilePopup";
import "./Profile.css";
import { gif } from "../../assets/index.js";

export default function Profile() {
  const { alert, setAlert, clearAlert, delayedClearAlert } = useAlert();
  const { user, dispatch } = UseUser();
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setStreet(user.street);
    setHouseNumber(String(user.house_number ?? ""));
    setCity(user.city);
    setCountry(user.country);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [user]);

  const { isLoading, performFetch } = useFetch(
    "/users/profile",
    (data) => {
      dispatch({
        type: "UPDATE_USER",
        payload: {
          ...data.user,
          skills: Array.isArray(data.user.skills) ? data.user.skills : [],
        },
      });
      setAlert({ type: "success", message: "Profile updated successfully!" });
      delayedClearAlert();
    },
    (errorMessage) => {
      setAlert({ type: "error", message: String(errorMessage) });
      delayedClearAlert();
    },
  );

  function handleDeleteClick() {
    setShowDeletePopup(true);
  }

  function getPasswordInputs() {
    return {
      current: currentPassword,
      new: newPassword,
      confirm: confirmPassword,
    };
  }

  /**
   * False when user started filling the password triple but omitted a field (invalid for save).
   * True when all three are empty or all three are filled.
   */
  function validatePasswordChange(passwords) {
    const { current, new: newPass, confirm } = passwords;
    const hasAnyPassword = [current, newPass, confirm].some(Boolean);
    const hasAllPasswords = [current, newPass, confirm].every(Boolean);
    return !(hasAnyPassword && !hasAllPasswords);
  }

  function getPasswordChangeValues() {
    const passwords = getPasswordInputs();
    const { current, new: newPass, confirm } = passwords;

    let result = {
      passwordValidationError: null,
      currentPassword: null,
      newPassword: null,
    };

    if (!validatePasswordChange(passwords)) {
      result.passwordValidationError = {
        type: "error",
        message: "To change your password, please fill in all fields.",
      };
      return result;
    }

    const hasAnyPassword = [current, newPass, confirm].some(Boolean);
    if (!hasAnyPassword) {
      return result;
    }

    if (!validatePassword(newPass)) {
      result.passwordValidationError = {
        type: "error",
        message:
          "Password must be at least 8 characters and meet at least 2 complexity rules.",
      };
      return result;
    }

    const matchCheck = validatePasswordMatch(newPass, confirm);
    if (!matchCheck.valid) {
      result.passwordValidationError = {
        type: "error",
        message: matchCheck.message,
      };
      return result;
    }

    result.currentPassword = current;
    result.newPassword = newPass;
    return result;
  }

  function handleSaveClick() {
    clearAlert();

    const {
      passwordValidationError,
      currentPassword: pwdCurrent,
      newPassword: pwdNew,
    } = getPasswordChangeValues();

    const updatedFields = {};

    const first_name = cleanUpText(firstName);
    const last_name = cleanUpText(lastName);
    const streetVal = cleanUpText(street);
    const house_number = cleanUpText(houseNumber);
    const cityVal = cleanUpText(city);
    const countryVal = cleanUpText(country);

    const streetValidationError = validateAddressTextInputs({
      text: streetVal,
    });
    const cityValidationError = validateAddressTextInputs({
      text: cityVal,
      type: "city",
    });
    const countryValidationError = validateAddressTextInputs({
      text: countryVal,
      type: "country",
    });
    const houseValidationError = validateHouseNoInput({ text: house_number });

    const validationError =
      streetValidationError ||
      cityValidationError ||
      countryValidationError ||
      houseValidationError ||
      passwordValidationError;

    if (validationError) {
      setAlert(validationError);
      delayedClearAlert();
    } else {
      if (first_name !== user.first_name) updatedFields.first_name = first_name;
      if (last_name !== user.last_name) updatedFields.last_name = last_name;
      if (streetVal !== user.street) updatedFields.street = streetVal;
      if (cityVal !== user.city) updatedFields.city = cityVal;
      if (countryVal !== user.country) updatedFields.country = countryVal;
      const savedHouseNumber = cleanUpText(String(user.house_number ?? ""));
      if (house_number !== savedHouseNumber) {
        updatedFields.house_number = house_number;
      }
      if (pwdCurrent && pwdNew) {
        updatedFields.currentPassword = pwdCurrent;
        updatedFields.newPassword = pwdNew;
      }

      if (Object.keys(updatedFields).length === 0) {
        setAlert({ type: "info", message: "No changes detected." });
        delayedClearAlert();
      } else {
        performFetch({
          method: "PUT",
          body: updatedFields,
          credentials: "include",
        });
      }
    }
  }

  function pressEnterKey(e) {
    if (e.key === "Enter") handleSaveClick();
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>

      <div className="profile-avatar-row">
        {/* <!-- Avatar with the editing/updating button --> */}
        <AvatarUploader
          setAlert={setAlert}
          delayedClearAlert={delayedClearAlert}
        />
        <div className="avatar-uploader-info">
          <h3 className="avatar-uploader-title">Profile photo</h3>
          <span className="avatar-uploader-subtitle">
            Upload a new profile picture
          </span>
        </div>
      </div>

      <div className="flex-grow">
        {/* <!-- First and Last Name --> */}
        <h3 className="basic-info-title">Basic information</h3>
        <div className="profile-fields">
          <div className="profile-info-left">
            <label className="profile-field-label">First name</label>
            <input
              type="text"
              value={firstName}
              className="profile-input"
              onKeyDown={pressEnterKey}
              onChange={(e) => {
                clearAlert();
                setFirstName(e.target.value);
              }}
            />
          </div>
          <div className="profile-info">
            <label className="profile-field-label">Last name</label>
            <input
              type="text"
              value={lastName}
              className="profile-input"
              onKeyDown={pressEnterKey}
              onChange={(e) => {
                clearAlert();
                setLastName(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Address</h3>
        <AddressSettings
          street={street}
          houseNumber={houseNumber}
          city={city}
          country={country}
          onStreetChange={setStreet}
          onHouseNumberChange={setHouseNumber}
          onCityChange={setCity}
          onCountryChange={setCountry}
          onKeyDown={pressEnterKey}
          clearAlert={clearAlert}
        />
      </div>

      <ChangePassword
        onKeyDown={pressEnterKey}
        clearAlert={clearAlert}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        isLoading={isLoading}
      />
      {/* <!-- Save Button --> */}
      <div className="profile-save-row">
        {alert.message && (
          <div className="md:w-auto">
            <AlertMessage type={alert.type} message={alert.message} />
          </div>
        )}
        <div>
          <button
            id="saveBtn"
            onClick={handleSaveClick}
            className="profile-save-btn"
          >
            Save
            {isLoading && (
              <img src={gif.spinner} alt="Loading..." className="spinner" />
            )}
          </button>
        </div>
      </div>
      <SkillsSettings />
      {/* DELETE PROFILE */}
      <div className="profile-delete-row">
        <div>
          <h3 className="profile-delete-title">Delete profile</h3>
          <p className="profile-delete-desc">
            Permanently delete your account and data.
          </p>
        </div>
        <button onClick={handleDeleteClick} className="profile-delete-btn">
          Delete profile
        </button>
      </div>
      {showDeletePopup && (
        <DeleteProfilePopup setShowDeletePopup={setShowDeletePopup} />
      )}
    </div>
  );
}
