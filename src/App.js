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

import { AuthProvider } from './hooks/Authorization/AuthContext'; // Импортируем AuthProvider
import { UserProvider } from './hooks/UserContext';

const App = () => {
    useEffect(() => {
        console.log('начало');
    }, []);

    return (
        <>
            <UserProvider>
                <AuthProvider>
                    <Router>
                        <div>App Component Rendered!</div> {/* Для отладки */}
                        <Routes>
                            <Route element={<Layout />}>
                                <Route
                                    path='/'
                                    element={<Home />}
                                />
                                <Route
                                    path='/register'
                                    element={<Register />}
                                />
                                <Route
                                    path='/login'
                                    element={<Login />}
                                />
                                <Route
                                    path='/user-profile'
                                    element={<ProfileUserPage />}
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
