import React from "react";
import "./MobileMenu.css";
import { Link } from "react-router-dom";
import { selectIsAuth } from "../../../selectors";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { setAuthStatus } from "../../../redux/actionCreaters/actionCreater";

export default function MobileMenu({ isOpen, onClose }) {
  const isAuth = useSelector(selectIsAuth);
                                                                                           
  const dispatch = useDispatch();

  const handleQuit = () => {
    Cookies.remove("isAuth");
    Cookies.remove("login");

    dispatch(setAuthStatus(false));
  };
  
  return (
    <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
      <div className="mobile-menu-content">
        <h2>Messanger</h2>
        <hr />
        <div className="logout-menu">
          {isAuth ? (
            <Link onClick={handleQuit} to="/">Выход</Link>
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
