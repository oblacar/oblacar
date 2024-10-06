// Редюсер для управления состоянием аутентификации
// src/hooks/Authorization/authReducer.js

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};

export default authReducer;
