import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./App";
import store from "./redux/redux-state"
import { Provider } from 'react-redux';
import './assets/css/index.css';
import './assets/css/media.css';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>

  </React.StrictMode>
);