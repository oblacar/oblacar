// src/components/PersonalAdProfile/PersonalAdProfile.jsx
import React, { useState, useEffect } from 'react';
import styles from './PersonalAdProfile.module.css';

import TransportIncomingRequestsList from './TransportIncomingRequestsList';
import CargoIncomingRequestsList from './CargoIncomingRequestsList';

import ToggleSearchMode from '../common/ToggleSearchMode/ToggleSearchMode';
import ChatInterface from '../ChatInterface/ChatInterface';
import HorizontalPhotoCarousel from '../common/HorizontalPhotoCarousel/HorizontalPhotoCarousel';

import { InboxArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Детали для транспорта (у тебя уже есть)
import PersonalTransportAdDetails from './PersonalTransportAdDetails';
// Детали для груза (мы только что сделали)
import PersonalCargoAdDetails from './PersonalCargoAdDetails';


/**
 * Универсальный профиль объявления.
 * Явно укажи adType: "transport" | "cargo".
 * Все прочие пропсы прокидываются в целевой компонент как есть.
 */
const PersonalAdProfile = ({ adType, ad, onSendRequest, onMessage, userType }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSelectFirst, setIsSelectFirst] = useState(true);

    useEffect(() => {
        if (ad) setIsLoading(false);
    }, [ad]);

    const handleToggle = (isFirstSelected) => setIsSelectFirst(isFirstSelected);

    if (isLoading) {
        return <div className={styles.loading}>Загрузка объявления...</div>;
    }

    const { adId } = ad;

    //       switch (adType) {
    //     case 'transport':
    //       return <PersonalTransportAdDetails ad={ad} {...rest} />;

    //     case 'cargo':
    //       return <PersonalCargoAdDetails ad={ad} {...rest} />;

    //     default:
    //       return <div style={{ padding: 12, color: '#b91c1c' }}>
    //         Неизвестный adType: {String(adType)}
    //       </div>;
    //   }
    // };

    return (
        <div className={styles.fakePage}>
            <div className={styles.pageContainer}>
                {/* Блок объявления */}
                <div className={styles.transportAdProfile}>
                    <div className={styles.adContainer}>
                        <div className={styles.photoArea}>
                            <HorizontalPhotoCarousel photos={ad.truckPhotoUrls || []} />
                        </div>

                        {/* ОПИСАНИЕ ТРАНСПОРТА */}
                        { }

                        {adType === 'transport' ?
                            (<PersonalTransportAdDetails ad={ad} />) :
                            (adType === 'cargo' ? <PersonalCargoAdDetails ad={ad} /> : null)}
                    </div>
                </div>

                {/* Список запросов / Сообщения */}
                <div className={styles.requests}>
                    <div style={{ padding: '20px', marginBottom: '30px' }}>
                        <ToggleSearchMode
                            firstOption={{ icon: <InboxArrowDownIcon />, label: 'Запросы' }}
                            secondOption={{ icon: <EnvelopeIcon />, label: 'Сообщения' }}
                            isSelectFirst={isSelectFirst}
                            onToggle={handleToggle}
                        />
                    </div>

                    {isSelectFirst ? (
                        <>
                            {adType === 'transport' && (
                                <>
                                    <strong>Запросы на перевозку</strong>
                                    <TransportIncomingRequestsList adId={adId} />
                                </>
                            )}

                            {adType === 'cargo' && (
                                <>
                                    <strong>Запросы по грузу</strong>
                                    <CargoIncomingRequestsList adId={adId} />
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <strong>Переписка по Вашему объявлению.</strong>
                            <ChatInterface adId={adId} />
                        </>
                    )}


                </div>
            </div>
        </div>
    );
};

export default PersonalAdProfile;
