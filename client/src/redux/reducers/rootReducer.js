import { LOADDIALOGS, SETMESSAGES, SETNEWDIALOG, SETDIALOGS, SELECTDIALOG, SENDMESSAGE, SETAUTHSTATUS, SETUSERDATA, SETUSERLOGIN, SETUSERSETTINGS } from "../../types";

const initialState = {
  serverConfig: {
    port: 3001,
    socketPort: 4000,
    host: `http://localhost:`

  },
  user: {
    id: null,
    login: null,
    bio: null,
    firstName: null,
    lastName: null,
    password: null,
    email: null,
    isAuth: false,
    avatarURL: "https://w7.pngwing.com/pngs/832/44/png-transparent-advertising-service-blog-internet-avatar-woman-face-black-hair-service-thumbnail.png",
    dialogsNotifications: 0,
    selectedDialog: null,
    dialogs: [],
    message: '',
  },
};


const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SETMESSAGES:
      const updatedMessages = state.user.dialogs.map((dialog) => {
        if (dialog.id === state.user.selectedDialog.id) {
          return {
            ...dialog,
            messages: action.messages, 
          };
        }
        return dialog;
      });
      
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: updatedMessages,
        },
      };
    
    case SETNEWDIALOG:
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: [...state.user.dialogs, action.dialog],
        },
      };

    case SETDIALOGS:
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: action.dialogs,
        },
      };

    case SETUSERLOGIN:
      return {
        ...state,
        user: {
          ...state.user,
          login: action.login,
        },
      };

    case SETAUTHSTATUS:
      return {
        ...state,
        user: {
          ...state.user,
          isAuth: action.isAuth,
        },
      };

    case LOADDIALOGS:
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: action.dialogs,
        },
      };
    case SELECTDIALOG:
      return {
        ...state,
        user: {
          ...state.user,
          selectedDialog: action.dialog,
        },
      };
    case SETUSERDATA:
      return {
        ...state,
        user: {
          ...state.user,
          login: action.userData.login,
          password: action.userData.password,
          email: action.userData.email,
        },
      };
    case SETUSERSETTINGS:
      return {
        ...state,
        user: {
          ...state.user,
          id: action.data.user_id,
          login: action.data.login,
          password: action.data.password,
          email: action.data.email,
          avatarURL: action.data.avatar_url,
          dialogsNotifications: action.data.dialogs_notifications,
          firstName: action.data.first_name,
          lastName: action.data.last_name,
          bio: action.data.bio,
        },
      };
    case SENDMESSAGE:
      const updatedDialogs = state.user.dialogs.map((dialog) => {
        if (dialog.id === state.user.selectedDialog.id) {
          return {
            ...dialog,
            messages: [...dialog.messages, action.message],
          };
        }
        return dialog;
      });
      return {
        ...state,
        user: {
          ...state.user,
          dialogs: updatedDialogs,
        },
      };
    default:
      return state;
  }
};

export default rootReducer;