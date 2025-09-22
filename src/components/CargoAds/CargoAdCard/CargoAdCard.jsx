import React, { useMemo } from 'react';
import './CargoAdCard.css';

/**
 * Карточка объявления о перевозке груза (для персональной страницы).
 *
 * Ожидаемые поля в ad (плоско или внутри { ad }): 
 * - adId
 * - createdAt (ISO) или date
 * - route: { from, to }
 * - dates: { pickupDate, deliveryDate } или availabilityDate
 * - cargo: { name, type, weightTons, dims: { h, w, d }, fragile, temperature }
 * - loadingTypes: string[] (либо объект {верхняя:true,...})
 * - price: { value, unit, readyToNegotiate }
 *
 * Пример минимального:
 * { route:{from:'Москва',to:'СПб'}, cargo:{weightTons:10, dims:{h:2,w:2,d:6}}, loadingTypes:['задняя'], price:{value:50000,unit:'руб',readyToNegotiate:true} }
 */
const CargoAdCard = ({ ad = {}, className = '' }) => {
  const data = ad?.ad ? ad.ad : ad;

  const {
    adId,
    createdAt,
    date,
    route = {},
    dates = {},
    availabilityDate,
    cargo = {},
    loadingTypes,
    price = {},
  } = data;

  const created = createdAt || date || null;
  const dateStr = created ? fmtDate(created) : null;

  const from = route.from || route.departureCity || '—';
  const to   = route.to || route.destinationCity || '—';

  const pickup = dates.pickupDate || availabilityDate || null;
  const delivery = dates.deliveryDate || null;

  const cargoName = cargo.name || cargo.title || '';
  const cargoType = cargo.type || '';
  const weight = cargo.weightTons ?? cargo.weight ?? null;
  const dims = cargo.dims || {
    h: data.truckHeight,
    w: data.truckWidth,
    d: data.truckDepth,
  };

  const tagsLoading = useMemo(() => normalizeLoadingTypes(loadingTypes), [loadingTypes]);

  const temperature = cargo.temperature; // например "0…+5°C" или null
  const fragile = !!cargo.fragile;

  const priceValue = price.value ?? data.price;
  const priceUnit  = price.unit ?? data.paymentUnit ?? 'руб';
  const bargain    = !!(price.readyToNegotiate ?? data.readyToNegotiate);

  return (
    <div className={`cargo-card ${className}`}>
      {/* Верхняя строка: маршрут + даты справа */}
      <div className="cargo-card__head">
        <div className="cargo-card__route">
          <div className="cargo-card__cities">
            <span className="cargo-card__city">{from}</span>
            <span className="cargo-card__arrow">→</span>
            <span className="cargo-card__city">{to}</span>
          </div>
          {dateStr && <div className="cargo-card__meta">создано: {dateStr}</div>}
        </div>

        <div className="cargo-card__dates">
          {pickup && (
            <div className="cargo-card__date-row">
              <span className="cargo-card__date-label">Забор:</span>
              <span className="cargo-card__date-value">{fmtDate(pickup)}</span>
            </div>
          )}
          {delivery && (
            <div className="cargo-card__date-row">
              <span className="cargo-card__date-label">Доставка:</span>
              <span className="cargo-card__date-value">{fmtDate(delivery)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Средняя часть: о грузе */}
      <div className="cargo-card__body">
        <div className="cargo-card__left">
          {(cargoName || cargoType) && (
            <div className="cargo-card__row">
              <span className="cargo-card__label">Груз:</span>
              <span className="cargo-card__value">
                {cargoName || '—'}
                {cargoType ? ` · ${cargoType}` : ''}
              </span>
            </div>
          )}

          <div className="cargo-card__row">
            <span className="cargo-card__label">Вес (т):</span>
            <span className="cargo-card__value">{fmtNum(weight)}</span>
          </div>

          <div className="cargo-card__row">
            <span className="cargo-card__label">Габариты (м):</span>
            <span className="cargo-card__value">{fmtDims(dims?.h, dims?.w, dims?.d)}</span>
          </div>

          {!!tagsLoading.length && (
            <div className="cargo-card__row cargo-card__row--tags">
              <span className="cargo-card__label">Загрузка:</span>
              <span className="cargo-card__tags">
                {tagsLoading.map((t) => (
                  <span key={t} className="cargo-card__tag">{t}</span>
                ))}
              </span>
            </div>
          )}

          {(fragile || temperature) && (
            <div className="cargo-card__row cargo-card__row--flags">
              {fragile && <span className="cargo-card__flag">Хрупкий</span>}
              {temperature && <span className="cargo-card__flag cargo-card__flag--temp">{temperature}</span>}
            </div>
          )}
        </div>

        <div className="cargo-card__right">
          <div className="cargo-card__price">
            {isFiniteNumber(priceValue) ? (
              <>
                <div className="cargo-card__price-value">
                  {fmtPrice(priceValue)}
                </div>
                <div className="cargo-card__price-unit">{priceUnit}</div>
              </>
            ) : (
              <div className="cargo-card__price-na">Цена не указана</div>
            )}
          </div>
          {bargain && <div className="cargo-card__bargain">готов обсудить</div>}
        </div>
      </div>

      {/* Нижняя строка: ID или любые доп. метки */}
      {adId && (
        <div className="cargo-card__foot">
          <span className="cargo-card__id">ID: {String(adId)}</span>
        </div>
      )}
    </div>
  );
};

export default CargoAdCard;

/* ==== утилиты ==== */
function normalizeLoadingTypes(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') {
    return Object.keys(val).filter((k) => !!val[k]);
  }
  return [];
}

function fmtDate(d) {
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt?.getTime())) return '—';
    return dt.toLocaleDateString('ru-RU');
  } catch {
    return '—';
  }
}

function fmtNum(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  return String(Math.round(num * 100) / 100).replace(/\.00?$/, '');
}

function fmtDims(h, w, d) {
  const H = Number(h), W = Number(w), D = Number(d);
  const hasAny = [H, W, D].some(Number.isFinite);
  if (!hasAny) return '—';
  const s = (x) =>
    Number.isFinite(Number(x))
      ? String(Math.round(Number(x) * 100) / 100).replace(/\.00?$/, '')
      : '—';
  return `${s(H)}×${s(W)}×${s(D)}`;
}

function fmtPrice(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('ru-RU');
}

function isFiniteNumber(v) {
  return Number.isFinite(Number(v));
}
