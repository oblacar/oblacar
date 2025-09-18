import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './ProfileSectionCard.css';

/**
 * Универсальный «прямоугольный» блок профиля.
 * - Клик по блоку → переход на общий список (toList)
 * - Клик по мини‑карточке элемента → переход на детальную (buildItemTo)
 * - Никаких вложенных ссылок: родитель — div с navigate(), дочерние — <Link/>
 *
 * Props:
 *  - title: string — заголовок
 *  - subtitle?: string — подпись под заголовком (необязательно)
 *  - items: any[] — элементы для превью
 *  - toList: string — маршрут списка
 *  - buildItemTo?: (item) => string — как получить ссылку на элемент
 *  - idKey?: string — ключ id внутри item (по умолчанию 'id')
 *  - limit?: number — сколько превью показать (по умолчанию 6)
 *  - renderItem?: (item) => JSX — как отрисовать превью‑чип
 *  - className?: string — доп. классы корневого блока
 */
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
    renderContent, // ← НОВЫЙ проп
}) => {
    const navigate = useNavigate();
    const goToList = () => navigate(toList);
    const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') goToList();
    };

    const stop = (e) => e.stopPropagation();
    const stopKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
    };

    const visible = items.slice(0, limit);
    const overflow = Math.max(items.length - visible.length, 0);

    const defaultRenderItem = (item) => (
        <div className='profile-section__chip'>
            <div className='profile-section__chip-avatar'>
                {String(
                    item.title ||
                        item.name ||
                        item.truckName ||
                        item[idKey] ||
                        '?'
                )
                    .slice(0, 1)
                    .toUpperCase()}
            </div>
            <div className='profile-section__chip-title'>
                {item.title || item.name || item.truckName || '—'}
            </div>
        </div>
    );

    return (
        <div
            role='link'
            tabIndex={0}
            onClick={goToList}
            onKeyDown={onKey}
        >
            <div className='profile-section__header'>
                <div>
                    <h2 className='profile-section__title'>{title}</h2>
                    {subtitle && (
                        <p className='profile-section__subtitle'>{subtitle}</p>
                    )}
                </div>
            </div>

            {/* КАСТОМНЫЙ КОНТЕНТ (например, лента кружков) */}
            {typeof renderContent === 'function' ? (
                <div
                    className='profile-section__custom'
                    onClick={stop}
                    onKeyDown={stopKey}
                >
                    {renderContent(items)}
                </div>
            ) : (
                // СТАНДАРТНЫЙ РЕНДЕР: чипы + "+ещё"
                <>
                    {items.length === 0 ? (
                        <div className='profile-section__empty'>
                            <div className='profile-section__empty-text'>
                                {emptyText}
                            </div>
                        </div>
                    ) : (
                        <div className='profile-section__items'>
                            {visible.map((item) => {
                                const key = String(
                                    item[idKey] ??
                                        item.id ??
                                        item.key ??
                                        Math.random()
                                );
                                const to = buildItemTo
                                    ? buildItemTo(item)
                                    : `${toList}/${item[idKey]}`;
                                return (
                                    <Link
                                        key={key}
                                        to={to}
                                        className='profile-section__item-link'
                                        onClick={stop}
                                        onKeyDown={stopKey}
                                    >
                                        {(renderItem || defaultRenderItem)(
                                            item
                                        )}
                                    </Link>
                                );
                            })}
                            {overflow > 0 && (
                                <Link
                                    to={toList}
                                    className='profile-section__more'
                                    onClick={stop}
                                    onKeyDown={stopKey}
                                    aria-label={`Перейти ко всем, ещё ${overflow}`}
                                    title={`Перейти ко всем, ещё ${overflow}`}
                                >
                                    +{overflow}
                                </Link>
                            )}
                        </div>
                    )}
                </>
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
