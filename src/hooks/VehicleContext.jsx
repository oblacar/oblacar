// src/contexts/VehicleContext.jsx
import React, { createContext, useEffect, useState, useContext } from 'react';
import {
    saveVehicle as saveVehicleSvc,
    deleteVehicle as deleteVehicleSvc,
    fetchVehiclesByOwner as fetchVehiclesByOwnerSvc,
} from '../services/VehicleService';
import AuthContext from './Authorization/AuthContext'; // путь поправь, если другой

export const VehicleContext = createContext(null);

export const VehicleProvider = ({ children }) => {
    const { userId, isAuthenticated } = useContext(AuthContext);
    const ownerId = isAuthenticated ? userId : null;

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(!!ownerId);
    const [error, setError] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    // Загрузка/очистка при смене ownerId
    useEffect(() => {
        if (!ownerId) {
            setVehicles([]);
            setSelectedVehicleId(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        fetchVehiclesByOwnerSvc(ownerId)
            .then((list) => setVehicles(list))
            .catch((e) => setError(e))
            .finally(() => setLoading(false));
    }, [ownerId]);

    const refresh = async () => {
        if (!ownerId) return;
        setLoading(true);
        setError(null);
        try {
            const list = await fetchVehiclesByOwnerSvc(ownerId);
            setVehicles(list);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    const createVehicle = async (data) => {
        if (!ownerId) throw new Error('ownerId is required');
        setError(null);
        const saved = await saveVehicleSvc(ownerId, data);
        setVehicles((prev) => {
            const idx = prev.findIndex(
                (v) => String(v.truckId) === String(saved.truckId)
            );
            if (idx === -1) return [saved, ...prev];
            const copy = [...prev];
            copy[idx] = saved;
            return copy;
        });
        return saved;
    };

    const updateVehicle = async (truckId, patch) => {
        if (!ownerId) throw new Error('ownerId is required');
        setError(null);
        const saved = await saveVehicleSvc(ownerId, { truckId, ...patch });
        setVehicles((prev) => {
            const idx = prev.findIndex(
                (v) => String(v.truckId) === String(truckId)
            );
            if (idx === -1) return [saved, ...prev];
            const copy = [...prev];
            copy[idx] = saved;
            return copy;
        });
        if (String(selectedVehicleId) === String(truckId)) {
            setSelectedVehicleId(saved.truckId);
        }
        return saved;
    };

    const removeVehicle = async (truckId) => {
        if (!ownerId) throw new Error('ownerId is required');
        await deleteVehicleSvc(ownerId, truckId);
        setVehicles((prev) =>
            prev.filter((v) => String(v.truckId) !== String(truckId))
        );
        if (String(selectedVehicleId) === String(truckId)) {
            setSelectedVehicleId(null);
        }
    };

    const selectVehicle = (truckId) => setSelectedVehicleId(truckId);
    const clearSelection = () => setSelectedVehicleId(null);

    const selectedVehicle =
        vehicles.find((v) => String(v.truckId) === String(selectedVehicleId)) ||
        null;

    return (
        <VehicleContext.Provider
            value={{
                vehicles,
                loading,
                error,

                selectedVehicleId,
                selectedVehicle,
                selectVehicle,
                clearSelection,

                refresh,
                createVehicle,
                updateVehicle,
                removeVehicle,
            }}
        >
            {children}
        </VehicleContext.Provider>
    );
};
