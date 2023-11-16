import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuth, selectServerConfig } from "../../selectors";
import Cookies from "js-cookie";
import {
  setAuthStatus,
  setUserLogin,
  clearDialogs
} from "../../redux/actionCreaters/actionCreater";

export default function Login() {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    login: "",
    password: "",
    incorrectData: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector(selectIsAuth);
  const serverConfig = useSelector(selectServerConfig);

  useEffect(() => {
    if (isAuth) {
      navigate("/messages");
    }
  });

  function clearForm() {
    setFormData({
      login: "",
      password: "",
    });
  }

  function clearErrors() {
    setErrors({
      login: "",
      password: "",
      incorrectData: "",
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (formData.login.trim() === "") {
      setErrors({ ...errors, login: "Логин не может быть пустым" });
      hasError = true;
    }

    if (formData.password.trim() === "") {
      setErrors({ ...errors, password: "Пароль не может быть пустым" });
      hasError = true;
    }

    if (!hasError) {
      async function fetchData() {
        try {
          const response = await fetch(
            `${serverConfig.host}${serverConfig.port}/authenticate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            }
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const result = await response.json();

          if (result?.isAuth) {
            Cookies.set("isAuth", true);
            Cookies.set("login", formData.login);
            dispatch(setAuthStatus(true));
            dispatch(setUserLogin(formData.login));
            dispatch(clearDialogs())

            clearErrors();
            clearForm();

          } else {
            setErrors({
              login: "",
              password: "",
              incorrectData: "Не верный логин, или пароль.",
            });

            hasError = true;
          }
        } catch (error) {
          console.error("Error registering user:", error);
        }
      }

      fetchData();
    }
  };

  return (
    <div className="login section-box">
      <h2>Авторизация</h2>
      <hr />

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="login" className="form-label">
            Логин
          </label>
          <input
            type="text"
            className="form-control"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Введите ваш логин"
            autoComplete="username"
          />
          {errors.login && <div className="text-danger">{errors.login}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введите ваш пароль"
            autoComplete="current-password"
          />
          {errors.password && (
            <div className="text-danger">{errors.password}</div>
          )}
          {errors.incorrectData && (
            <div className="text-danger">{errors.incorrectData}</div>
          )}
        </div>
        <hr />
        <button type="submit" className="btn btn-primary">
          Войти
        </button>
      </form>

      <p className="mt-3">
        Нет аккаунта? <Link to="/signup">Зарегистрируйтесь</Link>
      </p>
    </div>
  );
}
