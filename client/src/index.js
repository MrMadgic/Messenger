import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App";
import store from "./redux/redux-state"
import { Provider } from 'react-redux';
import './assets/css/index.css';
import './assets/css/media.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);