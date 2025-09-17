// src/contexts/VehicleContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthContext from './Authorization/AuthContext';
import {
    saveVehicle as saveVehicleSvc,
    deleteVehicle as deleteVehicleSvc,
    fetchVehiclesByOwner as fetchVehiclesByOwnerSvc,
} from '../services/VehicleService';

import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

export const VehicleContext = createContext(null);

export const VehicleProvider = ({ children }) => {
    const { userId, isAuthenticated } = useContext(AuthContext);
    const ownerId = isAuthenticated ? userId : null;

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(!!ownerId);
    const [error, setError] = useState(null);

    const [selectedVehicleId, setSelectedVehicleId] = useState(null);

    // ---------- helpers ----------
    const photosToArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.filter(Boolean);
        if (typeof val === 'object') {
            // объект-карта -> в массив, отсортируем по ключу
            return Object.entries(val)
                .sort((a, b) => String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true }))
                .map(([, v]) => v)
                .filter(Boolean);
        }
        return [];
    };

    const needsUpload = (s) => typeof s === 'string' && s.startsWith('data:');

    // dataURL[]/https[] -> https[]
    const uploadTruckPhotos = async (owner, photos = []) => {
        if (!owner) return [];
        const storage = getStorage();
        const out = [];
        for (let i = 0; i < photos.length; i++) {
            const src = photos[i];
            if (!src) continue;
            if (typeof src === 'string' && src.startsWith('https://')) {
                out.push(src); // уже загружено
                continue;
            }
            if (needsUpload(src)) {
                const path = `truckPhotos/${owner}/${Date.now()}_${i}.jpg`;
                const ref = storageRef(storage, path);
                await uploadString(ref, src, 'data_url');
                const url = await getDownloadURL(ref);
                out.push(url);
            }
        }
        return out;
    };

    // ---------- initial load ----------
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

    // ---------- API ----------
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

        const localPhotos = photosToArray(data.truckPhotoUrls);
        const tempId = `tmp_${Date.now()}`;

        // 1) оптимистично добавляем
        const optimistic = {
            ...data,
            truckId: tempId,
            truckPhotoUrls: localPhotos, // пока ещё могут быть dataURL
            _status: 'saving',
        };
        setVehicles((prev) => [optimistic, ...prev]);

        try {
            // 2) грузим фото и заменяем на https
            const httpsPhotos = await uploadTruckPhotos(ownerId, localPhotos);

            // 3) пишем в БД (с https) -> сервис сам превратит массив в объект для Realtime DB
            const saved = await saveVehicleSvc(ownerId, {
                ...data,
                truckPhotoUrls: httpsPhotos,
            });

            // 4) меняем временную запись на финальную
            setVehicles((prev) =>
                prev.map((v) => (v.truckId === tempId ? saved : v))
            );

            // можно авто-выбирать сохранённую
            setSelectedVehicleId(saved.truckId);

            return saved;
        } catch (e) {
            // пометим ошибку на временном элементе
            setVehicles((prev) =>
                prev.map((v) =>
                    v.truckId === tempId ? { ...v, _status: 'error', _error: e?.message || String(e) } : v
                )
            );
            throw e;
        }
    };

    const updateVehicle = async (truckId, patch) => {
        if (!ownerId) throw new Error('ownerId is required');

        // найдём текущую в стейте (на случай слияния)
        const current = vehicles.find((v) => String(v.truckId) === String(truckId)) || {};
        const incomingPhotos = patch.hasOwnProperty('truckPhotoUrls')
            ? photosToArray(patch.truckPhotoUrls)
            : null; // null -> не трогаем фото

        // 1) оптимистично пометим статус и подменим часть полей
        setVehicles((prev) =>
            prev.map((v) =>
                String(v.truckId) === String(truckId)
                    ? { ...v, ...patch, _status: 'saving' }
                    : v
            )
        );

        try {
            // 2) если передали новые фото — прогрузим их
            let httpsPhotos = undefined;
            if (incomingPhotos) {
                httpsPhotos = await uploadTruckPhotos(ownerId, incomingPhotos);
            }

            // 3) пишем в БД (если httpsPhotos не undefined — перезаписываем фото)
            const saved = await saveVehicleSvc(ownerId, {
                truckId,
                ...patch,
                ...(httpsPhotos ? { truckPhotoUrls: httpsPhotos } : {}),
            });

            // 4) обновим в стейте окончательно
            setVehicles((prev) =>
                prev.map((v) => (String(v.truckId) === String(truckId) ? saved : v))
            );

            if (String(selectedVehicleId) === String(truckId)) {
                setSelectedVehicleId(saved.truckId);
            }

            return saved;
        } catch (e) {
            // ошибка — вернём прежнее состояние
            setVehicles((prev) =>
                prev.map((v) =>
                    String(v.truckId) === String(truckId) ? { ...current, _status: 'error', _error: e?.message || String(e) } : v
                )
            );
            throw e;
        }
    };

    const removeVehicle = async (truckId) => {
        if (!ownerId) throw new Error('ownerId is required');

        const backup = vehicles.find((v) => String(v.truckId) === String(truckId));
        // 1) оптимистично удалим
        setVehicles((prev) => prev.filter((v) => String(v.truckId) !== String(truckId)));

        try {
            await deleteVehicleSvc(ownerId, truckId);
            if (String(selectedVehicleId) === String(truckId)) {
                setSelectedVehicleId(null);
            }
        } catch (e) {
            // откат
            if (backup) setVehicles((prev) => [backup, ...prev]);
            throw e;
        }
    };

    const selectVehicle = (truckId) => setSelectedVehicleId(truckId);
    const clearSelection = () => setSelectedVehicleId(null);

    const selectedVehicle =
        vehicles.find((v) => String(v.truckId) === String(selectedVehicleId)) || null;

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
