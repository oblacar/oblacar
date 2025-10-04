// src/pages/CargoAds/EditCargoAdPage.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import Button from '../../../../components/common/Button/Button';
import ConfirmationDialog from '../../../../components/common/ConfirmationDialog/ConfirmationDialog';
import CreateCargoAdForm from '../../../../components/CargoAds/CreateCargoAdForm/CreateCargoAdForm';
import CargoAdItem from '../../../../components/CargoAds/CargoAdItem';

import CargoAdsContext from '../../../../hooks/CargoAdsContext';
import UserContext from '../../../../hooks/UserContext';
import '../NewCargoAd/NewCargoAdPage.css'; // переиспользуем стили от страницы создания

// форма ожидает такой shape — берём ваш initialState как ориентир
const emptyForm = {
    ownerId: '',
    ownerName: '',
    ownerPhotoUrl: '',
    ownerRating: '',
    createdAt: new Date().toISOString(),

    departureCity: '',
    destinationCity: '',

    pickupDate: '',     // = availabilityFrom
    deliveryDate: '',   // = availabilityTo

    price: '',
    paymentUnit: 'руб',
    readyToNegotiate: true,

    title: '',
    cargoType: '',
    description: '',
    photos: [],

    weightTons: '',
    dimensionsMeters: { height: '', width: '', depth: '' },

    quantity: '',
    packagingType: '',
    packagingTypes: [],

    isFragile: false,
    isStackable: false,
    adrClass: '',
    temperature: { mode: 'ambient', minC: '', maxC: '' },

    preferredLoadingTypes: [],
};

/** маппинг: объявление -> значения формы */
function adToForm(ad = {}) {
    const route = ad.route || {};

    // --- ЦЕНА (плоско, с защитой на старый формат)
    const priceValue = (typeof ad.price === 'number')
        ? ad.price
        : (ad && typeof ad.price === 'object')
            ? (ad.price.value ?? '')
            : (ad.price ?? '');

    const paymentUnit = ad.paymentUnit ?? (
        (ad && typeof ad.price === 'object') ? ad.price.unit : 'руб'
    );

    const readyToNegotiate = (ad.readyToNegotiate != null)
        ? !!ad.readyToNegotiate
        : ((ad && typeof ad.price === 'object') ? !!ad.price.readyToNegotiate : true);

    // габариты/вес
    const weightTons =
        ad?.cargo?.weightTons ??
        ad?.weightTons ??
        ad?.cargoWeightTons ??
        '';

    const height =
        ad?.cargo?.dims?.h ??
        ad?.cargoHeight ??
        ad?.dimensionsMeters?.height ??
        '';

    const width =
        ad?.cargo?.dims?.w ??
        ad?.cargoWidth ??
        ad?.dimensionsMeters?.width ??
        '';

    const depth =
        ad?.cargo?.dims?.d ??
        ad?.cargoDepth ??
        ad?.dimensionsMeters?.depth ??
        '';

    // preferredLoadingTypes: объект -> массив
    let preferredLoadingTypes = [];
    const plt = ad.preferredLoadingTypes ?? ad.loadingTypes;
    if (Array.isArray(plt)) preferredLoadingTypes = plt;
    else if (plt && typeof plt === 'object') {
        preferredLoadingTypes = Object.keys(plt).filter(k => !!plt[k]);
    }

    // ФОТО: сервис отдаёт [{id,url}] -> форма ждёт [{id,src}]
    const photos = Array.isArray(ad.photos)
        ? ad.photos.map(p => {
            if (typeof p === 'string') return { id: p, src: p };
            return { id: p?.id ?? String(Math.random()), src: p?.src ?? p?.url ?? '' };
        }).filter(p => !!p.src)
        : [];

    const form = {
        ...emptyForm,

        // владелец
        ownerId: ad.ownerId ?? ad.owner?.id ?? '',
        ownerName: ad.ownerName ?? ad.owner?.name ?? '',
        ownerPhotoUrl: ad.ownerPhotoUrl ?? ad.owner?.photoUrl ?? '',
        ownerRating: ad.ownerRating ?? ad.owner?.rating ?? '',

        createdAt: ad.createdAt || new Date().toISOString(),

        // маршрут
        departureCity:
            route.from ??
            route.departureCity ??
            ad.departureCity ??
            ad.from ??
            '',
        destinationCity:
            route.to ??
            route.destinationCity ??
            ad.destinationCity ??
            ad.to ??
            '',

        // даты (форма использует pickup/delivery)
        pickupDate:
            ad.availabilityFrom ??
            ad.pickupDate ??
            ad?.dates?.pickupDate ??
            '',
        deliveryDate:
            ad.availabilityTo ??
            ad.deliveryDate ??
            ad?.dates?.deliveryDate ??
            '',

        // ДЕНЬГИ — ПЛОСКО
        price: priceValue ?? '',
        paymentUnit,
        readyToNegotiate,

        // описание груза
        title: ad.title ?? ad?.cargo?.name ?? '',
        cargoType: ad.cargoType ?? ad?.cargo?.type ?? '',
        description: ad.description ?? '',

        // 👇 сюда кладём уже {id,src}
        photos,

        weightTons,
        dimensionsMeters: {
            height: height ?? '',
            width: width ?? '',
            depth: depth ?? '',
        },

        quantity: ad.quantity ?? '',
        packagingType: ad.packagingType ?? '',
        packagingTypes: ad.packagingTypes ?? [],

        isFragile: !!(ad.isFragile ?? ad?.cargo?.fragile),
        isStackable: !!(ad.isStackable ?? ad?.cargo?.isStackable),

        adrClass: ad.adrClass ?? '',

        temperature: ad.temperature ?? ad?.cargo?.temperature ?? { mode: 'ambient', minC: '', maxC: '' },

        preferredLoadingTypes,
    };

    console.groupCollapsed('%c[EDIT] adToForm -> formData', 'color:#0284c7');
    console.log('ad:', ad);
    console.log('form:', form);
    console.groupEnd();

    return form;
}

/** маппинг: значения формы -> patch к объявлению (пишем плоскую цену) */
function formToPatch(fd) {
    const priceNum = (fd.price === '' || fd.price == null) ? null : Number(fd.price);

    // ФОТО: форма держит [{id,src}] -> в БД пишем [{id,url}]
    const photosForDb = Array.isArray(fd.photos)
        ? fd.photos
            .map(p => {
                const url = p?.url ?? p?.src ?? (typeof p === 'string' ? p : '');
                const id = p?.id ?? String(Math.random());
                return url ? { id, url } : null;
            })
            .filter(Boolean)
        : [];

    return {
        title: fd.title || null,
        description: fd.description || null,

        // маршрут (канон — route.{from,to})
        route: {
            from: fd.departureCity || null,
            to: fd.destinationCity || null,
        },

        // даты (канон — availability* — сервис склеит availabilityDate)
        availabilityFrom: fd.pickupDate || null,
        availabilityTo: fd.deliveryDate || null,

        // ДЕНЬГИ — ПЛОСКО
        price: Number.isFinite(priceNum) ? priceNum : null,
        paymentUnit: fd.paymentUnit || 'руб',
        readyToNegotiate: !!fd.readyToNegotiate,

        // груз
        cargoType: fd.cargoType || null,

        // габариты/вес
        weightTons: fd.weightTons ? Number(fd.weightTons) : null,
        dimensionsMeters: {
            height: fd.dimensionsMeters?.height || null,
            width: fd.dimensionsMeters?.width || null,
            depth: fd.dimensionsMeters?.depth || null,
        },

        quantity: fd.quantity || null,
        packagingType: fd.packagingType || null,
        packagingTypes: Array.isArray(fd.packagingTypes) ? fd.packagingTypes : [],

        isFragile: !!fd.isFragile,
        isStackable: !!fd.isStackable,
        adrClass: fd.adrClass || null,

        temperature: fd.temperature || null,

        // loading types — сервис сам нормализует в map
        preferredLoadingTypes: fd.preferredLoadingTypes || [],
        loadingTypes: fd.preferredLoadingTypes || [],

        // 👇 отдаём сервису массив {id,url}; он уже сам превратит в map
        photos: photosForDb,

        updatedAt: new Date().toISOString(),
    };
}


/** Дополняем patch.owner перед сохранением — НЕ затирая существующие значения */
function ensureOwnerForSave(patch, ad, profile) {
    const mergedOwner = {
        id: ad?.owner?.id ?? ad?.ownerId ?? profile?.userId ?? patch?.owner?.id ?? null,
        name:
            patch?.owner?.name ??
            ad?.owner?.name ??
            ad?.ownerName ??
            profile?.userName ??
            profile?.userEmail ??
            'Пользователь',
        photoUrl:
            patch?.owner?.photoUrl ??
            ad?.owner?.photoUrl ??
            ad?.ownerAvatar ??
            ad?.ownerPhotoUrl ??
            profile?.userPhoto ??
            '',
        rating: patch?.owner?.rating ?? ad?.owner?.rating ?? null,
    };

    const out = {
        ...patch,
        owner: {
            ...(patch?.owner || {}),
            ...mergedOwner,
        },
        ownerId: mergedOwner.id ?? ad?.ownerId ?? null,
        // подчистим легаси-ключи на всякий случай (сервис тоже чистит, но пусть дубль-контроль будет)
        ownerName: null,
        ownerPhotoUrl: null,
        ownerRating: null,
    };

    console.groupCollapsed('%c[EDIT] ensureOwnerForSave -> patch with owner', 'color:#7c3aed');
    console.log(out);
    console.groupEnd();

    return out;
}

const EditCargoAdPage = () => {
    const { adId } = useParams();
    const navigate = useNavigate();

    const {
        getById, updateAd, refresh, loading, error
    } = useContext(CargoAdsContext);

    const { user: profile } = useContext(UserContext) || {};

    const ad = useMemo(() => getById(adId), [getById, adId]);

    const formRef = useRef(null);
    const [formData, setFormData] = useState(emptyForm);
    const updateFormData = (patch) => setFormData((p) => ({ ...p, ...patch }));

    // ui: 'idle' | 'confirm' | 'saving' | 'error'
    const [ui, setUi] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // заполняем форму начальными значениями, когда получили ad
    useEffect(() => {
        if (ad) setFormData(adToForm(ad));
    }, [ad]);

    // превью карточки (как в NewCargoAdPage)
    const previewAd = useMemo(() => {
        const fd = formData;
        return {
            departureCity: fd.departureCity,
            destinationCity: fd.destinationCity,
            availabilityFrom: fd.pickupDate,
            availabilityTo: fd.deliveryDate,

            price: fd.price,
            paymentUnit: fd.paymentUnit,
            readyToNegotiate: fd.readyToNegotiate,

            cargoType: fd.cargoType,
            title: fd.title,
            weightTons: fd.weightTons,
            cargoHeight: fd.dimensionsMeters?.height,
            cargoWidth: fd.dimensionsMeters?.width,
            cargoDepth: fd.dimensionsMeters?.depth,
            loadingTypes: fd.preferredLoadingTypes,

            packagingTypes: fd.packagingTypes ?? [],
            isFragile: fd.isFragile,
            isStackable: fd.isStackable,
            temperature: fd.temperature,
            adrClass: fd.adrClass,

            createdAt: fd.createdAt,

            ownerId: fd.ownerId,
            ownerName: fd.ownerName,
            ownerAvatar: fd.ownerPhotoUrl,
            ownerRating: fd.ownerRating,
        };
    }, [formData]);

    const handleSaveClick = () => {
        if (ui !== 'idle') return;
        if (!formRef.current?.validate()) return;
        setUi('confirm');
    };

    const handleConfirmSave = async () => {
        if (!adId) return;
        setUi('saving');
        try {
            // 1) берём данные формы
            const rawForm = formRef.current.getFormData?.() || formData;
            console.groupCollapsed('%c[EDIT] submit — raw formData', 'color:#0ea5e9');
            console.log(rawForm);
            console.groupEnd();

            // 2) превращаем в patch
            const basePatch = formToPatch(rawForm);

            // 3) дополняем owner, чтобы не потерять name/photoUrl
            const patch = ensureOwnerForSave(basePatch, ad, profile);

            // 4) лог перед вызовом контекста
            console.groupCollapsed('%c[EDIT] context.updateAd -> payload', 'color:#7c3aed');
            console.log('adId:', adId);
            console.log('patch:', patch);
            console.groupEnd();

            const saved = await updateAd(adId, patch);

            console.groupCollapsed('%c[EDIT] updateAd result', 'color:#22c55e');
            console.log(saved);
            console.log('saved.owner:', saved?.owner);
            console.groupEnd();

            // гарантируем свежие данные во всех местах, где идёт чтение напрямую
            await refresh();

            // после сохранения — уходим на профиль объявления
            navigate(`/cargo-ads/${adId}`);
        } catch (e) {
            console.error('[EDIT] save error:', e);
            setErrorMsg(e?.message || 'Не удалось сохранить изменения.');
            setUi('error');
        } finally {
            setUi('idle');
        }
    };

    const handleCancelConfirm = () => setUi('idle');

    if (loading && !ad) {
        return <div className="deliveries-container">Загружаем объявление…</div>;
    }

    if (error) {
        return (
            <div className="deliveries-container" style={{ color: '#b91c1c' }}>
                Ошибка: {String(error)}
            </div>
        );
    }

    if (!ad) {
        return (
            <div className="deliveries-container">
                <div>Объявление не найдено.</div>
                <div style={{ marginTop: 12 }}>
                    <Link to="/my-ads">← к моим объявлениям</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="deliveries-container">
            <div className="new-cargo-page__title">
                Редактирование объявления о перевозке Груза
            </div>

            {/* верхняя полоса: превью + кнопки управления */}
            <div className="ncap__top">
                <div className="ncap__preview">
                    <CargoAdItem ad={previewAd} ableHover={false} />
                </div>

                {/* Кнопки «Сохранить» и «Вернуться» */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button onClick={handleSaveClick}>Сохранить</Button>
                    <Button onClick={() => navigate(`/cargo-ads/${adId}`)} variant="secondary">
                        Вернуться
                    </Button>
                </div>
            </div>

            {/* Ошибка сохранения */}
            {ui === 'error' && (
                <div className="ncap__result ncap__result--error">
                    <div className="ncap__result-title">Ошибка</div>
                    <div className="ncap__result-text">{errorMsg}</div>
                    <div className="ncap__result-actions">
                        <Button onClick={() => setUi('idle')}>Продолжить редактирование</Button>
                    </div>
                </div>
            )}

            {/* подсказка под превью */}
            <div className="new-cargo-page__subtitle">Измените необходимые данные:</div>

            {/* ФОРМА */}
            <div className={`ncap__form ${ui === 'saving' ? 'ncap__form--disabled' : ''}`}>
                <CreateCargoAdForm
                    ref={formRef}
                    formData={formData}
                    updateFormData={updateFormData}
                    usePlainCityInputs
                />
            </div>

            {/* подтверждение */}
            {ui === 'confirm' && (
                <div className="accf__backdrop">
                    <ConfirmationDialog
                        message="Сохранить изменения в объявлении?"
                        onConfirm={handleConfirmSave}
                        onCancel={handleCancelConfirm}
                    />
                </div>
            )}

            {/* прелоадер */}
            {ui === 'saving' && (
                <div className="accf__saving">
                    <div className="accf__spinner" />
                    <div className="accf__saving-text">Сохраняем…</div>
                </div>
            )}
        </div>
    );
};

export default EditCargoAdPage;
