// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout'; // Импортируем новый компонент Layout
import Home from './pages/Home/Home';
import Register from './components/Register/Register';
import Login from './components/Login/Login'; // Импортируйте Login
import { AuthProvider } from './hooks/Authorization/AuthContext'; // Импортируем AuthProvider

const App = () => {
    return (
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
                            element={<Register />}
                        />
                        <Route
                            path='/login'
                            element={<Login />}
                        />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
