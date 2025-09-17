// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout'; // Импортируем новый компонент Layout

import Home from './pages/Home/Home';
import ProfileUserPage from './pages/profiles/ProfileUser/ProfileUserPage';
import AuthPage from './pages/AuthPage/AuthPage'; // Импорт страницы аутентификации
import NewTransportAd from './pages/Ads/NewTransportAd/NewTransportAd';
import AdPage from './pages/Ads/AdPage';
import NewVehiclePage from './pages/Vehicles/NewVehicle/NewVehiclePage';
import VehiclePage from './pages/Vehicles/VehiclePage';
import VehiclesPage from './pages/Vehicles/VehiclesPage';


import { AuthProvider } from './hooks/Authorization/AuthContext'; // Импортируем AuthProvider
import { UserProvider } from './hooks/UserContext';
import { TransportAdProvider } from './hooks/TransportAdContext';

import { ConversationProvider } from './hooks/ConversationContext';
import { TransportationProvider } from './hooks/TransportationContext';
import ConversationsPage from './pages/ConversationsPage/ConversationsPage';
import { VehicleProvider } from './hooks/VehicleContext';

const App = () => {
    return (
        <>
            <Router>
                <AuthProvider>
                    <UserProvider>
                        <VehicleProvider>
                            <ConversationProvider>
                                <TransportAdProvider>
                                    <TransportationProvider>
                                        <Routes>
                                            <Route element={<Layout />}>
                                                <Route
                                                    path='/'
                                                    element={<Home />}
                                                />
                                                <Route
                                                    path='/register'
                                                    element={
                                                        <AuthPage
                                                            isLogin={false}
                                                        />
                                                    }
                                                />
                                                <Route
                                                    path='/login'
                                                    element={
                                                        <AuthPage
                                                            isLogin={true}
                                                        />
                                                    }
                                                />
                                                <Route
                                                    path='/user-profile'
                                                    element={
                                                        <ProfileUserPage />
                                                    }
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
                                                <Route
                                                    path='/dialogs'
                                                    element={
                                                        <ConversationsPage />
                                                    }
                                                />
                                                <Route
                                                    path='/new-vehicle'
                                                    element={<NewVehiclePage />}
                                                />
                                                <Route
                                                    path="/vehicles/:truckId"
                                                    element={<VehiclePage />}
                                                />
                                                <Route
                                                    path="/vehicles"
                                                    element={<VehiclesPage />}
                                                />
                                            </Route>
                                        </Routes>
                                    </TransportationProvider>
                                </TransportAdProvider>
                            </ConversationProvider>
                        </VehicleProvider>
                    </UserProvider>
                </AuthProvider>
            </Router>
        </>
    );
};

export default App;
