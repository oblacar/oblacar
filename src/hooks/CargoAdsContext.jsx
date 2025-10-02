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

  /* ============ LOAD ADS ============ */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await CargoAdService.getAll(); // должен вернуть массив объявлений
        if (!mounted) return;
        setAds(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

  /* ============ CRUD ============ */
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

  const updateAd = useCallback(async (adId, patch) => {
    try {
      const saved = await CargoAdService.updateById(adId, patch);
      setAds((prev) => {
        const list = Array.isArray(prev) ? prev.slice() : [];
        const idx = list.findIndex((x) => String(x.adId) === String(adId));
        if (idx === -1) return list;
        list[idx] = saved;
        return list;
      });
      return saved;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  }, []);

  const deleteAd = useCallback(async (adId) => {
    try {
      await CargoAdService.deleteById(adId);
      setAds((prev) => (Array.isArray(prev) ? prev.filter((x) => String(x.adId) !== String(adId)) : []));
      // удаляем локально из избранного, если было
      setReviewedIds((prev) => prev.filter((id) => String(id) !== String(adId)));
      return true;
    } catch (e) {
      setError(e?.message || String(e));
      throw e;
    }
  }, []);

  /* ============ SELECTORS ============ */
  const getById = useCallback(
    (id) => {
      if (id == null) return null;
      const list = Array.isArray(ads) ? ads : [];
      return list.find((a) => String(a.adId) === String(id)) || null;
    },
    [ads]
  );

  const getByOwner = useCallback(
    (ownerId) => {
      const list = Array.isArray(ads) ? ads : [];
      const oid = String(ownerId ?? '');
      return list.filter((ad) => String(ad.ownerId ?? '') === oid);
    },
    [ads]
  );

  /* ============ REVIEWED (отобранные) CARGO ============ */
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

  // грузим/перегружаем избранное при смене пользователя
  useEffect(() => {
    loadReviewed();
  }, [loadReviewed]);

  const addReviewAd = useCallback(
    async (adId) => {
      const id = String(adId ?? '');
      if (!id) return;
      if (!authUserId) {
        console.warn('[CargoAdsProvider] addReviewAd: no authUserId, skipped');
        return;
      }

      // оптимистично добавляем локально
      setReviewedIds((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.includes(id) ? list : [id, ...list];
      });

      try {
        await UserReviewAdService.addReviewAd(authUserId, id, 'cargo');
      } catch (e) {
        // откат локально
        setReviewedIds((prev) =>
          Array.isArray(prev) ? prev.filter((x) => x !== id) : []
        );
        setReviewError(e?.message || String(e));
        throw e;
      }
    },
    [authUserId]
  );

  const removeReviewAd = useCallback(
    async (adId) => {
      const id = String(adId ?? '');
      if (!id) return;
      if (!authUserId) {
        console.warn('[CargoAdsProvider] removeReviewAd: no authUserId, skipped');
        return;
      }

      // оптимистично удаляем локально
      setReviewedIds((prev) =>
        Array.isArray(prev) ? prev.filter((x) => x !== id) : []
      );

      try {
        await UserReviewAdService.removeReviewAd(authUserId, id, 'cargo');
      } catch (e) {
        // откат локально (вернём id назад)
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


  const isReviewed = useCallback(
    (adId) => reviewedIds.includes(String(adId)),
    [reviewedIds]
  );

  /* ============ VALUE ============ */
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
    }),
    [
      ads, loading, error, refresh, addAd, updateAd, deleteAd,
      getById, getByOwner,
      reviewedIds, reviewLoading, reviewError,
      loadReviewed, addReviewAd, removeReviewAd, toggleReviewAd, isReviewed,
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
