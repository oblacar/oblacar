// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { useEffect, useContext } from 'react';
// import AuthContext from './hooks/Authorization/AuthContext'; // Импорт AuthContext
// import UserContext from './hooks/UserContext'; // Импорт UserContext

import Layout from './components/Layout'; // Импортируем новый компонент Layout

import Home from './pages/Home/Home';
import Register from './components/Register/Register';
import Login from './components/Login/Login'; // Импортируйте Login
import ProfileUserPage from './pages/profiles/ProfileUser/ProfileUserPage';
import AuthPage from './pages/AuthPage/AuthPage'; // Импорт страницы аутентификации

import { AuthProvider } from './hooks/Authorization/AuthContext'; // Импортируем AuthProvider
import { UserProvider } from './hooks/UserContext';

const App = () => {
    return (
        <>
            <UserProvider>
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route element={<Layout />}>
                                <Route
                                    path='/'
                                    element={<Home />}
                                />
                                <Route
                                    path='/register'
                                    element={<AuthPage isLogin={false} />}
                                />
                                <Route
                                    path='/login'
                                    element={<AuthPage isLogin={true} />}
                                />
                                <Route
                                    path='/user-profile'
                                    element={<ProfileUserPage />}
                                />
                                <Route
                                    path='/auth'
                                    element={<AuthPage />}
                                />
                            </Route>
                        </Routes>
                    </Router>
                </AuthProvider>
            </UserProvider>
        </>
    );
};

export default App;
