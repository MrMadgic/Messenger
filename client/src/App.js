import Main from "./components/Main/Main";
import Header from "./components/Header/Header";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setAuthStatus, setDialogs, setUserLogin, setUserSettings } from "./redux/actionCreaters/actionCreater";

import Messages from "./components/Messages/Messages";
import Users from "./components/Users/Users";
import Settings from "./components/Settings/Settings";
import Notifications from "./components/Notifications/Notifications";

import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";

import Cookies from 'js-cookie';
import { selectServerConfig } from "./selectors";

export function App() {
  const dispatch = useDispatch();

  const authCookie = Cookies.get('isAuth');
  const serverConfig = useSelector(selectServerConfig);

  const authLogin = Cookies.get('login');

  dispatch(setAuthStatus(authCookie));
  dispatch(setUserLogin(authLogin));

  const handleQuit = () => {
    Cookies.remove("isAuth");
    Cookies.remove("login");

    dispatch(setAuthStatus(false));
  };

  useEffect(() => {
    if (authCookie) {

      async function getUserDialogs(user) {

        try {
          const response = await fetch(
            `${serverConfig.host}${serverConfig.port}/getUserDialogs`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ownerId: user.user_id}),
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const result = await response.json();

          if (result) {
            dispatch(setDialogs(result));
          }
          
        } catch (error) {
          console.error("Error user:", error);
        }
      }

      async function updateUserData() {
        try {
          const response = await fetch(
            `${serverConfig.host}${serverConfig.port}/getUserData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ login: authLogin }),
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const result = await response.json();

          if (result) {
            getUserDialogs(result)
            dispatch(setUserSettings(result));
          }
          
        } catch (error) {
          console.error("Error user:", error);
          handleQuit()
        }
      }

      async function fetchData() {
        try {
          const response = await fetch(
            `${serverConfig.host}${serverConfig.port}/getUserData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ login: authLogin }),
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const result = await response.json();

          if (result) {
            dispatch(setUserSettings({ ...result, isAuth: authCookie }));
          }

        } catch (error) {
          console.error("Error registering user:", error);
        }
      }

      updateUserData();
      fetchData();
    }

  }, [dispatch, authCookie, authLogin, serverConfig]);

  return (
    <BrowserRouter>
      <Header />
      <div className="wrapper">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/users" element={<Users />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/messages" element={<Messages />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/*" element={<Settings />} />

          <Route path="/notifications" element={<Notifications />} />

        </Routes>
      </div>
    </BrowserRouter >
  );
}


export default App