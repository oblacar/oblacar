import React from 'react';
import Button from '../Button/Button';

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
    <div className='confirmation-dialog'>
        <p>{message}</p>
        <Button
            onClick={onConfirm}
            type_btn='yes'
        >
            Да
        </Button>
        <Button
            onClick={onCancel}
            type_btn='no'
        >
            Отмена
        </Button>
    </div>
);

export default ConfirmationDialog;
