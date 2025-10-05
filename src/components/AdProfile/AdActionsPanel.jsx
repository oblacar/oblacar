// src/components/AdActionsPanel/AdActionsPanel.jsx
import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import CargoAdsContext from '../../hooks/CargoAdsContext';
import TransportAdContext from '../../hooks/TransportAdContext';

import { FaRegPenToSquare, FaCircleCheck, FaBoxArchive } from 'react-icons/fa6';
import { FaBan } from 'react-icons/fa';

import './AdActionsPanel.css';

/**
 * Панель действий под каруселью (иконки):
 * - Изменить (карандаш)
 * - На паузу / Вернуть (одно и то же место)
 * - Скрыть/архивировать (ящик)
 *
 * Работает и для transport, и для cargo.
 */
const AdActionsPanel = ({ adType = 'cargo', ad }) => {
    const adId = ad?.adId;
    const status = ad?.status ?? 'active';

    const cargoCtx = useContext(CargoAdsContext) || {};
    const transportCtx = useContext(TransportAdContext) || {};

    // Маппинг методов под тип объявления (+ бэккомпат)
    const handlers = useMemo(() => {
        if (adType === 'cargo') {
            return {
                pause: cargoCtx?.pauseAd ?? cargoCtx?.closeAd,        // fallback
                unpause: cargoCtx?.unpauseAd ?? cargoCtx?.reopenAd,    // fallback
                archive: cargoCtx?.archiveAd,
                editTo: adId ? `/cargo-ads/${adId}/edit` : '/cargo-ads',
            };
        }
        // transport
        return {
            pause: transportCtx?.pauseAd ?? transportCtx?.closeAd ?? transportCtx?.closeTransportAd,
            unpause: transportCtx?.unpauseAd ?? transportCtx?.reopenAd ?? transportCtx?.reopenTransportAd,
            archive: transportCtx?.archiveAd ?? transportCtx?.archiveTransportAd,
            editTo: adId ? `/transport-ads/${adId}/edit` : '/transport-ads',
        };
    }, [adType, adId, cargoCtx, transportCtx]);

    const [busy, setBusy] = useState(false);

    const isActive = status === 'active';
    const isPaused = status === 'paused';

    // Кнопка №2 — всегда на месте, просто меняет вид/обработчик
    const canPause = typeof handlers.pause === 'function' && isActive;
    const canUnpause = typeof handlers.unpause === 'function' && isPaused;

    const canArchive =
        typeof handlers.archive === 'function' &&
        status !== 'deleted' &&
        status !== 'archived';

    // Тоггл: active -> paused (с подтверждением)
    const onPause = async (e) => {
        e?.stopPropagation?.();
        if (!canPause || !adId) return;
        const ok = window.confirm(
            'Вы уверены, что ставите объявление на паузу?\nОно не будет доступно для других.'
        );
        if (!ok) return;
        setBusy(true);
        try {
            await handlers.pause(adId);
        } finally {
            setBusy(false);
        }
    };

    // Тоггл: paused -> active (без лишних вопросов)
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
            {/* 1) Изменить — всегда слева и всегда на месте */}
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

            {/* 2) Тоггл «Пауза / Вернуть» — ОДНА КНОПКА, меняет иконку и обработчик */}
            <button
                type="button"
                className="ad-actions-icon-btn"
                title={isPaused ? 'Вернуть из паузы' : 'Поставить на паузу'}
                aria-label={isPaused ? 'Вернуть из паузы' : 'Поставить на паузу'}
                onClick={isPaused ? onUnpause : onPause}
                disabled={busy || (!canPause && !canUnpause)}
            >
                {isPaused ? <FaCircleCheck className="icon-24" /> : <FaBan className="icon-24" />}
            </button>

            {/* 3) Скрыть/архивировать — всегда третьей */}
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
        </div>
    );
};

export default AdActionsPanel;
