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

/**
 * Контекст транспортных объявлений.
 *
 * Формат данных в этом контексте — "расширенные объявления":
 *   { ad: TransportAd, isInReviewAds: boolean }
 *
 * Где TransportAd — строгая сущность с ожидаемыми полями, включая:
 *   adId, ownerId, ..., createdAt, updatedAt
 * Контекст НЕ модифицирует и НЕ нормализует сущность TransportAd;
 * ответственность за корректную структуру — на сервисе/внешних слоях.
 */
const TransportAdContext = createContext();

// При больших объёмах выгоднее читать из БД по индексу, чем фильтровать в памяти.
const OWNER_FILTER_THRESHOLD = 400;

export const TransportAdProvider = ({ children }) => {
    const { userId: authUserId } = useContext(AuthContext) || {};
    const { user, isUserLoaded } = useContext(UserContext) || {};

    // Расширённые объявления: [{ ad: TransportAd, isInReviewAds: boolean }]
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Список «вариантов» (избранных пользователем) — тот же расширенный формат
    const [reviewAds, setReviewAds] = useState([]);

    // ===================== Утилиты =====================

    // Проверка: уже расширенная структура или plain (обычный) TransportAd
    const isExtendedAd = (x) =>
        x && typeof x === 'object' && 'isInReviewAds' in x && 'ad' in x;

    /**
     * Делает из plain-объявлений расширенные с пометкой «в вариантах».
     * @param {TransportAd[]} plainAds
     * @param {string[]} reviewIds список adId, находящихся в «вариантах»
     * @returns {{ad: TransportAd, isInReviewAds: boolean}[]}
     */
    const extendPlainAds = useCallback((plainAds, reviewIds = []) => {
        const reviewSet = new Set(reviewIds.map(String));
        return (Array.isArray(plainAds) ? plainAds : []).map((ad) => ({
            ad,
            isInReviewAds: reviewSet.has(String(ad.adId)),
        }));
    }, []);

    /**
     * Догружаем те «вариантные» объявления, которых нет в общем фиде,
     * чтобы корзина вариантов была полной даже если некоторые позиции скрыты из общего списка.
     */
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
                    console.warn(
                        'Не удалось получить объявление по id:',
                        sid,
                        e
                    );
                }
            }
            return result;
        },
        []
    );

    /**
     * Пересчитывает список reviewAds на основе текущего фида и массива reviewIds.
     */
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

    /**
     * Селектор «даты объявления» для UI/сортировок:
     * обычно берём updatedAt, если нет — createdAt, иначе null.
     * Контекст НИЧЕГО не сочиняет и не форматирует — только выбирает.
     */
    const getDisplayTimestamp = useCallback(
        (ad) => ad?.updatedAt ?? ad?.createdAt ?? null,
        []
    );

    // ===================== Стартовая загрузка =====================

    // 1) «Гостевой» сценарий: нет авторизации → грузим общий фид, варианты пустые.
    useEffect(() => {
        const noAuth =
            !localStorage.getItem('authToken') &&
            !localStorage.getItem('authEmail');

        if (!noAuth) return;

        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await TransportAdService.getAllAds(); // <- возвращает массив строгих TransportAd
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

    // 2) Авторизованный сценарий: ждём профиль и грузим фид + список «вариантов»
    useEffect(() => {
        const hasAuth =
            localStorage.getItem('authToken') ||
            localStorage.getItem('authEmail');
        if (!hasAuth) return;
        if (!isUserLoaded) return; // ждём профиль

        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const [allAds, reviewIdsRaw] = await Promise.all([
                    TransportAdService.getAllAds(),
                    // ВАЖНО: сервис возвращает МАССИВ строковых adId
                    UserReviewAdService.getUserReviewAds(
                        authUserId,
                        'transport'
                    ),
                ]);

                const reviewIds = Array.isArray(reviewIdsRaw)
                    ? reviewIdsRaw
                    : [];
                if (cancelled) return;

                // Размечаем общий фид флагами isInReviewAds
                const extended = extendPlainAds(allAds, reviewIds);
                setAds(extended);

                // Собираем полную корзину «вариантов»
                const inReview = extended.filter((x) =>
                    reviewIds.includes(String(x.ad.adId))
                );
                const completed = await fetchMissingReviewAds(
                    reviewIds,
                    inReview
                );
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
    }, [authUserId, isUserLoaded, extendPlainAds, fetchMissingReviewAds]);

    // ===================== API: CRUD объявлений =====================

    /**
     * Добавление объявления.
     * Допускается как plain TransportAd (строгая сущность), так и расширенный объект {ad, isInReviewAds}.
     * В БД создаёт запись через сервис; локально добавляет как {ad: TransportAd, isInReviewAds: false}.
     */
    const addAd = useCallback(async (adData) => {
        try {
            const isExt = isExtendedAd(adData);
            const toSave = isExt ? adData.ad : adData; // ожидается строгий TransportAd (без локальных флагов)
            const created = await TransportAdService.createAd(toSave); // <- вернёт строгий TransportAd с adId/createdAt/updatedAt
            const createdExt = { ad: created, isInReviewAds: false };
            setAds((prev) => [...prev, createdExt]);
            return true;
        } catch (err) {
            setError(err?.message || String(err));
            return false;
        }
    }, []);

    /**
     * Быстрый поиск расширенного объявления по id в локальном фиде.
     */
    const getAdById = useCallback(
        (adId) =>
            (Array.isArray(ads) ? ads : []).find((x) => x?.ad?.adId === adId),
        [ads]
    );

    /**
     * Обновление объявления.
     * patch — частичное обновление TransportAd (строгие поля). Контекст НЕ дописывает createdAt/updatedAt —
     * эти поля ставит сервис. Возвращаемый сервисом TransportAd полностью заменяет локальный ad (флаг isInReviewAds сохраняем).
     */
    const updateAd = useCallback(async (adId, patch) => {
        if (!adId) return false;
        try {
            const updated = await TransportAdService.updateAd(adId, patch);
            if (!updated) return false;

            // Обновляем основной фид
            setAds((prev) =>
                (Array.isArray(prev) ? prev : []).map((x) =>
                    String(x?.ad?.adId) === String(adId)
                        ? { ...x, ad: updated }
                        : x
                )
            );

            // Если объявление есть в «вариантах», обновим и там
            setReviewAds((prev) =>
                (Array.isArray(prev) ? prev : []).map((x) =>
                    String(x?.ad?.adId) === String(adId)
                        ? { ...x, ad: updated }
                        : x
                )
            );

            return true;
        } catch (e) {
            setError(e?.message || String(e));
            return false;
        }
    }, []);

    /**
     * Удаление: пока заглушка. Если понадобится мягкое удаление — лучше обновлять статус в сервисе (status='deleted')
     * и затем локально вычищать по условию.
     */
    const deleteAd = useCallback(async (adId) => {
        console.warn('deleteAd не реализован');
    }, []);

    // ===================== API: Работа с «Вариантами» =====================

    /**
     * Перечитать список «вариантов» пользователя и размесить флажки в основном фиде.
     */
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

    /**
     * Добавить объявление в «Варианты» (избранное). На вход ожидается расширенное объявление {ad, isInReviewAds}.
     * Оптимистично меняем локальное состояние, затем подтверждаем на сервере.
     */
    const addReviewAd = useCallback(
        async (extAd) => {
            const adId = String(extAd?.ad?.adId);
            if (!authUserId || !adId) return;

            // Оптимистично: отметим во фиде
            setAds((prev) =>
                (Array.isArray(prev) ? prev : []).map((x) =>
                    String(x?.ad?.adId) === adId
                        ? { ...x, isInReviewAds: true }
                        : x
                )
            );

            // И добавим в reviewAds, если его там ещё нет
            setReviewAds((prev) => {
                const exists = (Array.isArray(prev) ? prev : []).some(
                    (x) => String(x?.ad?.adId) === adId
                );
                if (exists) return prev;
                return [...(prev || []), { ad: extAd.ad, isInReviewAds: true }];
            });

            try {
                await UserReviewAdService.addReviewAd(
                    authUserId,
                    adId,
                    'transport'
                );
            } catch (e) {
                // Откат при ошибке
                setAds((prev) =>
                    (Array.isArray(prev) ? prev : []).map((x) =>
                        String(x?.ad?.adId) === adId
                            ? { ...x, isInReviewAds: false }
                            : x
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

    /**
     * Удалить из «Вариантов».
     */
    const removeReviewAd = useCallback(
        async (extAd) => {
            const adId = String(extAd?.ad?.adId);
            if (!authUserId || !adId) return;

            // Оптимистично снимаем флаг и выкидываем из списка
            setAds((prev) =>
                (Array.isArray(prev) ? prev : []).map((x) =>
                    String(x?.ad?.adId) === adId
                        ? { ...x, isInReviewAds: false }
                        : x
                )
            );
            setReviewAds((prev) =>
                (Array.isArray(prev) ? prev : []).filter(
                    (x) => String(x?.ad?.adId) !== adId
                )
            );

            try {
                await UserReviewAdService.removeReviewAd(
                    authUserId,
                    adId,
                    'transport'
                );
            } catch (e) {
                // Откат при ошибке
                setAds((prev) =>
                    (Array.isArray(prev) ? prev : []).map((x) =>
                        String(x?.ad?.adId) === adId
                            ? { ...x, isInReviewAds: true }
                            : x
                    )
                );
                setReviewAds((prev) => [
                    ...(prev || []),
                    { ad: extAd.ad, isInReviewAds: true },
                ]);
                setError(e?.message || String(e));
            }
        },
        [authUserId]
    );

    /**
     * Быстрая проверка, находится ли объявление в «вариантах».
     */
    const isReviewed = useCallback(
        (adId) =>
            (Array.isArray(reviewAds) ? reviewAds : []).some(
                (x) => String(x?.ad?.adId) === String(adId)
            ),
        [reviewAds]
    );

    // ===================== Поиск по владельцу =====================

    /**
     * Получить объявления по ownerId.
     * Если локальный фид небольшой, отфильтруем из него (быстрее).
     * Иначе запросим напрямую из БД по индексу ownerId (TransportAdService.getAdsByOwnerId).
     * Возвращаем РАСШИРЕННЫЕ объявления (для совместимости с UI).
     */
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

            // Быстрый путь из БД по индексу ownerId (СЕРВИС возвращает plain TransportAd[])
            const plain = await TransportAdService.getAdsByOwnerId(ownerId);

            // Разметим по текущим reviewAds (флажки)
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
            const uploaded = await TransportAdService.uploadPhotoSet(
                selectedPhotos
            );
            setPhotos((prev) => [...prev, ...(uploaded || [])]);
        } catch (e) {
            console.error('Ошибка при загрузке фото:', e);
        }
    }, []);

    // ===================== value =====================

    const value = useMemo(
        () => ({
            // Состояние
            ads,
            loading,
            error,

            // CRUD
            addAd,
            getAdById,
            getById: getAdById, // алиас
            updateAd,
            deleteAd,

            // Варианты
            reviewAds,
            loadReviewAds,
            addReviewAd,
            removeReviewAd,
            isReviewed,

            // Фото
            photos,
            uploadPhotos,

            // Поиск
            getAdsByUserId,

            // Селектор даты (для UI/сортировок)
            getDisplayTimestamp,
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
            getDisplayTimestamp,
        ]
    );

    return (
        <TransportAdContext.Provider value={value}>
            {children}
        </TransportAdContext.Provider>
    );
};

/**
 * Хук доступа к контексту транспортных объявлений.
 * Возвращает объект с полями из value (см. выше).
 */
export const useTransportAdContext = () => useContext(TransportAdContext);

export default TransportAdContext;
