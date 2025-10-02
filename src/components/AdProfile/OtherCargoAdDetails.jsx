import React from 'react';
import HorizontalPhotoCarousel from '../common/HorizontalPhotoCarousel/HorizontalPhotoCarousel';
import PhotoCarousel from '../common/PhotoCarousel/PhotoCarousel';
import { formatNumber } from '../../utils/helper';

const OtherCargoAdDetails = ({ ad }) => {
    const data = ad?.ad && typeof ad.ad === 'object' ? ad.ad : ad;

    const {
        photos = [],
        title,
        cargoType,
        description,

        departureCity,
        destinationCity,
        pickupDate,
        deliveryDate,

        price,
        paymentUnit,
        readyToNegotiate,

        weightTons,
        dimensionsMeters = {},
        quantity,
        packagingTypes = [],
        isFragile,
        isStackable,
        adrClass,
        temperature = {},
        preferredLoadingTypes = [],
    } = data || {};

    const dims =
        dimensionsMeters && (dimensionsMeters.height || dimensionsMeters.width || dimensionsMeters.depth)
            ? `${dimensionsMeters.height || '—'}×${dimensionsMeters.width || '—'}×${dimensionsMeters.depth || '—'} м`
            : '—';

    const pack =
        Array.isArray(packagingTypes) && packagingTypes.length
            ? packagingTypes.join(', ')
            : '—';

    const loadings =
        Array.isArray(preferredLoadingTypes) && preferredLoadingTypes.length
            ? preferredLoadingTypes.join(', ')
            : '—';

    const tempLabel =
        temperature?.mode === 'chilled' ? 'охлаждение' :
            temperature?.mode === 'frozen' ? 'заморозка' :
                'обычная';

    return (
        <>
            {/* <div className="other-ad-profile-truck-photo-area">
                                <HorizontalPhotoCarousel photos={photos} />
            </div> */}
            <div className="other-ad-profile-truck-photo-area">
                <PhotoCarousel photos={photos} />
            </div>

            <div className="other-ad-profile-rout-date-price">
                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Название: </strong>{title || '—'}
                </div>
                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Тип груза: </strong>{cargoType || '—'}
                </div>

                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Готов к отгрузке: </strong>{pickupDate || '—'}
                </div>
                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Желаемая доставка: </strong>{deliveryDate || '—'}
                </div>

                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Откуда: </strong>{departureCity || '—'}
                </div>
                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Куда: </strong>{destinationCity || '—'}
                </div>

                <div className="other-ad-profile-rout-date-price-row">
                    <strong>Оценка цены: </strong>
                    {price ? `${formatNumber(String(price))} ${paymentUnit || ''}` : '—'}
                    {readyToNegotiate ? ' (торг)' : ''}
                </div>

                <div className="other-ad-profile-truck">
                    <div className="other-ad-profile-truck-row">
                        <strong>Вес, т: </strong>{weightTons || '—'}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Габариты (В×Ш×Г): </strong>{dims}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Кол-во мест: </strong>{quantity || '—'}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Упаковка: </strong>{pack}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Загрузка: </strong>{loadings}
                    </div>
                    <div className="other-ad-profile-truck-row">
                        <strong>Температура: </strong>{tempLabel}
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

                {description?.trim() ? (
                    <div className="other-ad-profile-rout-date-price-row" style={{ marginTop: 8 }}>
                        <strong>Описание: </strong>{description}
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default OtherCargoAdDetails;
