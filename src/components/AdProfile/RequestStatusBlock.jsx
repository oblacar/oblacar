import React from 'react';
import Button from '../common/Button/Button';

import './RequestStatusBlock.css';

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
                {status === 'pending' &&
                    'Запрос отправлен, ждем ответа владельца.'}
                {status === 'accepted' &&
                    'Ваш запрос принят! Свяжитесь с владельцем для деталей.'}
                {status === 'declined' && 'Ваш запрос отклонен владельцем.'}
                {status === 'cancelled' &&
                    'Вы отменили запрос! Но вы можете отправить новый запрос.'}
                {status === 'inProgress' && 'Перевозка в процессе.'}
                {status === 'completed' && 'Перевозка завершена.'}
                {status === 'failed' && 'Перевозка завершена с ошибкой.'}
            </p>

            {status === 'pending' && (
                <Button
                    type='button'
                    type_btn='no'
                    children='Отменить запрос'
                    onClick={onCancelRequest}
                />
            )}

            {status === 'cancelled' && (
                <Button
                    type='button'
                    children='Сделать новый запрос'
                    onClick={onRestartRequest}
                />
            )}
        </div>
    );
};

export default RequestStatusBlock;
