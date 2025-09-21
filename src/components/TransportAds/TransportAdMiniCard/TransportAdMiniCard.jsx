import React from 'react';
import './TransportAdMiniCard.css';

/**
 * Мини-карточка объявления для ленты (пропорции 2:3).
 * Показывает три строки: Дата, От, До.
 *
 * Props:
 *  - ad: объект объявления. Пытаемся взять поля:
 *      date | availabilityDate
 *      from | departureCity
 *      to   | destinationCity
 *  - width?: число px (по умолчанию 60)
 *  - className?: string
 */
const TransportAdMiniCard = ({ ad = {}, width = 60, className = '' }) => {
  const date =
    ad.date ||
    ad.availabilityDate ||
    ''; // например "19.09.2025"
  const from =
    ad.from ||
    ad.departureCity ||
    '—';
  const to =
    ad.to ||
    ad.destinationCity ||
    '—';

  // Заголовок для подсказки при наведении
  const title = `Дата: ${date || '—'}\nОт: ${from || '—'}\nДо: ${to || '—'}`;

  return (
    <div
      className={`ta-mini ${className}`}
      title={title}
      style={{
        width: `${width}px`,
        aspectRatio: '2 / 3', // высота автоматически = width * 1.5
      }}
      role="group"
      aria-label={`Объявление: ${date || ''} ${from || ''} → ${to || ''}`}
    >
      <div className="ta-mini__row ta-mini__date" aria-label="Дата">
        {date || '—'}
      </div>
      <div className="ta-mini__row" aria-label="Откуда" title={from}>
        {from || '—'}
      </div>
      <div className="ta-mini__row" aria-label="Куда" title={to}>
        {to || '—'}
      </div>
    </div>
  );
};

export default TransportAdMiniCard;
