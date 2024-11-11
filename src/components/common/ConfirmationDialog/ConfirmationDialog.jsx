import React from 'react';
import Button from '../Button/Button';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
    <div className='confirmation-dialog'>
        <p>{message}</p>
        <div className='confirmation-dialog-buttons'>
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
    </div>
);

export default ConfirmationDialog;
