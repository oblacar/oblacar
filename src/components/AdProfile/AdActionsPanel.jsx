// src/components/AdActionsPanel/AdActionsPanel.jsx
import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import CargoAdsContext from '../../hooks/CargoAdsContext';
import TransportAdContext from '../../hooks/TransportAdContext';

import ConfirmationDialog from '../common/ConfirmationDialog/ConfirmationDialog';

import { FaRegPenToSquare, FaCircleCheck, FaBoxArchive } from 'react-icons/fa6';
import { FaBan } from 'react-icons/fa';

import './AdActionsPanel.css';

/**
 * Панель действий:
 * 1) Изменить
 * 2) На паузу / Вернуть (одно место, без «скачков»)
 * 3) Скрыть/архивировать
 *
 * Работает и для cargo, и для transport.
 */
const AdActionsPanel = ({ adType = 'cargo', ad }) => {
    const adId = ad?.adId;
    const status = ad?.status ?? 'active';

    const cargoCtx = useContext(CargoAdsContext) || {};
    const transportCtx = useContext(TransportAdContext) || {};

    // Маппинг методов (+ бэккомпат на close/reopen)
    const handlers = useMemo(() => {
        if (adType === 'cargo') {
            return {
                pause: cargoCtx?.pauseAd ?? cargoCtx?.closeAd,
                unpause: cargoCtx?.unpauseAd ?? cargoCtx?.reopenAd,
                archive: cargoCtx?.archiveAd,
                editTo: adId ? `/cargo-ads/${adId}/edit` : '/cargo-ads',
            };
        }
        return {
            pause: transportCtx?.pauseAd ?? transportCtx?.closeAd ?? transportCtx?.closeTransportAd,
            unpause: transportCtx?.unpauseAd ?? transportCtx?.reopenAd ?? transportCtx?.reopenTransportAd,
            archive: transportCtx?.archiveAd ?? transportCtx?.archiveTransportAd,
            editTo: adId ? `/transport-ads/${adId}/edit` : '/transport-ads',
        };
    }, [adType, adId, cargoCtx, transportCtx]);

    const [busy, setBusy] = useState(false);
    const [showPauseConfirm, setShowPauseConfirm] = useState(false);

    const isActive = status === 'active';
    const isPaused = status === 'paused';

    const canPause = typeof handlers.pause === 'function' && isActive;
    const canUnpause = typeof handlers.unpause === 'function' && isPaused;
    const canArchive =
        typeof handlers.archive === 'function' &&
        status !== 'deleted' &&
        status !== 'archived';

    // Кнопка #2 — всегда на одном месте: либо «Пауза», либо «Вернуть»
    const onPauseClick = (e) => {
        e?.stopPropagation?.();
        if (!canPause || !adId) return;
        setShowPauseConfirm(true);
    };

    const onConfirmPause = async () => {
        setShowPauseConfirm(false);
        if (!canPause || !adId) return;
        setBusy(true);
        try {
            await handlers.pause(adId);
        } finally {
            setBusy(false);
        }
    };

    const onCancelPause = () => setShowPauseConfirm(false);

    const onUnpause = async (e) => {
        e?.stopPropagation?.();
        if (!canUnpause || !adId) return;
        setBusy(true);
        try {
            await handlers.unpause(adId);
        } finally {
            setBusy(false);
        }
    };

    const onArchive = async (e) => {
        e?.stopPropagation?.();
        if (!canArchive || !adId) return;
        const ok = window.confirm(
            'Скрыть объявление для пользователей? Его можно будет открыть снова.'
        );
        if (!ok) return;
        setBusy(true);
        try {
            await handlers.archive(adId, 'hidden-by-owner');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="ad-actions-panel">
            {/* 1) Изменить */}
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

            {/* 2) Пауза / Вернуть — одно место */}
            <button
                type="button"
                className="ad-actions-icon-btn"
                title={isPaused ? 'Вернуть из паузы' : 'Поставить на паузу'}
                aria-label={isPaused ? 'Вернуть из паузы' : 'Поставить на паузу'}
                onClick={isPaused ? onUnpause : onPauseClick}
                disabled={busy || (!canPause && !canUnpause)}
            >
                {isPaused ? <FaCircleCheck className="icon-24" /> : <FaBan className="icon-24" />}
            </button>

            {/* 3) Скрыть/архивировать */}
            <button
                type="button"
                className="ad-actions-icon-btn danger"
                title="Скрыть объявление"
                aria-label="Скрыть объявление"
                onClick={onArchive}
                disabled={busy || !canArchive}
            >
                <FaBoxArchive className="icon-24 aap-delete-icon" />
            </button>

            {/* Диалог подтверждения ПАУЗЫ */}
            {showPauseConfirm && (
                <div className="accf__backdrop">
                    <ConfirmationDialog
                        message="Вы уверены, что хотите поставить объявление на паузу? Оно не будет доступно для других."
                        onConfirm={onConfirmPause}
                        onCancel={onCancelPause}
                    />
                </div>
            )}
        </div>
    );
};

export default AdActionsPanel;
