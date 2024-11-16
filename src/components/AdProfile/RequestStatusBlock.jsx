import React from 'react';
import Button from '../common/Button/Button';

const RequestStatusBlock = ({ status, onCancelRequest }) => {
    return (
        <div className='transport-ad-profile-request-status'>
            <strong>Статус вашего запроса:</strong>
            <p>
                {status === 'pending' &&
                    'Запрос отправлен, ждем ответа владельца.'}
                {status === 'accepted' &&
                    'Ваш запрос принят! Свяжитесь с владельцем для деталей.'}
                {status === 'declined' && 'Ваш запрос отклонен владельцем.'}
                {status === 'cancelled' && 'Вы отменили запрос.'}
                {status === 'inProgress' && 'Перевозка в процессе.'}
                {status === 'completed' && 'Перевозка завершена.'}
                {status === 'failed' && 'Перевозка завершена с ошибкой.'}
            </p>

            {status === 'pending' && (
                <Button
                    type='button'
                    children='Отменить запрос'
                    onClick={onCancelRequest}
                />
            )}
        </div>
    );
};

export default RequestStatusBlock;
