import React from 'react';
import Preloader from '../Preloader/Preloader'; // Убедитесь, что путь правильный
import styles from './ConversationLoadingInfo.module.css';

const ConversationLoadingInfo = () => {
    return (
        <div className={styles.preloaderContainer}>
            <div>
                <Preloader />
            </div>
            <div>Загружаются Ваши переписки.</div>
            <div>Подождите, пожалуйста.</div>
        </div>
    );
};

export default ConversationLoadingInfo;
