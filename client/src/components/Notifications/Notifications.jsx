import React, { useEffect, useState } from "react";
import "./Notifications.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../../selectors";

export default function Notifications() {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth) {
      setLoading(true);
      setTimeout(() => {
        navigate("/signup");
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [isAuth, navigate]);

  return (
    <>
      {loading ? (
        <div className="spinner-wrapper">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="section-box">Notifications</div>
      )}
    </>
  );
}
