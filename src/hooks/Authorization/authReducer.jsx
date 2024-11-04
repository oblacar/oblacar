// Редюсер для управления состоянием аутентификации
// src/hooks/Authorization/authReducer.js

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { userId: action.payload.userId, isAuthenticated: true };

        case 'LOGOUT':
            return { userId: null, isAuthenticated: false };

        default:
            return state;
    }
};

export default authReducer;
