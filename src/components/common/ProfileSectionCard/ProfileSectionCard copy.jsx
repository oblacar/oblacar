// src/components/common/ProfileSectionCard/ProfileSectionCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileSectionCard.css';

const ProfileSectionCard = ({
    title,
    subtitle,
    items = [],
    toList,
    buildItemTo,
    idKey = 'id',
    limit = 6,
    renderItem,
    className = '',
    emptyText = 'Пока пусто',
    renderContent,
}) => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);

    // ⬇️ target — откуда пришёл клик, container — сама карточка (e.currentTarget)
    const isInteractive = (target, container) => {
        if (!target) return false;

        // Явные интерактивы: что помечено data-stop-card, а также стандартные контролы
        const n = target.closest?.(
            '[data-stop-card="true"], a, button, [role="button"], input, select, textarea, label'
        );
        if (n) return true;

        // Игнорируем role="link" у САМОЙ карточки; считаем интерактивом только вложенные элементы с role="link"
        const rl = target.closest?.('[role="link"]');
        return Boolean(rl && rl !== container);
    };

    const handleMouseDown = (e) => {
        if (!isInteractive(e.target, e.currentTarget)) {
            setIsActive(true);
        }
    };
    const clearActive = () => setIsActive(false);

    const handleClick = (e) => {
        if (isInteractive(e.target, e.currentTarget)) {
            return;
        }

        navigate(toList);
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isInteractive(e.target, e.currentTarget)) {
            e.preventDefault();

            navigate(toList);
        }
    };

    const visible = items.slice(0, limit);
    const overflow = Math.max(items.length - visible.length, 0);

    const defaultRenderItem = (item) => (
        <div className="profile-section-card__chip">
            <div className="profile-section-card__chip-avatar">
                {String(item.title || item.name || item.truckName || item[idKey] || '?')
                    .slice(0, 1)
                    .toUpperCase()}
            </div>
            <div className="profile-section-card__chip-title">
                {item.title || item.name || item.truckName || '—'}
            </div>
        </div>
    );

    return (
        <div
            className={`profile-section-card ${isActive ? 'ps-active' : ''} ${className}`}
            role="link"
            tabIndex={0}
            onMouseDown={handleMouseDown}
            onMouseUp={clearActive}
            onMouseLeave={clearActive}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            <div className="profile-section-card__header">
                <div>
                    <h2 className="profile-section-card__title">{title}</h2>
                    {subtitle && items.length === 0 && <p className="profile-section-card__subtitle">{subtitle}</p>}
                </div>
            </div>

            {typeof renderContent === 'function' ? (
                <div className="profile-section-card__custom">{renderContent(items)}</div>
            ) : items.length === 0 ? (
                <div className="profile-section-card__empty">
                    <div className="profile-section-card__empty-text">{emptyText}</div>
                </div>
            ) : (
                <div className="profile-section-card__items">
                    {visible.map((item) => {
                        const key = String(item[idKey] ?? item.id ?? item.key ?? Math.random());
                        const to = buildItemTo ? buildItemTo(item) : `${toList}/${item[idKey]}`;
                        return (
                            <Link
                                key={key}
                                to={to}
                                className="profile-section-card__item-link"
                                data-stop-card="true"
                                onClick={(e) => e.stopPropagation()} // не даём всплыть до карточки
                            >
                                {(renderItem || defaultRenderItem)(item)}
                            </Link>
                        );
                    })}
                    {overflow > 0 && (
                        <Link
                            to={toList}
                            className="profile-section-card__more"
                            data-stop-card="true"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Перейти ко всем, ещё ${overflow}`}
                            title={`Перейти ко всем, ещё ${overflow}`}
                        >
                            +{overflow}
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileSectionCard;

// Вспомогательное: получить первую фотку из объекта { ph1: url, ph2: url }
export const firstPhotoFromObject = (obj = {}) => {
    const entries = Object.entries(obj);
    if (!entries.length) return null;
    const sorted = entries.sort(
        (a, b) =>
            Number(a[0].replace('ph', '')) - Number(b[0].replace('ph', ''))
    );
    return sorted[0][1];
};
