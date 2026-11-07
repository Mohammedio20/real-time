import React from "react";
import { Link } from "react-router-dom";
import { signupUser } from "./../../apiCalls/auth";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { showLoader } from "../../redux/loaderSlice";
import { hideLoader } from "../../redux/loaderSlice";

function Signup() {
  const dispatch = useDispatch();
  const [user, setUser] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  async function onFormSubmit(e) {
    e.preventDefault();
    if (user.password !== user.passwordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      dispatch(showLoader());
      const response = await signupUser(user);
      dispatch(hideLoader());

      toast.success(response.message);
    } catch (err) {
      dispatch(hideLoader());

      toast.error(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message,
      );
      console.error("Signup failed:", err.response?.data ?? err);
    }
  }

  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card_title">
          <h1>Create Account</h1>
        </div>
        <div className="form">
          <form onSubmit={onFormSubmit}>
            <div className="column">
              <input
                type="text"
                placeholder="First Name"
                required
                value={user.firstName}
                onChange={(e) =>
                  setUser({ ...user, firstName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              required
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Confirm Password"
              autoComplete="new-password"
              aria-label="Confirm password"
              required
              value={user.passwordConfirm}
              onChange={(e) =>
                setUser({ ...user, passwordConfirm: e.target.value })
              }
            />
            <button type="submit">Sign Up</button>
          </form>
        </div>
        <div className="card_terms">
          <span>
            Already have an account?
            <Link to="/Login">Login Here</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
