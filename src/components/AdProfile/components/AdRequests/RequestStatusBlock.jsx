import React from 'react';
import Button from '../../../common/Button/Button';

import './RequestStatusBlock.css';

import {
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';

const RequestStatusBlock = ({
    status,
    adTransportationRequest,
    onCancelRequest,
    onRestartRequest,
    adTransportationRequest: _unused, // если есть
    ...rest
}) => {
    const req = adTransportationRequest?.requestData || adTransportationRequest;
    if (!req) {
        return (
            <div style={{ opacity: 0.7, fontSize: 12 }}>
                Загрузка статуса…
            </div>
        );
    }

    console.log('adTransportationRequest:');
    console.log(adTransportationRequest);

    return (
        <div className='transport-ad-profile-request-status'>
            <strong>Статус вашего запроса:</strong>
            <p>"{adTransportationRequest.requestData.description}"</p>

            {/* Отдельный блок для информации о статусе */}
            <div className='transport-ad-profile-request-status-info'>
                {status === 'pending' && (
                    <div className='request-status-container pending'>
                        <CheckCircleIcon className='request-status-icon' />
                        <span>Запрос отправлен, ждем ответа владельца.</span>
                    </div>
                )}

                {status === 'accepted' && (
                    <span>
                        Ваш запрос принят! Свяжитесь с владельцем для деталей.
                    </span>
                )}

                {status === 'declined' && (
                    <span>Ваш запрос отклонен владельцем.</span>
                )}

                {status === 'cancelled' && (
                    <div className='request-status-container cancelled'>
                        <XCircleIcon className='request-status-icon' />
                        <span>
                            Вы отменили запрос! Но вы можете отправить новый
                            запрос.
                        </span>
                    </div>
                )}

                {status === 'inProgress' && <span>Перевозка в процессе.</span>}

                {status === 'completed' && <span>Перевозка завершена.</span>}

                {status === 'failed' && (
                    <span>Перевозка завершена с ошибкой.</span>
                )}
            </div>

            {/* Кнопки действий */}
            {status === 'pending' && (
                <Button
                    type='button'
                    type_btn='reverse-no'
                    children='Отменить запрос'
                    onClick={onCancelRequest}
                    icon={<XMarkIcon />}
                />
            )}

            {status === 'cancelled' && (
                <Button
                    type='button'
                    children='Новый запрос'
                    onClick={onRestartRequest}
                    icon={<PencilIcon />}
                />
            )}
        </div>
    );
};

export default RequestStatusBlock;
