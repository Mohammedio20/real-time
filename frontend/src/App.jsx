import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/protectedRoute";
import { useSelector } from "react-redux";
import Loader from "./components/loader";

const Home = lazy(() => import("./pages/home"));
const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const Profile = lazy(() => import("./pages/profile"));

function App() {
  const { loader } = useSelector((state) => state.loaderReducer);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {loader && <Loader />}

      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
