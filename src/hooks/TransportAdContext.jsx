// src/hooks/TransportAd/TransportAdContext.js
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react';

import TransportAdService from '../services/TransportAdService';
import UserReviewAdService from '../services/UserReviewAdService';

import AuthContext from './Authorization/AuthContext';
import UserContext from './UserContext';

const TransportAdContext = createContext();

// при больших объёмах выгоднее читать из БД по индексу, чем фильтровать в памяти
const OWNER_FILTER_THRESHOLD = 400;

export const TransportAdProvider = ({ children }) => {
    const { userId: authUserId } = useContext(AuthContext) || {};
    const { user, isUserLoaded } = useContext(UserContext) || {};

    // Расширённые объявления: [{ ad: {...}, isInReviewAds: boolean }]
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Список «вариантов» в том же расширенном формате
    const [reviewAds, setReviewAds] = useState([]);

    // ===================== Утилиты =====================

    // Проверка: уже расширенная структура или только plain ad
    const isExtendedAd = (x) =>
        x && typeof x === 'object' && 'isInReviewAds' in x && 'ad' in x;

    // Делает из plain-объявлений расширенные с пометкой «в вариантах»
    const extendPlainAds = useCallback(
        (plainAds, reviewIds = []) => {
            const reviewSet = new Set(reviewIds.map(String));
            return (Array.isArray(plainAds) ? plainAds : []).map((ad) => ({
                ad,
                isInReviewAds: reviewSet.has(String(ad.adId)),
            }));
        },
        []
    );

    // Выгружает отсутствующие в ads «вариантные» объявления по их id,
    // чтобы список reviewAds был полным даже для удалённых из общего фида ad'ов
    const fetchMissingReviewAds = useCallback(
        async (reviewIds, alreadyInAdsExtended) => {
            const existingSet = new Set(
                alreadyInAdsExtended.map((x) => String(x.ad?.adId))
            );
            const result = [...alreadyInAdsExtended];

            for (const id of reviewIds) {
                const sid = String(id);
                if (existingSet.has(sid)) continue;
                try {
                    const adData = await TransportAdService.getAdById(sid);
                    if (adData) {
                        result.push({ ad: adData, isInReviewAds: true });
                    }
                } catch (e) {
                    console.warn('Не удалось получить объявление по id:', sid, e);
                }
            }
            return result;
        },
        []
    );

    // Пересчитывает reviewAds на основе текущих ads и массива reviewIds
    const rebuildReviewAdsFrom = useCallback(
        async (reviewIds) => {
            const inAds = (Array.isArray(ads) ? ads : []).filter((x) =>
                reviewIds.includes(String(x?.ad?.adId))
            );
            const completed = await fetchMissingReviewAds(reviewIds, inAds);
            setReviewAds(completed);
        },
        [ads, fetchMissingReviewAds]
    );

    // ===================== Стартовая загрузка =====================

    // 1) «Гостевой» фид: если нет авторизации — просто грузим все объявления без вариантов
    useEffect(() => {
        const noAuth =
            !localStorage.getItem('authToken') && !localStorage.getItem('authEmail');

        if (!noAuth) return;

        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await TransportAdService.getAllAds();
                if (cancelled) return;
                setAds(
                    (Array.isArray(data) ? data : []).map((ad) => ({
                        ad,
                        isInReviewAds: false,
                    }))
                );
                setReviewAds([]); // для гостей пусто
            } catch (e) {
                if (!cancelled) setError(e?.message || String(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // 2) Авторизованный сценарий: ждём профиль и грузим и фид, и избранные
    useEffect(() => {
        const hasAuth =
            localStorage.getItem('authToken') || localStorage.getItem('authEmail');
        if (!hasAuth) return;
        if (!isUserLoaded) return; // ждём профиль

        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [allAds, reviewIdsRaw] = await Promise.all([
                    TransportAdService.getAllAds(),
                    // ВАЖНО: сервис возвращает МАССИВ adId
                    UserReviewAdService.getUserReviewAds(authUserId, 'transport'),
                ]);

                const reviewIds = Array.isArray(reviewIdsRaw) ? reviewIdsRaw : [];
                if (cancelled) return;

                // размечаем общий фид
                const extended = extendPlainAds(allAds, reviewIds);
                setAds(extended);

                // собираем полную «корзину вариантов»
                const inReview = extended.filter((x) =>
                    reviewIds.includes(String(x.ad.adId))
                );
                const completed = await fetchMissingReviewAds(reviewIds, inReview);
                if (cancelled) return;
                setReviewAds(completed);
            } catch (e) {
                if (!cancelled) setError(e?.message || String(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        authUserId,
        isUserLoaded,
        extendPlainAds,
        fetchMissingReviewAds,
    ]);

    // ===================== API: CRUD объявлений =====================

    const addAd = useCallback(async (adData) => {
        try {
            // допускаем как plain ad, так и уже расширенный объект
            const isExt = isExtendedAd(adData);
            const toSave = isExt ? adData.ad : adData;
            const created = await TransportAdService.createAd(toSave);

            const createdExt = { ad: created, isInReviewAds: false };
            setAds((prev) => [...prev, createdExt]);
            return true;
        } catch (err) {
            setError(err?.message || String(err));
            return false;
        }
    }, []);

    const getAdById = useCallback(
        (adId) => (Array.isArray(ads) ? ads : []).find((x) => x?.ad?.adId === adId),
        [ads]
    );

    const updateAd = useCallback(async (adId, patch) => {
        // при необходимости допиши
        console.warn('updateAd не реализован');
    }, []);

    const deleteAd = useCallback(async (adId) => {
        // при необходимости допиши
        console.warn('deleteAd не реализован');
    }, []);

    // ===================== API: Работа с «Вариантами» =====================

    const loadReviewAds = useCallback(
        async (userIdOverride) => {
            const uid = userIdOverride || authUserId;
            if (!uid) {
                setReviewAds([]);
                return;
            }
            try {
                const reviewIds = await UserReviewAdService.getUserReviewAds(
                    uid,
                    'transport'
                );
                await rebuildReviewAdsFrom(
                    (Array.isArray(reviewIds) ? reviewIds : []).map(String)
                );

                // Также обновим флажки в основном фиде
                setAds((prev) => {
                    const setIds = new Set(
                        (Array.isArray(reviewIds) ? reviewIds : []).map(String)
                    );
                    return (Array.isArray(prev) ? prev : []).map((x) => ({
                        ...x,
                        isInReviewAds: setIds.has(String(x?.ad?.adId)),
                    }));
                });
            } catch (e) {
                console.error('loadReviewAds error:', e);
            }
        },
        [authUserId, rebuildReviewAdsFrom]
    );

    const addReviewAd = useCallback(
        async (extAd) => {
            // API для совместимости (ожидает расширенный объект)
            const adId = String(extAd?.ad?.adId);
            if (!authUserId || !adId) return;

            // оптимистично: ставим флаг в фиде
            setAds((prev) =>
                (Array.isArray(prev) ? prev : []).map((x) =>
                    String(x?.ad?.adId) === adId ? { ...x, isInReviewAds: true } : x
                )
            );

            // и добавляем в список «вариантов», если его там ещё нет
            setReviewAds((prev) => {
                const exists = (Array.isArray(prev) ? prev : []).some(
                    (x) => String(x?.ad?.adId) === adId
                );
                if (exists) return prev;
                return [...(prev || []), { ad: extAd.ad, isInReviewAds: true }];
            });

            try {
                await UserReviewAdService.addReviewAd(authUserId, adId, 'transport');
            } catch (e) {
                // откат при ошибке
                setAds((prev) =>
                    (Array.isArray(prev) ? prev : []).map((x) =>
                        String(x?.ad?.adId) === adId ? { ...x, isInReviewAds: false } : x
                    )
                );
                setReviewAds((prev) =>
                    (Array.isArray(prev) ? prev : []).filter(
                        (x) => String(x?.ad?.adId) !== adId
                    )
                );
                setError(e?.message || String(e));
            }
        },
        [authUserId]
    );

    const removeReviewAd = useCallback(
        async (extAd) => {
            const adId = String(extAd?.ad?.adId);
            if (!authUserId || !adId) return;

            // оптимистично: снимаем флаг и убираем из списка
            setAds((prev) =>
                (Array.isArray(prev) ? prev : []).map((x) =>
                    String(x?.ad?.adId) === adId ? { ...x, isInReviewAds: false } : x
                )
            );
            setReviewAds((prev) =>
                (Array.isArray(prev) ? prev : []).filter(
                    (x) => String(x?.ad?.adId) !== adId
                )
            );

            try {
                await UserReviewAdService.removeReviewAd(authUserId, adId, 'transport');
            } catch (e) {
                // откат
                setAds((prev) =>
                    (Array.isArray(prev) ? prev : []).map((x) =>
                        String(x?.ad?.adId) === adId ? { ...x, isInReviewAds: true } : x
                    )
                );
                setReviewAds((prev) => [...(prev || []), { ad: extAd.ad, isInReviewAds: true }]);
                setError(e?.message || String(e));
            }
        },
        [authUserId]
    );

    // Вспомогалки для UI: можно ли быстро подсветить сердечко/кнопку
    const isReviewed = useCallback(
        (adId) =>
            (Array.isArray(reviewAds) ? reviewAds : []).some(
                (x) => String(x?.ad?.adId) === String(adId)
            ),
        [reviewAds]
    );

    // ===================== Поиск по владельцу =====================

    const getAdsByUserId = useCallback(
        async (ownerId, opts = {}) => {
            const { forceDb = false } = opts;
            if (!ownerId) return [];

            const hasLocal = Array.isArray(ads) && ads.length > 0;
            if (!forceDb && hasLocal && ads.length <= OWNER_FILTER_THRESHOLD) {
                return ads.filter(
                    (x) => (x?.ad?.ownerId ?? x?.ownerId) === String(ownerId)
                );
            }

            // быстрый путь из БД по индексу ownerId
            const plain = await TransportAdService.getAdsByOwner(ownerId);
            // разметим по текущим reviewAds
            const reviewIds = (Array.isArray(reviewAds) ? reviewAds : []).map(
                (x) => String(x?.ad?.adId)
            );
            return extendPlainAds(plain, reviewIds);
        },
        [ads, reviewAds, extendPlainAds]
    );

    // ===================== Фото-пакет (как было) =====================

    const [photos, setPhotos] = useState([]);
    const uploadPhotos = useCallback(async (selectedPhotos) => {
        try {
            const uploaded = await TransportAdService.uploadPhotoSet(selectedPhotos);
            setPhotos((prev) => [...prev, ...(uploaded || [])]);
        } catch (e) {
            console.error('Ошибка при загрузке фото:', e);
        }
    }, []);

    // ===================== value =====================

    const value = useMemo(
        () => ({
            ads,
            loading,
            error,

            addAd,
            getAdById,
            getById: getAdById, // алиас

            updateAd,
            deleteAd,

            // избранные/варианты
            reviewAds,
            loadReviewAds,
            addReviewAd,
            removeReviewAd,
            isReviewed,

            photos,
            uploadPhotos,

            getAdsByUserId,
        }),
        [
            ads,
            loading,
            error,
            addAd,
            getAdById,
            updateAd,
            deleteAd,
            reviewAds,
            loadReviewAds,
            addReviewAd,
            removeReviewAd,
            isReviewed,
            photos,
            uploadPhotos,
            getAdsByUserId,
        ]
    );

    return (
        <TransportAdContext.Provider value={value}>
            {children}
        </TransportAdContext.Provider>
    );
};

export const useTransportAdContext = () => useContext(TransportAdContext);

export default TransportAdContext;
