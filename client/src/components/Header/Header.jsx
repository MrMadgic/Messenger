import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import NotificationsIcon from "./NotificationsIcon";
import MobileMenu from "./MobileMenu/MobileMenu";
import { selectIsAuth, selectNotificationCount } from "../../selectors";
import { useDispatch, useSelector } from "react-redux";

import Cookies from "js-cookie";
import { setAuthStatus } from "../../redux/actionCreaters/actionCreater";

export default function Header() {
  const notificationCount = useSelector(selectNotificationCount);
  const isAuth = useSelector(selectIsAuth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleQuit = () => {
    Cookies.remove("isAuth");
    Cookies.remove("login");

    dispatch(setAuthStatus(false));
  };

  return (
    <div className="header">
      <div className="logo">
        <Link to="/">
          <h2>Messenger</h2>
        </Link>
      </div>
      <div className="menu">
        <NavLink to="/">Главная</NavLink>
        <NavLink to="/messages">Сообщения</NavLink>
        <NavLink to="/users">Пользователи</NavLink>
        <NavLink to="/settings">Настройки</NavLink>
      </div>

      <NotificationsIcon notificationCount={notificationCount} />
      <div className="logout">
        {isAuth ? (
          <Link onClick={handleQuit} to="/">
            Выход
          </Link>
        ) : (
          <Link to="/signup">Зарегистрироваться</Link>
        )}
      </div>
      <div className="mobile-menu-toggle" onClick={handleMobileMenuToggle}>
        ☰
      </div>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuToggle}
        isAuth={isAuth}
      />
    </div>
  );
}
