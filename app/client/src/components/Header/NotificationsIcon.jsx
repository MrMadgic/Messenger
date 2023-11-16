import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

export default function NotificationsIcon({ notificationCount }) {
  const countToShow = notificationCount >= 0 ? notificationCount : 0;

  return (
    <Link to="/notifications" className="notifications">
      <svg
        width="30 "
        height="30"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.1336 11C18.7155 16.3755 21 18 21 18H3C3 18 6 15.8667 6 8.4C6 6.70261 6.63214 5.07475 7.75736 3.87452C8.88258 2.67428 10.4087 2 12 2C12.3373 2 12.6717 2.0303 13 2.08949"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="white"
        ></path>
        <circle
          cx="16.5"
          cy="8"
          r="8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="red"
        ></circle>
        <text
          x="16.4"
          y="13"
          fontSize="12"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          {countToShow > 99 ? "99" : countToShow}
        </text>
        <path
          d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12.0001 21.9965"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="white"
        ></path>
      </svg>
    </Link>
  );
}
