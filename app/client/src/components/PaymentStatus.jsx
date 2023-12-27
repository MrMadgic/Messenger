import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PaymentStatus = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const { status } = useParams();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearInterval(timer);
  }, [navigate]);

  const isSuccessful = status === "success";

  return (
    <div className="container mt-5">
      <div className={`alert ${!isSuccessful ? "alert-danger" : `alert-${status.toLowerCase()}`}`} role="alert">
        <h4 className="alert-heading">{status}!</h4>
        {isSuccessful ? (
                    <p>
                    Ваша оплата была обработана.
                  </p>
        ): (
            <p>Ошибка :(</p>
        )} 
        <hr />
        {isSuccessful && (
          <p className="mb-0">Благодарим за подписку!</p>
        )}
        <p>Перенаправление через {countdown} секунд...</p>
      </div>
    </div>
  );
};

export default PaymentStatus;
