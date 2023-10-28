import { LOADDIALOGS, SELECTDIALOG, SENDMESSAGE, SETAUTHSTATUS, SETUSERDATA } from "../../types";


export const setAuthStatus = (isAuth) => {
  return {
    type: SETAUTHSTATUS,
    isAuth,
  };
};

export const loadDialogs = (dialogs) => {
  return {
    type: LOADDIALOGS,
    dialogs,
  };
};

export const selectDialog = (dialog) => {
  return {
    type: SELECTDIALOG,
    dialog,
  };
};

export const sendMessage = (message) => {
  return {
    type: SENDMESSAGE,
    message,
  };
};

export const setUserData = (userData) => {
  return {
    type: SETUSERDATA,
    userData,
  };
};
