import React from "react";
import "./MobileMenu.css";
import { Link } from "react-router-dom";

export default function MobileMenu({ isOpen, onClose, isAuth }) {
  return (
    <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
      <div className="mobile-menu-content">
        <h2>Messanger</h2>
        <hr />
        <div className="logout-menu">
          {isAuth ? (
            <Link to="/">Выход</Link>
          ) : (
            <Link to="/signup">Зарегистрироваться</Link>
          )}
        </div>
        <hr />
        <ul>
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/messages">Сообщения</Link>
          </li>
          <li>
            <Link to="/users">Пользователи</Link>
          </li>
          <li>
            <Link to="/settings">Настройки</Link>
          </li>
        </ul>
      </div>
      <div className="overlay" onClick={onClose}></div>
    </div>
  );
}
