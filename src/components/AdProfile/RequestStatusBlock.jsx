import React from 'react';
import Button from '../common/Button/Button';

import './RequestStatusBlock.css';

import {
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';
// check - circle;

const RequestStatusBlock = ({
    status,
    onCancelRequest,
    onRestartRequest,
    adTransportationRequest,
}) => {
    return (
        <div className='transport-ad-profile-request-status'>
            <strong>Статус вашего запроса:</strong>
            <p>"{adTransportationRequest.requestData.description}"</p>
            <p className='transport-ad-profile-request-status-info'>
                {status === 'pending' && (
                    <div className='request-status-container pending'>
                        <CheckCircleIcon className='request-status-icon' />
                        <span>Запрос отправлен, ждем ответа владельца.</span>
                    </div>
                )}

                {status === 'accepted' &&
                    'Ваш запрос принят! Свяжитесь с владельцем для деталей.'}
                {status === 'declined' && 'Ваш запрос отклонен владельцем.'}
                {/* 
                {status === 'cancelled' &&
                    'Вы отменили запрос! Но вы можете отправить новый запрос.'} */}
                {status === 'cancelled' && (
                    <div className='request-status-container cancelled'>
                        <XCircleIcon className='request-status-icon' />
                        <span>
                            Вы отменили запрос! Но вы можете отправить новый
                            запрос.
                        </span>
                    </div>
                )}

                {status === 'inProgress' && 'Перевозка в процессе.'}
                {status === 'completed' && 'Перевозка завершена.'}
                {status === 'failed' && 'Перевозка завершена с ошибкой.'}
            </p>

            {status === 'pending' && (
                <Button
                    type='button'
                    type_btn='reverse-no'
                    children='Отменить запрос'
                    onClick={onCancelRequest}
                    // icon={<XCircleIcon />}
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
