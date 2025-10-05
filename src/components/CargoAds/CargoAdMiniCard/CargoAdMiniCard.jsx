const CargoAdMiniCard = ({ ad = {}, width = 60, className = '' }) => {
  const date = ad.availabilityFrom || '';
  const from = ad.route.from || '—';
  const to = ad.route.to || '—';

  // Заголовок для подсказки при наведении
  const title = `Дата: ${date || '—'}\nОт: ${from || '—'}\nДо: ${to || '—'}`;

  return (
    <div
      className={`ta-mini paper-style ${className}`}
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

export default CargoAdMiniCard;