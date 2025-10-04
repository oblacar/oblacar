// src/hooks/CargoAdsContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import CargoAdService from '../services/CargoAdService';
import UserReviewAdService from '../services/UserReviewAdService';

import AuthContext from './Authorization/AuthContext';
import UserContext from './UserContext';

const CargoAdsContext = createContext(null);

export const CargoAdsProvider = ({ children }) => {
  /* ============ AUTH / PROFILE ============ */
  const auth = useContext(AuthContext) || {};
  const authUserId =
    auth.userId ??
    auth.user?.userId ??
    auth.currentUser?.uid ??
    null;

  const { user: profile } = useContext(UserContext) || {};

  /* ============ ADS STATE ============ */
  const [ads, setAds] = useState([]);      // нормализованные объекты { adId, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ============ REVIEWED (отобранные) ============ */
  const [reviewedIds, setReviewedIds] = useState([]); // string[]
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  /* ============ LOAD ADS (список) ============ */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await CargoAdService.getAll(); // вернуть массив объявлений
        if (!mounted) return;
        setAds(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Перезагрузка списка
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await CargoAdService.getAll();
      setAds(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============ CRUD ДЛЯ ОБЪЯВЛЕНИЙ ============ */

  // Создать объявление (подставляем автора из контекста при необходимости)
  const addAd = useCallback(
    async (data) => {
      try {
        const payload = {
          ...data,
          ownerId: data?.ownerId ?? authUserId ?? profile?.userId ?? null,
          ownerName:
            data?.ownerName ??
            profile?.userName ??
            profile?.userEmail ??
            'Пользователь',
          ownerPhotoUrl: data?.ownerPhotoUrl ?? profile?.userPhoto ?? '',
          ownerRating: data?.ownerRating ?? profile?.userRating ?? '',
        };

        const created = await CargoAdService.create(payload);
        setAds((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        return created;
      } catch (e) {
        setError(e?.message || String(e));
        throw e;
      }
    },
    [authUserId, profile]
  );

  // Обновить объявление по id (патчем)
  // src/hooks/CargoAdsContext.jsx

  const updateAd = useCallback(async (adId, patch) => {
    console.groupCollapsed('%c[CargoAdsContext:updateAd] IN', 'color:#0ea5e9');
    console.log('adId:', adId);
    console.log('patch:', patch);
    console.groupEnd();

    try {
      const saved = await CargoAdService.updateById(adId, patch);

      console.groupCollapsed('%c[CargoAdsContext:updateAd] FROM service', 'color:#22c55e');
      console.log('saved:', saved);
      console.log('saved.owner:', saved?.owner);
      console.groupEnd();

      setAds((prev) => {
        const list = Array.isArray(prev) ? prev.slice() : [];
        const idx = list.findIndex((x) => String(x.adId) === String(adId));
        if (idx === -1) return list;

        const next = { ...list[idx], ...saved };
        console.groupCollapsed('%c[CargoAdsContext:updateAd] UPDATE state item', 'color:#f59e0b');
        console.log('before:', list[idx]);
        console.log('after:', next);
        console.groupEnd();

        list[idx] = next;
        return list;
      });

      return saved;
    } catch (e) {
      console.error('[CargoAdsContext:updateAd] error:', e);
      setError(e?.message || String(e));
      throw e;
    }
  }, []);

  // Полное удаление (обычно не показываем обычным юзерам)
  const deleteAd = useCallback(async (adId) => {
    try {
      await CargoAdService.deleteById(adId);
      setAds((prev) => (Array.isArray(prev) ? prev.filter((x) => String(x.adId) !== String(adId)) : []));
      // подчистить локальный избранный список
      setReviewedIds((prev) => prev.filter((id) => String(id) !== String(adId)));
      return true;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  }, []);

  /* ============ SELECTORS ============ */

  // Получить объявление по id из локального стейта
  const getById = useCallback(
    (id) => {
      if (id == null) return null;
      const list = Array.isArray(ads) ? ads : [];
      return list.find((a) => String(a.adId) === String(id)) || null;
    },
    [ads]
  );

  // Получить все объявления по владельцу
  const getByOwner = useCallback(
    (ownerId) => {
      const list = Array.isArray(ads) ? ads : [];
      const oid = String(ownerId ?? '');
      return list.filter((ad) => String(ad.ownerId ?? '') === oid);
    },
    [ads]
  );

  /* ============ REVIEWED (отобранные) ДЛЯ CARGO ============ */

  // Загрузить список id избранных объявлений текущего юзера
  const loadReviewed = useCallback(async () => {
    if (!authUserId) {
      setReviewedIds([]);
      return;
    }
    try {
      setReviewLoading(true);
      setReviewError(null);
      const ids = await UserReviewAdService.getUserReviewAds(authUserId, 'cargo');
      setReviewedIds(Array.isArray(ids) ? ids.map(String) : []);
    } catch (e) {
      setReviewError(e?.message || String(e));
    } finally {
      setReviewLoading(false);
    }
  }, [authUserId]);

  // Обновляем избранное при смене пользователя
  useEffect(() => {
    loadReviewed();
  }, [loadReviewed]);

  // Добавить в избранное (оптимистично — сразу в стейт, при ошибке откат)
  const addReviewAd = useCallback(
    async (adId) => {
      const id = String(adId ?? '');
      if (!id) return;
      if (!authUserId) {
        console.warn('[CargoAdsProvider] addReviewAd: no authUserId, skipped');
        return;
      }

      // локально
      setReviewedIds((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.includes(id) ? list : [id, ...list];
      });

      // в БД
      try {
        await UserReviewAdService.addReviewAd(authUserId, id, 'cargo');
      } catch (e) {
        // откат
        setReviewedIds((prev) =>
          Array.isArray(prev) ? prev.filter((x) => x !== id) : []
        );
        setReviewError(e?.message || String(e));
        throw e;
      }
    },
    [authUserId]
  );

  // Удалить из избранного (оптимистично — сразу из стейта, при ошибке вернуть)
  const removeReviewAd = useCallback(
    async (adId) => {
      const id = String(adId ?? '');
      if (!id) return;
      if (!authUserId) {
        console.warn('[CargoAdsProvider] removeReviewAd: no authUserId, skipped');
        return;
      }

      // локально
      setReviewedIds((prev) =>
        Array.isArray(prev) ? prev.filter((x) => x !== id) : []
      );

      // в БД
      try {
        await UserReviewAdService.removeReviewAd(authUserId, id, 'cargo');
      } catch (e) {
        // откат — добавить id назад
        setReviewedIds((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          return list.includes(id) ? list : [id, ...list];
        });
        setReviewError(e?.message || String(e));
        throw e;
      }
    },
    [authUserId]
  );

  // Переключить избранное (добавить/удалить)
  const toggleReviewAd = useCallback(
    async (adId) => {
      const id = String(adId ?? '');
      if (!id || !authUserId) return;
      if (reviewedIds.includes(id)) {
        return removeReviewAd(id);
      }
      return addReviewAd(id);
    },
    [authUserId, reviewedIds, addReviewAd, removeReviewAd]
  );

  // Проверить — объявление в избранном?
  const isReviewed = useCallback(
    (adId) => reviewedIds.includes(String(adId)),
    [reviewedIds]
  );

  /* ============ STATUS OPS (закрыть / архив / открыть снова) ============ */

  // Закрыть объявление (status -> 'completed'), reason опционально
  const closeAd = useCallback(async (adId, reason) => {
    // оптимистичный апдейт локально
    setAds((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const idx = list.findIndex((a) => String(a.adId) === String(adId));
      if (idx === -1) return list;
      list[idx] = { ...list[idx], status: 'completed', closedReason: reason ?? '' };
      return list;
    });
    try {
      const saved = await CargoAdService.closeById(adId, reason);
      // синхронизация с ответом
      setAds((prev) => {
        const list = Array.isArray(prev) ? prev.slice() : [];
        const idx = list.findIndex((a) => String(a.adId) === String(adId));
        if (idx === -1) return list;
        list[idx] = saved;
        return list;
      });
      return saved;
    } catch (e) {
      // откат через refresh — самый простой и надёжный вариант
      await refresh();
      throw e;
    }
  }, [refresh]);

  // Архивировать объявление (status -> 'archived'), reason опционально
  const archiveAd = useCallback(async (adId, reason) => {
    setAds((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const idx = list.findIndex((a) => String(a.adId) === String(adId));
      if (idx === -1) return list;
      list[idx] = { ...list[idx], status: 'archived', archivedReason: reason ?? '' };
      return list;
    });
    try {
      const saved = await CargoAdService.archiveById(adId, reason);
      setAds((prev) => {
        const list = Array.isArray(prev) ? prev.slice() : [];
        const idx = list.findIndex((a) => String(a.adId) === String(adId));
        if (idx === -1) return list;
        list[idx] = saved;
        return list;
      });
      return saved;
    } catch (e) {
      await refresh();
      throw e;
    }
  }, [refresh]);

  // Снова открыть объявление (status -> 'active')
  const reopenAd = useCallback(async (adId) => {
    setAds((prev) => {
      const list = Array.isArray(prev) ? prev.slice() : [];
      const idx = list.findIndex((a) => String(a.adId) === String(adId));
      if (idx === -1) return list;
      list[idx] = { ...list[idx], status: 'active', closedReason: '', archivedReason: '' };
      return list;
    });
    try {
      const saved = await CargoAdService.reopenById(adId);
      setAds((prev) => {
        const list = Array.isArray(prev) ? prev.slice() : [];
        const idx = list.findIndex((a) => String(a.adId) === String(adId));
        if (idx === -1) return list;
        list[idx] = saved;
        return list;
      });
      return saved;
    } catch (e) {
      await refresh();
      throw e;
    }
  }, [refresh]);

  /* ============ VALUE (публичный API контекста) ============ */
  const value = useMemo(
    () => ({
      // ads
      ads,
      loading,
      error,
      refresh,
      addAd,
      updateAd,
      deleteAd,

      getById,
      getAdById: getById, // алиас
      getByOwner,

      // reviewed
      reviewedIds,
      reviewLoading,
      reviewError,
      loadReviewed,
      addReviewAd,
      removeReviewAd,
      toggleReviewAd,
      isReviewed,

      // status ops
      closeAd,
      archiveAd,
      reopenAd,
    }),
    [
      ads, loading, error, refresh, addAd, updateAd, deleteAd,
      getById, getByOwner,
      reviewedIds, reviewLoading, reviewError,
      loadReviewed, addReviewAd, removeReviewAd, toggleReviewAd, isReviewed,
      closeAd, archiveAd, reopenAd,
    ]
  );

  return (
    <CargoAdsContext.Provider value={value}>
      {children}
    </CargoAdsContext.Provider>
  );
};

export const useCargoAds = () => useContext(CargoAdsContext);

export default CargoAdsContext;
