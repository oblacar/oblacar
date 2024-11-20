import React from 'react';

import styles from './UserSmallCard.module.css';
import Button from '../Button/Button';
import Preloader from '../Preloader/Preloader';
import { FaUser } from 'react-icons/fa';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const UserSmallCard = ({
    photoUrl,
    rating,
    name,
    onMessageClick,
    isLoading,
}) => {
    return (
        <div className={styles.userCard}>
            <div className={styles.photoRating}>
                <div className={styles.photo}>
                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt='Пользователь'
                            className={styles.photoImage}
                        />
                    ) : (
                        <FaUser />
                    )}
                    {rating ? (
                        <div className={styles.rating}>★ {rating}</div>
                    ) : null}
                </div>
            </div>
            <div className={styles.name}>{name}</div>
            <div className={styles.btnMessage}>
                <Button
                    type='button'
                    children='Написать'
                    icon={<ChatBubbleLeftRightIcon />}
                    onClick={onMessageClick}
                    // onClick={() => console.log('в кнопке')}
                    type_btn='reverse'
                />
            </div>
            {isLoading && <Preloader />}
        </div>
    );
};

export default UserSmallCard;
