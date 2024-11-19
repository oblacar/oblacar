import React from 'react';
import classNames from 'classnames';
import styles from './IncomingRequestsItem.module.css';
import UserSmallCard from '../common/UserSmallCard/UserSmallCard';
import Button from '../common/Button/Button';
import {
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/react/24/solid';

const IncomingRequestsItem = ({
    request,
    requestId,
    adId,
    userId,
    onDecline,
    onAccept,
}) => {
    const { description, status } = request;
    const { name, photoUrl } = request.sender;

    return (
        <div className={styles.itemContainer}>
            {status === 'declined' && (
                <div className={styles.declinedNotice}>Отклонено</div>
            )}

            <div
                className={classNames(styles.requestItem, {
                    [styles.declined]: status === 'declined',
                    [styles.accepted]: status === 'accepted',
                })}
            >
                <div className={styles.ownerData}>
                    <UserSmallCard
                        photoUrl={photoUrl}
                        rating={''}
                        name={name}
                        isLoading={false}
                    />
                </div>
                <div className={styles.rightContainer}>
                    <div className={styles.descriptionContainer}>
                        <p className={styles.descriptionTitle}>
                            Описание груза и детали перевозки:
                        </p>
                        <div className={styles.description}>{description}</div>
                    </div>

                    <div className={styles.actions}>
                        {status === 'pending' && (
                            <>
                                <Button
                                    type='button'
                                    type_btn='reverse-no'
                                    children='Отклонить'
                                    icon={<XMarkIcon />}
                                    onClick={() =>
                                        onDecline(
                                            userId,
                                            adId,
                                            request.requestId
                                        )
                                    }
                                />
                                <Button
                                    type='button'
                                    children='Подтвердить'
                                    type_btn='yes'
                                    icon={<CheckIcon />}
                                    onClick={() =>
                                        onAccept(
                                            userId,
                                            adId,
                                            request.requestId
                                        )
                                    }
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            {status === 'declined' && (
                <div className={styles.declinedBtn}>
                    <Button
                        type='button'
                        children='Вернуть'
                        type_btn='reverse'
                        icon={<ArrowUturnLeftIcon />}
                        onClick={() =>
                            onAccept(userId, adId, request.requestId)
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default IncomingRequestsItem;