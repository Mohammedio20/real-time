import moment from "moment";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadProfilePic } from "../../apiCalls/users";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import { setUser } from "../../redux/userSlice";

function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [imagePreview, setImagePreview] = useState(null);
  const dispatch = useDispatch();
  const image = imagePreview ?? user?.photo;

  function getInitial() {
    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`
      .trim()
      .toUpperCase();
    return initials || "?";
  }
  function getFullName() {
    let fname =
      user?.firstName.at(0).toUpperCase() +
      user?.firstName.slice(1).toLowerCase();
    let lname =
      user?.lastName?.at(0).toUpperCase() +
      user?.lastName.slice(1).toLowerCase();
    return fname + " " + lname;
  }

  const onFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 7 * 1024 * 1024) {
      toast.error("Choose an image smaller than 7 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
  };

  const updateProfilePic = async () => {
    if (!imagePreview) {
      toast.error("Please select an image first.");
      return;
    }

    try {
      dispatch(showLoader());
      const response = await uploadProfilePic(imagePreview);
      if (response.status === "success") {
        toast.success(response.message);
        dispatch(setUser(response.data.user));
        setImagePreview(null);
      } else {
        toast.error(response.message || "Unable to update profile photo.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to update profile photo.",
      );
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-pic-container">
        {image && (
          <img
            src={image}
            alt="Profile Pic"
            className="user-profile-pic-upload"
          />
        )}
        {!image && (
          <div className="user-default-profile-avatar">{getInitial()}</div>
        )}
      </div>

      <div className="profile-info-container">
        <div className="user-profile-name">
          <h1>{getFullName()}</h1>
        </div>
        <div>
          <b>Email: </b>
          {user?.email}
        </div>
        <div>
          <b>Account Created: </b>
          {moment(user?.createdAt).format("MMM DD YYYY")}
        </div>
        <div className="select-profile-pic-container">
          <input type="file" accept="image/*" onChange={onFileSelect} />
          <button
            type="button"
            className="upload-image-btn"
            onClick={updateProfilePic}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
