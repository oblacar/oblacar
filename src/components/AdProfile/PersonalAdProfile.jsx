// src/components/PersonalAdProfile/PersonalAdProfile.jsx
import React, { useState, useEffect } from 'react';
import styles from './PersonalAdProfile.module.css';

import IncomingRequestsList from './IncomingRequestsList';
import ToggleSearchMode from '../common/ToggleSearchMode/ToggleSearchMode';
import ChatInterface from '../ChatInterface/ChatInterface';
import HorizontalPhotoCarousel from '../common/HorizontalPhotoCarousel/HorizontalPhotoCarousel';

import { InboxArrowDownIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// НОВОЕ:
import PersonalTransportAdDetails from './PersonalTransportAdDetails';

const PersonalAdProfile = ({ ad, onSendRequest, onMessage, userType }) => {
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

                        {/* ОПИСАНИЕ ТРАНСПОРТА */}
                        <PersonalTransportAdDetails ad={ad} />
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
                            <strong>Запросы на перевозку</strong>
                            <IncomingRequestsList adId={adId} />
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
