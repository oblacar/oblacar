// // src/components/CargoAdCard/CargoAdCard.jsx
// import React, { useMemo } from 'react';
// import './CargoAdCard.css';

// /**
//  * Карточка объявления о перевозке груза.
//  *
//  * Ожидаемая схема данных (плоская или в виде { ad }):
//  * - adId
//  * - createdAt | date
//  * - route?: { from, to } | { departureCity, destinationCity }
//  *   либо top-level: departureCity, destinationCity
//  * - availabilityFrom, availabilityTo        ← фиксированные поля дат
//  * - cargo?: {
//  *     name|title, type,
//  *     weightTons|weight,
//  *     dims?: { h, w, d } | (top-level fallbacks: cargoHeight, cargoWidth, cargoDepth),
//  *     fragile?: boolean,
//  *     temperature?: string
//  *   }
//  * - loadingTypes?: string[] | { [k]: true }
//  * - price?: { value, unit, readyToNegotiate }
//  *   либо top-level: price, paymentUnit, readyToNegotiate
//  */
// const CargoAdCard = ({ ad = {}, className = '' }) => {
//   // Поддерживаем обёртку расширенных данных { ad: {...} }
//   const data = ad?.ad ? ad.ad : ad;

//   const {
//     adId,
//     createdAt,
//     date, // альтернативное имя даты создания
//     route = {},
//     cargo = {},
//     loadingTypes,
//     price = {},
//   } = data;

//   // --- Дата создания карточки ---
//   const created = createdAt || date || null;
//   const dateStr = created ? fmtDate(created) : null;

//   // --- Маршрут (берём из route или top-level) ---
//   const from =
//     route.from ??
//     route.departureCity ??
//     data.departureCity ??
//     data.from ??
//     '—';

//   const to =
//     route.to ??
//     route.destinationCity ??
//     data.destinationCity ??
//     data.to ??
//     '—';

//   // --- Даты перевозки (зафиксированная схема) ---
//   const pickup   = data.availabilityFrom ?? null;
//   const delivery = data.availabilityTo   ?? null;

//   // --- О грузе ---
//   const cargoName =
//     cargo.name ??
//     cargo.title ??
//     data.cargoName ??
//     data.cargoTitle ??
//     '';

//   const cargoType =
//     cargo.type ??
//     data.cargoType ??
//     '';

//   const weight =
//     cargo.weightTons ??
//     cargo.weight ??
//     data.cargoWeightTons ??
//     data.cargoWeight ??
//     data.weightTons ??
//     data.weight ??
//     null;

//   const dims = cargo.dims || {
//     h: cargo.h ?? data.cargoHeight ?? data.height ?? data.truckHeight,
//     w: cargo.w ?? data.cargoWidth  ?? data.width  ?? data.truckWidth,
//     d: cargo.d ?? data.cargoDepth  ?? data.depth  ?? data.truckDepth,
//   };

//   const tagsLoading = useMemo(
//     () => normalizeLoadingTypes(loadingTypes ?? data.loadingTypes),
//     [loadingTypes, data.loadingTypes]
//   );

//   const temperature = cargo.temperature ?? data.temperature ?? null;
//   const fragile = Boolean(cargo.fragile ?? data.fragile);

//   // --- Цена ---
//   const priceValue = price.value ?? data.price;
//   const priceUnit  = price.unit ?? data.paymentUnit ?? 'руб';
//   const bargain    = Boolean(price.readyToNegotiate ?? data.readyToNegotiate);

//   return (
//     <div className={`cargo-card ${className}`}>
//       {/* Верхняя строка: маршрут + мета (дата создания) */}
//       <div className="cargo-card__head">
//         <div className="cargo-card__route">
//           <div className="cargo-card__cities">
//             <span className="cargo-card__city">{from}</span>
//             <span className="cargo-card__arrow">→</span>
//             <span className="cargo-card__city">{to}</span>
//           </div>
//           {dateStr && <div className="cargo-card__meta">создано: {dateStr}</div>}
//         </div>

//         <div className="cargo-card__dates">
//           {pickup && (
//             <div className="cargo-card__date-row">
//               <span className="cargo-card__date-label">Забор:</span>
//               <span className="cargo-card__date-value">{fmtDate(pickup)}</span>
//             </div>
//           )}
//           {delivery && (
//             <div className="cargo-card__date-row">
//               <span className="cargo-card__date-label">Доставка:</span>
//               <span className="cargo-card__date-value">{fmtDate(delivery)}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Средняя часть: о грузе */}
//       <div className="cargo-card__body">
//         <div className="cargo-card__left">
//           {(cargoName || cargoType) && (
//             <div className="cargo-card__row">
//               <span className="cargo-card__label">Груз:</span>
//               <span className="cargo-card__value">
//                 {/* {cargoName || '—'} */}
//                 {cargoType ? `${cargoType}` : ''}
//               </span>
//             </div>
//           )}

//           <div className="cargo-card__row">
//             <span className="cargo-card__label">Вес (т):</span>
//             <span className="cargo-card__value">{fmtNum(weight)}</span>
//           </div>

//           <div className="cargo-card__row">
//             <span className="cargo-card__label">Габариты (м):</span>
//             <span className="cargo-card__value">
//               {fmtDims(dims?.h, dims?.w, dims?.d)}
//             </span>
//           </div>

//           {!!tagsLoading.length && (
//             <div className="cargo-card__row cargo-card__row--tags">
//               <span className="cargo-card__label">Загрузка:</span>
//               <span className="cargo-card__tags">
//                 {tagsLoading.map((t) => (
//                   <span key={t} className="cargo-card__tag">{t}</span>
//                 ))}
//               </span>
//             </div>
//           )}

//           {(fragile || temperature) && (
//             <div className="cargo-card__row cargo-card__row--flags">
//               {fragile && <span className="cargo-card__flag">Хрупкий</span>}
//               {temperature && (
//                 <span className="cargo-card__flag cargo-card__flag--temp">
//                   {temperature}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>

//         <div className="cargo-card__right">
//           <div className="cargo-card__price">
//             {isFiniteNumber(priceValue) ? (
//               <>
//                 <div className="cargo-card__price-value">{fmtPrice(priceValue)}</div>
//                 <div className="cargo-card__price-unit">{priceUnit}</div>
//               </>
//             ) : (
//               <div className="cargo-card__price-na">Цена не указана</div>
//             )}
//           </div>
//           {bargain && <div className="cargo-card__bargain">готов обсудить</div>}
//         </div>
//       </div>

//       {/* Нижняя строка: ID */}
//       {adId && (
//         <div className="cargo-card__foot">
//           <span className="cargo-card__id">ID: {String(adId)}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CargoAdCard;

// /* ===== утилиты ===== */

// function normalizeLoadingTypes(val) {
//   if (!val) return [];
//   if (Array.isArray(val)) return val;
//   if (typeof val === 'object') return Object.keys(val).filter((k) => !!val[k]);
//   return [];
// }

// function fmtDate(d) {
//   if (!d) return '—';

//   if (typeof d === 'string') {
//     // dd.MM.yyyy или dd/MM/yyyy — показываем как есть (в RU-формате уже ок)
//     const m = d.match(/^(\d{2})[./](\d{2})[./](\d{4})$/);
//     if (m) return `${m[1]}.${m[2]}.${m[3]}`;

//     // ISO-строки / другие — пробуем распарсить
//     const t = Date.parse(d);
//     if (!Number.isNaN(t)) return new Date(t).toLocaleDateString('ru-RU');

//     return d; // если формат кастомный — вернём как есть
//   }

//   if (typeof d === 'number') {
//     return new Date(d).toLocaleDateString('ru-RU');
//   }

//   if (d instanceof Date && !Number.isNaN(d.getTime())) {
//     return d.toLocaleDateString('ru-RU');
//   }

//   return '—';
// }

// function fmtNum(n) {
//   const num = Number(n);
//   if (!Number.isFinite(num)) return '—';
//   return String(Math.round(num * 100) / 100).replace(/\.00?$/, '');
// }

// function fmtDims(h, w, d) {
//   const H = Number(h), W = Number(w), D = Number(d);
//   const hasAny = [H, W, D].some(Number.isFinite);
//   if (!hasAny) return '—';
//   const s = (x) =>
//     Number.isFinite(Number(x))
//       ? String(Math.round(Number(x) * 100) / 100).replace(/\.00?$/, '')
//       : '—';
//   return `${s(H)}×${s(W)}×${s(D)}`;
// }

// function fmtPrice(v) {
//   const n = Number(v);
//   if (!Number.isFinite(n)) return '—';
//   return n.toLocaleString('ru-RU');
// }

// function isFiniteNumber(v) {
//   return Number.isFinite(Number(v));
// }
