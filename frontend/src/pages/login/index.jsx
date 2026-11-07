import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "./../../apiCalls/auth";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
function Login() {
  const dispach = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });

  async function onFormSubmit(e) {
    e.preventDefault();
    try {
      dispach(showLoader());
      const response = await loginUser(user);
      dispach(hideLoader());

      if (response.status === "success") {
        toast.success(response.message);
        localStorage.setItem("token", response.token);

        navigate("/", { replace: true });
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      dispach(hideLoader());

      toast.error(
        err.response?.data?.message ?? err.response?.data?.error ?? err.message,
      );
      console.error("Login failed:", err.response?.data ?? err);
    }
  }

  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card_title">
          <h1>Login Here</h1>
        </div>
        <div className="form">
          <form onSubmit={onFormSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <button type="submit">Login</button>
          </form>
        </div>
        <div className="card_terms">
          <span>
            Don't have an account yet?
            <Link to="/Signup">Signup Here</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
