// Редюсер для управления состоянием аутентификации
// src/hooks/Authorization/authReducer.js

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            // return { ...state, user: action.payload };//TODO before relocated in UserContext
            return { userId: action.payload.userId, isAuthenticated: true };
        case 'LOGOUT':
            // return { ...state, user: null };//TODO before relocated in UserContext
            return { userId: null, isAuthenticated: false };

        default:
            return state;
    }
};

export default authReducer;
