import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuth, selectServerConfig } from "../../selectors";
import Cookies from "js-cookie";
import {
  clearDialogs,
  setAuthStatus,
  setUserLogin,
} from "../../redux/actionCreaters/actionCreater";

export default function Signup() {
  const [formData, setFormData] = useState({
    login: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    login: "",
    loginHave: "",
    email: "",
    emailHave: "",
    password: "",
    confirmPassword: "",
    emailBlocked: "",
    loginBlocked: "",
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
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  function clearErrors() {
    setErrors({
      login: "",
      loginHave: "",
      email: "",
      emailHave: "",
      password: "",
      confirmPassword: "",
      emailBlocked: "",
      loginBlocked: "",
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

    if (formData.email.trim() === "") {
      setErrors({ ...errors, email: "Почта не может быть пустой" });
      hasError = true;
    }

    if (formData.password.trim() === "") {
      setErrors({ ...errors, password: "Пароль не может быть пустым" });
      hasError = true;
    }

    if (formData.confirmPassword.trim() === "") {
      setErrors({
        ...errors,
        confirmPassword: "Подтверждение пароля не может быть пустым",
      });
      hasError = true;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, confirmPassword: "Пароли не совпадают" });
      hasError = true;
    }

    if (!hasError) {
      async function fetchData() {
        try {
          const response = await fetch(
            `${serverConfig.host}${serverConfig.port}/register`,
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

          if (result.emailBlocked) {
            setErrors({
              login: "",
              loginHave: "",
              email: "",
              password: "",
              confirmPassword: "",
              emailHave: "",
              emailBlocked: "Почта заблокирована",
              loginBlocked: "",
            });

            hasError = true;
          } else if (result?.loginBlocked) {
            setErrors({
              login: "",
              loginHave: "",
              email: "",
              password: "",
              confirmPassword: "",
              emailHave: "",
              emailBlocked: "",
              loginBlocked: "Логин заблокирован",
            });

            hasError = true;
          } else if (result?.email) {
            setErrors({
              login: "",
              loginHave: "",
              email: "",
              password: "",
              confirmPassword: "",
              emailHave: "Почта уже зарегистрирована",
              emailBlocked: "",
              loginBlocked: "",
            });

            hasError = true;
          } else if (result?.login) {
            setErrors({
              login: "",
              loginHave: "Логин уже занят",
              email: "",
              password: "",
              confirmPassword: "",
              emailHave: "",
              emailBlocked: "",
              loginBlocked: "",
            });

            hasError = true;
          }

          if (!hasError) {
            Cookies.set("isAuth", true);
            Cookies.set("login", formData.login);

            dispatch(setAuthStatus(true));
            dispatch(setUserLogin(formData.login));
            dispatch(clearDialogs())

            clearErrors();
            clearForm();
          }
        } catch (error) {
          console.error("Error registering user:", error);
        }
      }

      fetchData();
    }
  };

  return (
    <div className="signup section-box">
      <h2>Зарегистрироваться</h2>
      <hr />

      <form className="signup-form" onSubmit={handleSubmit}>
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
            placeholder="Введите логин"
            autoComplete="login"
          />
          {errors.login && <div className="text-danger">{errors.login}</div>}
          {errors.loginHave && (
            <div className="text-danger">{errors.loginHave}</div>
          )}
          {errors.loginBlocked && (
            <div className="text-danger">{errors.loginBlocked}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Почта
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Введите адрес электронной почты"
            autoComplete="email"
          />
          {errors.email && <div className="text-danger">{errors.email}</div>}
          {errors.emailHave && (
            <div className="text-danger">{errors.emailHave}</div>
          )}
          {errors.emailBlocked && (
            <div className="text-danger">{errors.emailBlocked}</div>
          )}
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
            placeholder="Введите пароль"
            autoComplete="new-password"
          />
          {errors.password && (
            <div className="text-danger">{errors.password}</div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Подтвердите пароль
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Подтвердите пароль"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <div className="text-danger">{errors.confirmPassword}</div>
          )}
        </div>
        <hr />
        <button type="submit" className="btn btn-primary">
          Зарегистрироваться
        </button>
      </form>

      <p className="mt-3">
        Уже есть аккаунт? <Link to="/login">Авторизуйтесь</Link>
      </p>
    </div>
  );
}
