// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';

import Register from './components/Register/Register';
import Login from './components/Login/Login'; // Импортируйте Login

import { IconDropdownMenuBar } from './components/IconHoverCardBar/IconHoverCardBar';

const App = () => {
    return (
        <Router>
            <div>
                {/* Шапка сайта */}
                <Header />
                {/* Маршрутизация */}
                
                {/* <IconDropdownMenuBar/>
                <div>
                    <Register />
                    <Login />
                </div> */}
                <Routes>
                    <Route
                        path='/'
                        element={<Home />}
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
