import React, { useMemo } from 'react';
import PhotoCarousel from '../common/PhotoCarousel/PhotoCarousel';
import { formatNumber } from '../../utils/helper';
import { PACKAGING_OPTIONS } from '../../constants/cargoPackagingOptions';

const OtherCargoAdDetails = ({ ad }) => {
    if (!ad) return null;

    console.log(ad);

    // Лучше вынести в utils, но оставлю рядом для наглядности
    const getAdPhotoUrls = (adObj = {}) => {
        // 1) Для объявлений по транспорту
        if (Array.isArray(adObj.truckPhotoUrls) && adObj.truckPhotoUrls.length) {
            return adObj.truckPhotoUrls.filter(Boolean);
        }
        // 2) Если photos — массив строк или объектов {id,url/src}
        if (Array.isArray(adObj.photos)) {
            return adObj.photos
                .map((p) => (typeof p === 'string' ? p : p?.url || p?.src || ''))
                .filter(Boolean);
        }
        // 3) Если photos — map {id: {url}}
        if (adObj.photos && typeof adObj.photos === 'object') {
            return Object.values(adObj.photos)
                .map((p) => p?.url || '')
                .filter(Boolean);
        }
        return [];
    };

    // В начале компонента (рядом с утилитками)
    const safeFormatNumber = (v) => {
        if (v === null || v === undefined) return '';
        // приводим всё к строке
        const s = typeof v === 'string' ? v : String(v);
        try {
            return formatNumber(s);
        } catch {
            // если formatNumber вдруг снова упадёт — вернём исходную строку
            return s;
        }
    };

    const data = ad?.ad ? ad.ad : ad;

    const departureCity = data.route?.from || data.departureCity;
    const destinationCity = data.route?.to || data.destinationCity;

    const pickupDate = data.pickupDate ?? data.availabilityFrom;
    const deliveryDate = data.deliveryDate ?? data.availabilityTo;

    const title = data.title || data.cargo?.title || data.cargoName || '';
    const cargoType = data.cargoType || data.cargo?.type || '';
    const weightTons = data.weightTons ?? data.cargo?.weightTons ?? data.weight ?? '';

    const quantity = data.quantity ?? '';

    const dimsRaw =
        data.dimensionsMeters ||
        data.cargo?.dims || {
            height: data.cargo?.h ?? data.height,
            width: data.cargo?.w ?? data.width,
            depth: data.cargo?.d ?? data.depth,
        };

    const formatDims = (dims) => {
        if (!dims) return '—';
        if (typeof dims === 'string') return dims || '—';
        const h = dims.height ?? dims.h;
        const w = dims.width ?? dims.w;
        const d = dims.depth ?? dims.d;
        const parts = [h, w, d].filter((v) => v !== undefined && v !== null && v !== '');
        return parts.length ? `${parts.join('×')} м` : '—';
    };

    // map для упаковки
    const PACK_MAP = useMemo(() => {
        const m = {};
        (PACKAGING_OPTIONS || []).forEach((o) => {
            m[o.key] = o.label;
        });
        return m;
    }, []);

    // ключи упаковки из массива / map / одиночного ключа
    const packagingKeys = Array.isArray(data.packagingTypes)
        ? data.packagingTypes
        : data.packagingTypes && typeof data.packagingTypes === 'object'
            ? Object.keys(data.packagingTypes).filter((k) => !!data.packagingTypes[k])
            : data.packagingType
                ? [data.packagingType]
                : [];

    const packagingLabels = packagingKeys
        .map((k) => PACK_MAP[k] || k)
        .filter(Boolean);

    const isFragile = Boolean(data.isFragile ?? data.cargo?.fragile);
    const isStackable = Boolean(data.isStackable ?? data.cargo?.isStackable);
    const adrClass = data.adrClass ?? data.cargo?.adrClass ?? '';

    const temp = data.temperature || data.cargo?.temperature || { mode: 'ambient' };
    const temperatureStr = (() => {
        if (!temp || typeof temp !== 'object') return '—';
        const mode =
            temp.mode === 'chilled' ? 'охлаждение' :
                temp.mode === 'frozen' ? 'заморозка' :
                    'обычная';
        const hasMin = temp.minC !== undefined && temp.minC !== null && temp.minC !== '';
        const hasMax = temp.maxC !== undefined && temp.maxC !== null && temp.maxC !== '';
        const bounds = hasMin || hasMax ? ` (${hasMin ? temp.minC : ''}…${hasMax ? temp.maxC : ''}°C)` : '';
        return `${mode}${bounds}`;
    })();

    const loadingTypes = data.preferredLoadingTypes ?? data.loadingTypes ?? [];

    const price = data.price;
    const paymentUnit = data.paymentUnit || 'руб';
    const readyToNegotiate = Boolean(data.readyToNegotiate);

    const description = data.description || '';

    // Фото для карусели
    const photos = useMemo(() => getAdPhotoUrls(data), [data]);

    return (
        <>
            <div className="other-ad-profile-truck-photo-area">
                <PhotoCarousel photos={photos} />

                <div className='other-ad-profile-cargo-className-description'>
                    <div className="other-ad-profile-rout-date-price-row">
                        <strong>Тип груза: </strong>{cargoType || '—'}
                    </div>
                    <div className="other-ad-profile-cargo-className-description-title">
                        <strong>
                            Описание:
                        </strong>
                    </div>
                    <div className='other-ad-profile-cargo-className-description-text'>
                        {description}
                    </div>
                </div>

            </div>


            <div className="other-ad-profile-rout-date-price">
                <div className="other-ad-profile-rout-date-price-row">
                    <h2>
                        {title || '—'}
                    </h2>
                    <div class="other-ad-profile-gradient-line"></div> 
                </div>


                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Готов к отгрузке: </strong> {pickupDate || '—'}
                </div>

                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Откуда: </strong>{departureCity || '—'}
                </div>
                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Куда: </strong>{destinationCity || '—'}
                </div>



                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Стоимость: </strong>
                    {price !== undefined && price !== null && price !== ''
                        ? `${safeFormatNumber(price)} ${paymentUnit || ''}`.trim()
                        : '—'}
                    {readyToNegotiate ? ' (торг)' : ''}
                </div>

                <div className='other-ad-profile-separator' />

                <div className="other-ad-profile-truck-row">
                    <strong>Желаемая доставка: </strong>{deliveryDate || '—'}
                </div>

                <div className='other-ad-profile-separator' />

                <div className="other-ad-profile-truck">
                    <div className="other-ad-profile-truck-row">
                        <strong>Вес, т: </strong>{weightTons || '—'}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Габариты (В×Ш×Г): </strong>{formatDims(dimsRaw)}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Кол-во мест: </strong>{quantity || '—'}
                    </div>

                    <div className='other-ad-profile-separator' />

                    <div className="other-ad-profile-truck-row">
                        <strong>Упаковка: </strong>
                        {packagingLabels.length ? packagingLabels.join(', ') : '—'}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Загрузка: </strong>
                        {Array.isArray(loadingTypes) ? (loadingTypes.length ? loadingTypes.join(', ') : '—') : (loadingTypes || '—')}
                    </div>

                    <div className='other-ad-profile-separator' />

                    <div className="other-ad-profile-truck-row">
                        <strong>Температура: </strong>{temperatureStr}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Хрупкий: </strong>{isFragile ? 'да' : 'нет'}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Штабелируемый: </strong>{isStackable ? 'да' : 'нет'}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>ADR: </strong>{adrClass || '—'}
                    </div>
                </div>

                {/* Описание добавим следующим шагом */}
            </div>
        </>
    );
};

export default OtherCargoAdDetails;
