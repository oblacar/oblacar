// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout'; // Импортируем новый компонент Layout

import Home from './pages/Home/Home';
import ProfileUserPage from './pages/profiles/ProfileUser/ProfileUserPage';
import AuthPage from './pages/AuthPage/AuthPage'; // Импорт страницы аутентификации
import NewTransportAd from './pages/Ads/NewTransportAd/NewTransportAd';
import AdPage from './pages/Ads/AdPage';

import { AuthProvider } from './hooks/Authorization/AuthContext'; // Импортируем AuthProvider
import { UserProvider } from './hooks/UserContext';
import { TransportAdProvider } from './hooks/TransportAdContext';
import { TransportProvider } from './hooks/TransportContext';

const App = () => {
    return (
        <>
            <Router>
                <AuthProvider>
                    <UserProvider>
                        <TransportProvider>
                            <TransportAdProvider>
                                <Routes>
                                    <Route element={<Layout />}>
                                        <Route
                                            path='/'
                                            element={<Home />}
                                        />
                                        <Route
                                            path='/register'
                                            element={
                                                <AuthPage isLogin={false} />
                                            }
                                        />
                                        <Route
                                            path='/login'
                                            element={
                                                <AuthPage isLogin={true} />
                                            }
                                        />
                                        <Route
                                            path='/user-profile'
                                            element={<ProfileUserPage />}
                                        />
                                        <Route
                                            path='/auth'
                                            element={<AuthPage />}
                                        />
                                        <Route
                                            path='/new-tansport-ad'
                                            element={<NewTransportAd />}
                                        />
                                        {/* <Route
                                            path='/ads'
                                            element={<AdList />}
                                        /> */}
                                        <Route
                                            path='/ads/:adId'
                                            element={<AdPage />}
                                        />
                                    </Route>
                                </Routes>
                            </TransportAdProvider>
                        </TransportProvider>
                    </UserProvider>
                </AuthProvider>
            </Router>
        </>
    );
};

export default App;
