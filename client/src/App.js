import Main from "./components/Main/Main";
import Header from "./components/Header/Header";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuth, selectNotificationCount } from "./selectors";
import { useEffect } from "react";
import { setAuthStatus } from "./redux/actionCreaters/actionCreater";

import Messages from "./components/Messages/Messages";
import Users from "./components/Users/Users";
import Settings from "./components/Settings/Settings";
import Notifications from "./components/Notifications/Notifications";

import Signup from "./components/Signup/Signup";
import Login from "./components/Login/Login";

export function App() {
  const isAuth = useSelector(selectIsAuth);
  const notificationCount = useSelector(selectNotificationCount);
  const dispatch = useDispatch();

  const authCookie = true;

  useEffect(() => {
    if (authCookie) {
      dispatch(setAuthStatus(authCookie));
    }
  }, [dispatch, authCookie]);

  return (
    <BrowserRouter>
      <Header isAuth={isAuth} notificationCount={notificationCount} />
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