// src/admin/components/AdminAdPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAdminAds } from '../context/AdminAdsContext';
import {
    FaTrash,
    FaUndo,
    FaEyeSlash,
    FaSkull,
    FaUserCheck,
    FaUser,
} from 'react-icons/fa';
import './AdminAdPanel.css'; // используем обычный css, как в TableToolbar

export default function AdminAdPanel({
    adId,
    adRoot,
    isAdmin,
    isOwnAd,
    onToggleOwnerMode,
}) {
    const { setSelection, bulkHide, bulkDelete, bulkRestore, bulkHardDelete } =
        useAdminAds();

    const [ownerMode, setOwnerMode] = useState(isOwnAd);

    useEffect(() => {
        setOwnerMode(isOwnAd);
    }, [isOwnAd]);

    if (!isAdmin) return null;

    const runAction = async (action) => {
        setSelection([adId]);
        await action();
        setSelection([]);
    };

    const actions = [
        {
            icon: <FaEyeSlash />,
            label: 'Скрыть',
            onClick: () => runAction(bulkHide),
        },
        {
            icon: <FaTrash />,
            label: 'Удалить',
            onClick: () => runAction(bulkDelete),
            variant: 'danger',
        },
        {
            icon: <FaUndo />,
            label: 'Восстановить',
            onClick: () => runAction(bulkRestore),
        },
        {
            icon: <FaSkull />,
            label: 'Удалить навсегда',
            onClick: () => {
                if (window.confirm('Удалить навсегда? Это необратимо.')) {
                    runAction(bulkHardDelete);
                }
            },
            variant: 'danger',
        },
    ];

    return (
        <div className='admin-panel'>
            <div className='toggle-container'>
                <span className='toggle-label'>Режим:</span>
                <button
                    className={`toggle-btn ${ownerMode ? 'active' : ''}`}
                    onClick={() => {
                        const newValue = !ownerMode;
                        setOwnerMode(newValue);
                        onToggleOwnerMode(newValue);
                    }}
                >
                    {ownerMode ? <FaUserCheck /> : <FaUser />}
                    {ownerMode ? 'Хозяин объявления' : 'Обычный посетитель'}
                </button>
            </div>

            <div className='spacer' />

            <div className='actions'>
                {actions.map((a, i) => (
                    <button
                        key={i}
                        className={`btn ${
                            a.variant === 'danger' ? 'btn-danger' : ''
                        }`}
                        onClick={a.onClick}
                    >
                        {a.icon}
                        {a.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
