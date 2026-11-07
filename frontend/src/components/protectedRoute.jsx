import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedUser, getAllUsers } from "./../apiCalls/users";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { setUser, setAllUsers, setAllChats } from "./../redux/userSlice";
import toast from "react-hot-toast";
import { getAllChats } from "../apiCalls/chats";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProtectedData = async () => {
      if (!localStorage.getItem("token")) {
        navigate("/login", { replace: true });
        return;
      }

      dispatch(showLoader());
      try {
        const userResponse = await getLoggedUser();
        if (userResponse?.status !== "success") {
          throw new Error(
            userResponse?.response?.data?.message ??
              userResponse?.message ??
              "Unable to load your account.",
          );
        }

        if (!isActive) return;
        dispatch(setUser(userResponse.data.user));

        const [usersResponse, chatsResponse] = await Promise.all([
          getAllUsers(),
          getAllChats(),
        ]);

        if (usersResponse?.status !== "success") {
          throw new Error(
            usersResponse?.response?.data?.message ??
              usersResponse?.message ??
              "Unable to load users.",
          );
        }

        if (chatsResponse?.status !== "success") {
          throw new Error(
            chatsResponse?.response?.data?.message ??
              chatsResponse?.message ??
              "Unable to load chats.",
          );
        }

        if (!isActive) return;
        dispatch(setAllUsers(usersResponse.data.users));
        dispatch(setAllChats(chatsResponse.data.chats));
        setIsReady(true);
      } catch (err) {
        if (!isActive) return;
        dispatch(setUser(null));
        toast.error(err.message || "Unable to load your account.");
        navigate("/login", { replace: true });
      } finally {
        if (isActive) {
          dispatch(hideLoader());
        }
      }
    };

    loadProtectedData();

    return () => {
      isActive = false;
    };
  }, [dispatch, navigate]);

  return isReady ? <div>{children}</div> : null;
}

export default ProtectedRoute;
