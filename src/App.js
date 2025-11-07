// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout'; // Импортируем новый компонент Layout

import AdminAuthGuard from './admin/context/AdminAuthGuard';
import AdminApp from './admin/routes/AdminApp';
import AdminLanding from './admin/routes/AdminLanding';
import AdminAds from './admin/routes/AdminAds';
import AdminUsers from './admin/routes/AdminUsers';
import AdminAdsProvider from './admin/context/AdminAdsContext';
import AdminUsersProvider from './admin/context/AdminUsersContext';
import AdminDownloads from './admin/routes/AdminDownloads';
import AdminAdPage from './admin/pages/AdminAdPage';

import Home from './pages/Home/Home';
import ProfileUserPage from './pages/profiles/ProfileUser/ProfileUserPage';
import AuthPage from './pages/AuthPage/AuthPage'; // Импорт страницы аутентификации
import NewTransportAd from './pages/Ads/NewTransportAd/NewTransportAd';
import AdPage from './pages/Ads/AdPage';
import MyTransportAdsPage from './pages/Ads/MyTransportAdsPage';
import MyCargoAdsPage from './pages/Ads/Cargo/MyCargoAds/MyCargoAdsPage';
import EditCargoAdPage from './pages/Ads/Cargo/CargoAdEditPage/EditCargoAdPage';
import NewVehiclePage from './pages/Vehicles/NewVehicle/NewVehiclePage';
import VehiclePage from './pages/Vehicles/VehiclePage';
import VehiclesPage from './pages/Vehicles/VehiclesPage';
import ConversationsPage from './pages/ConversationsPage/ConversationsPage';

import NewCargoAdPage from './pages/Ads/Cargo/NewCargoAd/NewCargoAdPage';

import MigrateCargoAdsPage from './pages/Ads/dev/MigrateCargoAdsPage';

import { AuthProvider } from './hooks/Authorization/AuthContext'; // Импортируем AuthProvider
import { UserProvider } from './hooks/UserContext';
import { TransportAdProvider } from './hooks/TransportAdContext';
import { CargoAdsProvider } from './hooks/CargoAdsContext';
import { CargoRequestsProvider } from './hooks/CargoRequestsContext';
import { ConversationProvider } from './hooks/ConversationContext';
import { TransportationProvider } from './hooks/TransportationContext';
import { VehicleProvider } from './hooks/VehicleContext';
import { SearchModeProvider } from './hooks/SearchModeContext';

const App = () => {
    return (
        <>
            <Router>
                <SearchModeProvider>
                    <AuthProvider>
                        <UserProvider>
                            <VehicleProvider>
                                <ConversationProvider>
                                    <TransportAdProvider>
                                        <CargoAdsProvider>
                                            <CargoRequestsProvider>
                                                <TransportationProvider>
                                                    <Routes>
                                                        {/* ====== АДМИН-МОДУЛЬ (вариант B) ====== */}
                                                        <Route
                                                            path='/admin/*'
                                                            element={
                                                                <AdminAuthGuard>
                                                                    <AdminApp />{' '}
                                                                    {/* Sidebar + Topbar + <Outlet/> */}
                                                                </AdminAuthGuard>
                                                            }
                                                        >
                                                            {/* /admin — пустая стартовая страница админа */}
                                                            <Route
                                                                index
                                                                element={
                                                                    <AdminLanding />
                                                                }
                                                            />

                                                            {/* /admin/ads */}
                                                            <Route
                                                                path='ads'
                                                                element={
                                                                    <AdminAdsProvider>
                                                                        <AdminAds />
                                                                    </AdminAdsProvider>
                                                                }
                                                            />

                                                            <Route
                                                                path='ads/:adId'
                                                                element={
                                                                    <AdminAdPage />
                                                                }
                                                            />

                                                            {/* /admin/users */}
                                                            <Route
                                                                path='users'
                                                                element={
                                                                    <AdminUsersProvider>
                                                                        <AdminUsers />
                                                                    </AdminUsersProvider>
                                                                }
                                                            />
                                                            <Route
                                                                path='downloads'
                                                                element={
                                                                    <AdminDownloads />
                                                                }
                                                            />
                                                        </Route>

                                                        {/* ====== ОСНОВНОЙ САЙТ ====== */}
                                                        <Route
                                                            element={<Layout />}
                                                        >
                                                            <Route
                                                                path='/'
                                                                element={
                                                                    <Home />
                                                                }
                                                            />
                                                            <Route
                                                                path='/__dev__/migrate-cargo'
                                                                element={
                                                                    <MigrateCargoAdsPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/register'
                                                                element={
                                                                    <AuthPage
                                                                        isLogin={
                                                                            false
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='/login'
                                                                element={
                                                                    <AuthPage
                                                                        isLogin={
                                                                            true
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='/auth'
                                                                element={
                                                                    <AuthPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/user-profile'
                                                                element={
                                                                    <ProfileUserPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/new-tansport-ad'
                                                                element={
                                                                    <NewTransportAd />
                                                                }
                                                            />
                                                            <Route
                                                                path='/new-cargo-ad'
                                                                element={
                                                                    <NewCargoAdPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/ads/:adId'
                                                                element={
                                                                    <AdPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/transport-ads/:adId'
                                                                element={
                                                                    <AdPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/my-transport-ads'
                                                                element={
                                                                    <MyTransportAdsPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/cargo-ads/:adId'
                                                                element={
                                                                    <AdPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/my-cargo-ads'
                                                                element={
                                                                    <MyCargoAdsPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/cargo-ads/:adId/edit'
                                                                element={
                                                                    <EditCargoAdPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/dialogs'
                                                                element={
                                                                    <ConversationsPage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/new-vehicle'
                                                                element={
                                                                    <NewVehiclePage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/vehicles/:truckId'
                                                                element={
                                                                    <VehiclePage />
                                                                }
                                                            />
                                                            <Route
                                                                path='/vehicles'
                                                                element={
                                                                    <VehiclesPage />
                                                                }
                                                            />
                                                        </Route>
                                                    </Routes>
                                                </TransportationProvider>
                                            </CargoRequestsProvider>
                                        </CargoAdsProvider>
                                    </TransportAdProvider>
                                </ConversationProvider>
                            </VehicleProvider>
                        </UserProvider>
                    </AuthProvider>
                </SearchModeProvider>
            </Router>
        </>
    );
};

export default App;
