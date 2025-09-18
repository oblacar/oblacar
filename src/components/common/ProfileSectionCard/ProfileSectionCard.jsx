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
    renderContent, // если передан — кастомная лента (машины и т.п.)
}) => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);

    const goToList = () => navigate(toList);

    // что считаем интерактивом (клик по нему НЕ должен вести карточку на список)
    const isInteractive = (el) =>
        el?.closest?.(
            'a,button,[role="button"],[role="link"],.va-row__item,.va-row__nav,input,select,textarea,label'
        );

    const handleCardClick = (e) => {
        if (isInteractive(e.target)) return; // клик по элементу ленты/ссылке— игнорим
        goToList();                           // клик по "фону" карточки — идём на список
    };

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isInteractive(e.target)) {
            e.preventDefault();
            goToList();
        }
    };

    const handleMouseDown = (e) => {
        if (!isInteractive(e.target)) setIsActive(true);
    };
    const clearActive = () => setIsActive(false);

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
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseUp={clearActive}
            onMouseLeave={clearActive}
        >
            <div className="profile-section-card__header">
                <div>
                    <h2 className="profile-section-card__title">{title}</h2>
                    {subtitle && items.length === 0 && <p className="profile-section-card__subtitle">{subtitle}</p>}
                </div>
            </div>

            {typeof renderContent === 'function' ? (
                <div className="profile-section-card__custom">
                    {renderContent(items)} {/* ВАЖНО: без stopPropagation — карточка сама разбирает target */}
                </div>
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
                            <Link key={key} to={to} className="profile-section-card__item-link">
                                {(renderItem || defaultRenderItem)(item)}
                            </Link>
                        );
                    })}
                    {overflow > 0 && (
                        <Link
                            to={toList}
                            className="profile-section-card__more"
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
