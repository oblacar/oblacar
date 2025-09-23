import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import CargoAdCard from './CargoAdCard/CargoAdCard';
import CargoAdItem from './CargoAdItem';
import './CargoAdsList.css';

// Если нужен контекст — подключим его; если items передан, контекст не используем.
import CargoAdsContext from '../../hooks/CargoAdsContext';

// (опционально) твой прелоадер
import Preloader from '../common/Preloader/Preloader';

/**
 * Одностолбцовый список объявлений о грузе.
 *
 * Props:
 * - items?: Array<object> — если передан, используем его вместо контекста
 * - linkBase?: string — база для ссылок (по умолчанию "/cargo-ads")
 * - clickable?: boolean — оборачивать карточку в <Link> (по умолчанию true)
 * - filterOwnerId?: string|null — если задан, показываем только объявления этого владельца
 * - emptyText?: string — текст пустого состояния
 */
const CargoAdsList = ({
  items = null,
  linkBase = '/cargo-ads',
  clickable = true,
  filterOwnerId = null,
  emptyText = 'Пока нет объявлений',
}) => {
  const ctx = useContext(CargoAdsContext);

  // Берём данные: приоритет у items, иначе — из контекста
  const loading = items ? false : !!ctx?.loading;
  const error = items ? null : ctx?.error || null;

  const rawList = items ?? ctx?.items ?? ctx?.ads ?? [];

  // Нормализуем структуру: поддержка как "расширенных" {ad, ...}, так и "чистых" объектов объявления
  const normalizeAd = (it) => (it && it.ad ? it.ad : it);

  let data = rawList
    .map(normalizeAd)
    .filter(Boolean);

  // Фильтр по ownerId (если задан)
  if (filterOwnerId) {
    data = data.filter((ad) => String(ad.ownerId) === String(filterOwnerId));
  }

  return (
    <div className="cargo-ads-list">
      {loading && (
        <div className="cargo-ads-list__preloader">
          <Preloader />
        </div>
      )}

      {!loading && error && (
        <div className="cargo-ads-list__error">Ошибка: {String(error)}</div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="cargo-ads-list__empty">{emptyText}</div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="cargo-ads-list__column">
          {data.map((ad) => {
            const key = ad.adId || `${ad.departureCity}-${ad.destinationCity}-${ad.createdAt}`;
            const card = <CargoAdItem ad={ad} />;

            return (
              <div className="cargo-ads-list__item" key={key}>
                {clickable ? (
                  <Link
                    className="cargo-ads-list__link"
                    to={`${linkBase}/${ad.adId}`}
                    title={ad.cargoTitle || 'Объявление'}
                  >
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CargoAdsList;
