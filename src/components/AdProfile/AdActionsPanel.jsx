// src/components/AdActionsPanel/AdActionsPanel.jsx
import React, { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import CargoAdsContext from '../../hooks/CargoAdsContext';
import TransportAdContext from '../../hooks/TransportAdContext';

import { FaRegPenToSquare, FaCircleCheck, FaBoxArchive } from 'react-icons/fa6';
import { FaBan } from 'react-icons/fa';

import './AdActionsPanel.css';

/**
 * Панель действий под каруселью (иконки):
 * - Изменить (карандаш)
 * - Закрыть (знак запрета)
 * - Скрыть/архивировать (ящик)
 * - Открыть снова (галочка в круге)
 *
 * Работает и для transport, и для cargo.
 */
const AdActionsPanel = ({ adType = 'cargo', ad }) => {
    const navigate = useNavigate();

    const adId = ad?.adId;
    const status = ad?.status ?? 'active';

    const cargoCtx = useContext(CargoAdsContext) || {};
    const transportCtx = useContext(TransportAdContext) || {};

    // Методы под конкретный тип
    const handlers = useMemo(() => {
        if (adType === 'cargo') {
            return {
                close: cargoCtx?.closeAd,
                archive: cargoCtx?.archiveAd,
                reopen: cargoCtx?.reopenAd,
                editTo: '/', // временно ведём на home
            };
        }
        // transport
        return {
            close: transportCtx?.closeAd || transportCtx?.closeTransportAd,
            archive: transportCtx?.archiveAd || transportCtx?.archiveTransportAd,
            reopen: transportCtx?.reopenAd || transportCtx?.reopenTransportAd,
            editTo: adId ? `/transport-ads/${adId}/edit` : '/transport-ads',
        };
    }, [adType, adId, cargoCtx, transportCtx]);

    const [busy, setBusy] = useState(false);

    const canClose = typeof handlers.close === 'function' && status === 'active';
    const canArchive =
        typeof handlers.archive === 'function' &&
        status !== 'deleted' &&
        status !== 'archived';
    const canReopen = typeof handlers.reopen === 'function' && status !== 'active';

    const onClose = async () => {
        if (!canClose || !adId) return;
        const reason = window.prompt('Причина закрытия (необязательно):', '');
        setBusy(true);
        try {
            await handlers.close(adId, reason || undefined);
        } finally {
            setBusy(false);
        }
    };

    const onArchive = async () => {
        if (!canArchive || !adId) return;
        const ok = window.confirm(
            'Скрыть объявление для пользователей? Его можно будет открыть снова.'
        );
        if (!ok) return;
        setBusy(true);
        try {
            await handlers.archive(adId, 'hidden-by-owner');
            // по желанию можно редиректить: navigate('/my-ads');
        } finally {
            setBusy(false);
        }
    };

    const onReopen = async () => {
        if (!canReopen || !adId) return;
        setBusy(true);
        try {
            await handlers.reopen(adId);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="ad-actions-panel">
            {/* Изменить */}
            <Link
                to={handlers.editTo || '/'}
                className="ad-actions-icon-btn"
                title="Изменить"
                aria-label="Изменить"
                onClick={(e) => e.stopPropagation()}
                aria-disabled={busy}
            >
                <FaRegPenToSquare className="icon-24" />
            </Link>

            {/* Закрыть */}
            {canClose && (
                <button
                    type="button"
                    className="ad-actions-icon-btn"
                    title="Закрыть объявление"
                    aria-label="Закрыть объявление"
                    onClick={onClose}
                    disabled={busy}
                >
                    <FaBan className="icon-24" />
                </button>
            )}

            {/* Скрыть/архивировать */}
            {canArchive && (
                <button
                    type="button"
                    className="ad-actions-icon-btn danger"
                    title="Скрыть объявление"
                    aria-label="Скрыть объявление"
                    onClick={onArchive}
                    disabled={busy}
                >
                    <FaBoxArchive className="icon-24 aap-delete-icon" />
                </button>
            )}

            {/* Открыть снова */}
            {canReopen && (
                <button
                    type="button"
                    className="ad-actions-icon-btn"
                    title="Открыть снова"
                    aria-label="Открыть снова"
                    onClick={onReopen}
                    disabled={busy}
                >
                    <FaCircleCheck className="icon-24" />
                </button>
            )}
        </div>
    );
};

export default AdActionsPanel;
