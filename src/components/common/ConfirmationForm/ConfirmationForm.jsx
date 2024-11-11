import React from 'react';

const ConfirmationForm = ({ onConfirm, onCancel }) => {
    return (
        <div className='confirmation-form'>
            <h2>Подтвердить размещение</h2>
            <p>Вы уверены, что хотите разместить это объявление?</p>
            <div className='confirmation-buttons'>
                <button
                    onClick={onConfirm}
                    className='confirm-button'
                >
                    Да, разместить
                </button>
                <button
                    onClick={onCancel}
                    className='cancel-button'
                >
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default ConfirmationForm;
