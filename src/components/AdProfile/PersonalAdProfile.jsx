// src/components/PersonalAdProfile/PersonalAdProfile.jsx
import React, { useState, useEffect } from 'react';
import styles from './PersonalAdProfile.module.css';

import TransportIncomingRequestsList from './TransportIncomingRequestsList';
import CargoIncomingRequestsList from './CargoIncomingRequestsList';

import ToggleSearchMode from '../common/ToggleSearchMode/ToggleSearchMode';
import ChatInterface from '../ChatInterface/ChatInterface';
import HorizontalPhotoCarousel from '../common/HorizontalPhotoCarousel/HorizontalPhotoCarousel';
import { InboxArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

import PersonalTransportAdDetails from './PersonalTransportAdDetails';
import PersonalCargoAdDetails from './PersonalCargoAdDetails';

import AdActionsPanel from './AdActionsPanel';

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

    return (
        <div className={styles.fakePage}>
            <div className={styles.pageContainer}>
                {/* Блок объявления */}
                <div className={styles.transportAdProfile}>
                    <div className={styles.adContainer}>
                        <div className={styles.photoArea}>
                            <HorizontalPhotoCarousel photos={ad.truckPhotoUrls || []} />
                        </div>

                        {/* ВСТАВКА ПАНЕЛИ ПОД КАРУСЕЛЬЮ */}
                        <AdActionsPanel adType={adType} ad={ad} />

                        {/* Детали */}
                        {adType === 'transport'
                            ? <PersonalTransportAdDetails ad={ad} />
                            : adType === 'cargo'
                                ? <PersonalCargoAdDetails ad={ad} />
                                : null}
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
