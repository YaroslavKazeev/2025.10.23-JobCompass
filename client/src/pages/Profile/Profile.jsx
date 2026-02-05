import { useState, useRef, useEffect } from "react";
import SkillsSettings from "../../components/SkillsSettings/SkillsSettings";
import AddressSettings from "../../components/AddressSettings/AddressSettings";
import AlertMessage from "../../components/AlertMessage/AlertMessage";
import ChangePassword from "../../components/ChangePassword";
import cleanUpText from "../../util/cleanUpText";
import validateAddressTextInputs from "../../util/addressTextsValidation";
import validateHouseNoInput from "../../util/addressHouseNoValidation";
import { UseUser } from "../../context/UserContext";
import useFetch from "../../hooks/useFetch";
import fixUserSkills from "../../util/fixUserSkills";
import AvatarUploader from "../../components/AvatarUploader/AvatarUploader";
import DeleteProfilePopup from "../../components/DeleteProfilePopup/DeleteProfilePopup";
import { DELAYED_CLEAR_INTERVAL } from "../../util/constants";
import "./Profile.css";
import { gif } from "../../assets/index.js";

export default function Profile() {
  const [alert, setAlert] = useState({ type: "", message: "" });
  const first_nameInputRef = useRef(null);
  const last_nameInputRef = useRef(null);
  const changePasswordRef = useRef(null);
  const streetInputRef = useRef(null);
  const houseInputRef = useRef(null);
  const cityInputRef = useRef(null);
  const countryInputRef = useRef(null);
  const { user, dispatch } = UseUser();
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  function handleClearAlert() {
    setAlert({ type: "", message: "" });
  }

  function delayedClearAlert() {
    setTimeout(() => {
      handleClearAlert();
    }, DELAYED_CLEAR_INTERVAL);
  }

  const {
    error: updateProfileError,
    isLoading: isUpdateLoading,
    performFetch: performUpdateProfile,
  } = useFetch("/users/profile", (data) => {
    dispatch({
      type: "UPDATE_USER",
      payload: {
        ...data.user,
        skills: fixUserSkills(data.user.skills),
      },
    });
    setAlert({ type: "success", message: "Profile updated successfully!" });
    delayedClearAlert();
  });

  useEffect(() => {
    if (updateProfileError)
      setAlert({ type: "error", message: String(updateProfileError) });
    delayedClearAlert();
  }, [updateProfileError]);

  useEffect(() => {
    if (
      first_nameInputRef.current &&
      last_nameInputRef.current &&
      streetInputRef.current &&
      houseInputRef.current &&
      cityInputRef.current &&
      countryInputRef.current
    ) {
      first_nameInputRef.current.value = user.first_name;
      last_nameInputRef.current.value = user.last_name;
      streetInputRef.current.value = user.street;
      houseInputRef.current.value = user.house_number;
      cityInputRef.current.value = user.city;
      countryInputRef.current.value = user.country;
    }
  }, [user]);

  function handleDeleteClick() {
    setShowDeletePopup(true);
  }

  function handlePasswordChangeSuccess() {
    setAlert({
      type: "success",
      message: "Password changed successfully!",
    });
    delayedClearAlert();
  }

  function handlePasswordChangeError(message) {
    setAlert({ type: "error", message: String(message) });
    delayedClearAlert();
  }

  async function handleSaveClick() {
    handleClearAlert();

    const passwordResult =
      await changePasswordRef.current.handlePasswordChange();

    const updatedFields = {};

    const first_name = cleanUpText(first_nameInputRef?.current.value);
    const last_name = cleanUpText(last_nameInputRef?.current.value);
    const street = cleanUpText(streetInputRef?.current.value);
    const house_number = cleanUpText(houseInputRef?.current.value);
    const city = cleanUpText(cityInputRef?.current.value);
    const country = cleanUpText(countryInputRef?.current.value);

    if (first_name !== user.first_name) updatedFields.first_name = first_name;
    if (last_name !== user.last_name) updatedFields.last_name = last_name;

    const streetValidationError = validateAddressTextInputs({ text: street });
    const cityValidationError = validateAddressTextInputs({
      text: city,
      type: "city",
    });
    const countryValidationError = validateAddressTextInputs({
      text: country,
      type: "country",
    });
    const houseValidationError = validateHouseNoInput({ text: house_number });

    const validationError =
      streetValidationError ||
      cityValidationError ||
      countryValidationError ||
      houseValidationError ||
      passwordResult.validationError;

    if (validationError) {
      setAlert({
        type: "error",
        message:
          validationError === passwordResult.validationError
            ? passwordResult.validationError
            : validationError,
      });
      delayedClearAlert();
    } else {
      if (street !== user.street) updatedFields.street = street;
      if (city !== user.city) updatedFields.city = city;
      if (country !== user.country) updatedFields.country = country;
      if (house_number !== user.house_number)
        updatedFields.house_number = house_number;

      if (Object.keys(updatedFields).length === 0) {
        if (passwordResult.inputsFilled === false)
          setAlert({ type: "info", message: "No changes detected." });
        delayedClearAlert();
      } else {
        performUpdateProfile({
          method: "PUT",
          body: JSON.stringify(updatedFields),
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
        <AvatarUploader setAlert={setAlert} />
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
              ref={first_nameInputRef}
              type="text"
              defaultValue={user?.first_name || ""}
              className="profile-input"
              onKeyDown={pressEnterKey}
              onChange={handleClearAlert}
            />
          </div>
          <div className="profile-info">
            <label className="profile-field-label">Last name</label>
            <input
              ref={last_nameInputRef}
              type="text"
              defaultValue={user?.last_name || ""}
              className="profile-input"
              onKeyDown={pressEnterKey}
              onChange={handleClearAlert}
            />
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Address</h3>
        <AddressSettings
          streetInputRef={streetInputRef}
          houseInputRef={houseInputRef}
          cityInputRef={cityInputRef}
          countryInputRef={countryInputRef}
          clearAlert={handleClearAlert}
        />
      </div>

      <ChangePassword
        ref={changePasswordRef}
        onKeyDown={pressEnterKey}
        onInputChange={handleClearAlert}
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
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
            {isUpdateLoading && (
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
