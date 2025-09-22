import React from 'react';
import { Link } from 'react-router-dom';
import './CargoAdMiniCard.css';

const CargoAdMiniCard = ({ ad, to, className = '' }) => {
  // поддержка как «чистого» ad, так и { ad, isInReviewAds }
  const data = ad?.ad ? ad.ad : ad || {};

  const id = data.adId || data.id || '';
  const from = data.route?.from || data.departureCity || '—';
  const toCity = data.route?.to || data.destinationCity || '—';
  const date =
    data.dates?.pickupDate ||
    data.availabilityDate ||
    data.createdAt ||
    data.date ||
    '';

  const priceVal = data.price?.value;
  const priceUnit = data.price?.unit || 'руб';
  const priceStr =
    typeof priceVal === 'number'
      ? `${formatMoney(priceVal)} ${priceUnit}`
      : data.price?.text || 'Цена не указана';

  const content = (
    <div className={`ca-mini ${className}`}>
      <div className="ca-mini__date" title={date}>{date || '—'}</div>
      <div className="ca-mini__route" title={`${from} → ${toCity}`}>
        <span className="ca-mini__from">{from}</span>
        <span className="ca-mini__arrow">→</span>
        <span className="ca-mini__to">{toCity}</span>
      </div>
      <div className="ca-mini__price" title={priceStr}>{priceStr}</div>
    </div>
  );

  // если передан маршрут — делаем карточку кликабельной ссылкой
  return to ? (
    <Link to={to} className="ca-mini__link">
      {content}
    </Link>
  ) : (
    content
  );
};

export default CargoAdMiniCard;

// helpers
function formatMoney(n) {
  try {
    return new Intl.NumberFormat('ru-RU').format(n);
  } catch {
    return String(n);
  }
}
