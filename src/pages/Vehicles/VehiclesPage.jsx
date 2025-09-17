// src/pages/Vehicles/VehiclesPage.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { VehicleContext } from '../../hooks/VehicleContext';
import VehicleCard from '../../components/VehicleCard/VehicleCard';
import Button from '../../components/common/Button/Button';

import './VehiclesPages.css'

const VehiclesPage = () => {
    const { vehicles, loading, error } = useContext(VehicleContext);

    return (
        <div className="deliveries-container">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <h1 className="page-title">Мой транспорт</h1>
                <Link to="/new-vehicle">
                    <Button type_btn="">Добавить машину</Button>
                </Link>
            </div>

            {loading && <p>Загрузка…</p>}
            {error && <p className="error-text">Ошибка: {String(error)}</p>}

            {!loading && vehicles.length === 0 && (
                <div className="empty-state" style={{ padding: '12px 0' }}>
                    <p>Пока нет машин.</p>
                    <Link to="/new-vehicle">
                        <Button type_btn="">Создать первую</Button>
                    </Link>
                </div>
            )}

            {!!vehicles.length && (
                <div className="vehicles-grid">
                    {vehicles.map((v) => (
                        <Link
                            key={v.truckId}
                            to={`/vehicles/${v.truckId}`}
                            className="vehicle-grid-item"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <VehicleCard
                                vehicle={v}
                                className="vehicle-card--compact"
                                isCreateCard={false}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VehiclesPage;
