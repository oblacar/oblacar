import React from 'react';


export default function ConfirmModal({ open, title = 'Подтвердите действие', description, onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>{title}</h3>
                {description && <p>{description}</p>}
                <div className="modal-actions">
                    <button className="btn" onClick={onCancel}>Отмена</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Подтвердить</button>
                </div>
            </div>
        </div>
    );
}