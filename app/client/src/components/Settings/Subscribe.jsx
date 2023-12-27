import React from "react";
import { useSelector } from "react-redux";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import "./Subscribe.css";
import { selectServerConfig } from "../../selectors";

export default function Subscribe() {
  const user = useSelector((state) => state.user);
  const havePremium = user?.havePremium;

  const serverConfig = useSelector(selectServerConfig);

  const navigate = useNavigate();

  const handleBuySubscription = async (status) => {
    try {
      const response = await fetch(
        `${serverConfig.host}${serverConfig.port}/setUserPremium`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ payStatus: status, userId: user.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error give premium user:", error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Подписка</h2>
      </div>
      <div className="card-body">
        {havePremium ? (
          <div className="alert alert-success" role="alert">
            <p>У вас уже есть подписка</p>
            <p>Доступ разблокирован</p>
          </div>
        ) : (
          <>
            <div className="alert alert-danger" role="alert">
              <p>Подписка не оплачена</p>
              <PayPalScriptProvider options={{ clientId: "test" }}>
                <PayPalButtons
                  style={{
                    layout: "horizontal",
                    color: "blue",
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: "0.1",
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={(data, actions) => {
                    handleBuySubscription(true);
                    navigate("/paymentStatus/success");
                  }}
                  onError={(error) => {
                    handleBuySubscription(false);
                    navigate("/paymentStatus/failed");
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
