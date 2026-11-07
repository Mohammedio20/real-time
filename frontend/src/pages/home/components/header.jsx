import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../../redux/userSlice";

function Header({ socket }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.userReducer);

  function handleLogout() {
    localStorage.removeItem("token");
    dispatch(setUser(null));
    navigate("/login", { replace: true });
    socket.emit("user-offline", user._id);
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

  function getInitial() {
    const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`
      .trim()
      .toUpperCase();
    return initials || "?";
  }
  return (
    <div className="app-header">
      <div className="app-logo" aria-label="Real Time brand logo">
        <span className="app-logo-badge" aria-hidden="true">
          ⚡
        </span>
        <span className="app-logo-text">Real Time</span>
      </div>

      <div className="app-user-profile">
        {user?.photo ? (
          <img
            src={user.photo}
            alt="profile-pic"
            className="logged-user-profile-pic"
            onClick={() => navigate("/profile")}
          />
        ) : (
          <div
            className="logged-user-profile-pic"
            onClick={() => navigate("/profile")}
          >
            {getInitial()}
          </div>
        )}

        <div className="logged-user-name">{getFullName()}</div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <i className="fa fa-power-off" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

export default Header;
