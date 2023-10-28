import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";
import NotificationsIcon from "./NotificationsIcon";
import MobileMenu from "./MobileMenu/MobileMenu";

export default function Header({ isAuth, notificationCount }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="header">
      <div className="logo">
        <Link to="/"><h2>Messenger</h2></Link>
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
          <Link to="/">Выход</Link>
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
