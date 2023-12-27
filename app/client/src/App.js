import Main from "./components/Main/Main";
import Header from "./components/Header/Header";
import io from "socket.io-client";

import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setAuthStatus, setDialogs, setUserLogin, setUserSettings, updatedDialogById, checkExistsDialogs } from "./redux/actionCreaters/actionCreater";

import Messages from "./components/Messages/Messages";
import Users from "./components/Users/Users";
import Settings from "./components/Settings/Settings";
import Notifications from "./components/Notifications/Notifications";

import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";

import Cookies from 'js-cookie';
import { selectServerConfig } from "./selectors";
import PaymentStatus from "./components/PaymentStatus";

const socket = io.connect(`http://localhost:4000`);

export function App() {
  const dispatch = useDispatch();

  const authCookie = Cookies.get('isAuth');
  const serverConfig = useSelector(selectServerConfig);
  const [userId, setUserId] = useState(null)

  const location = useLocation();

  const authLogin = Cookies.get('login');


  dispatch(setAuthStatus(authCookie));
  dispatch(setUserLogin(authLogin));


  async function getUserDialogs(user) {

    try {
      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/getUserDialogs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ownerId: user.user_id }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      if (result) {
        dispatch(setDialogs(result));
        return result
      }

    } catch (error) {
      console.error("Error user:", error);
    }
  }

  const handleQuit = () => {
    Cookies.remove("isAuth");
    Cookies.remove("login");

    dispatch(setAuthStatus(false));
  };

  function handleUserStatus(userId) {
    socket.emit("is_online", { userId, status: true });
    window.addEventListener('beforeunload', () => {
      socket.emit("is_online", { userId, status: false });
    })
  }

  const handleUpdateUser = async (data) => {
    const id = data?.user_id
    if (id) {
      const newDialogs = await getUserDialogs(data)
      dispatch(checkExistsDialogs(newDialogs))
      socket.emit("user_settings", id);
    }
  };

  useEffect(() => {
    const handleTrackUser = (data) => {
      data.filter((dialog) => {
        dispatch(updatedDialogById(dialog))
      })
    };

    socket.on("track_user", handleTrackUser);

    return () => {
      socket.off("track_user", handleTrackUser);
    };
  }, [dispatch, socket]);

  async function getUserData(login) {
    try {
      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/getUserData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ login }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      if (result) {
        return result
      }

    } catch (error) {
      console.error("Error user:", error);
      handleQuit()
    }

  }

  useEffect(() => {
    if (authCookie) {
      async function updateUserData() {
        try {
          const result = await getUserData(authLogin)

          if (result) {
            setUserId(result.user_id)
            dispatch(setUserSettings({ ...result, isAuth: authCookie }));
            handleUserStatus(result.user_id)
            await getUserDialogs(result)
            setInterval(() => { handleUpdateUser(result) }, 2000);

          }

        } catch (error) {
          console.error("Error user:", error);
          handleQuit()
        }
      }

      updateUserData();
    }

  }, [dispatch, authCookie, authLogin, serverConfig]);


  useEffect(() => {

    if (!location.pathname.startsWith('/messages')) {
      if (userId) {
        socket.emit("join_room", { id: null, userId });
      }
    }
  }, [location]);

  return (
    <>
      <Header />
      <div className="wrapper">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/users" element={<Users />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route path="/paymentStatus/:status" element={<PaymentStatus />} />

          <Route path="/messages/:id" element={<Messages getUserData={getUserData} />} />
          <Route path="/messages" element={<Messages getUserData={getUserData} />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/*" element={<Settings />} />

          <Route path="/notifications" element={<Notifications />} />

        </Routes>
      </div>
    </>
  );
}


export default App