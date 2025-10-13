// src/admin/components/Tables/TableToolbar.jsx
import React from 'react';

export default function TableToolbar({ filters, onChange, actions = [] }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="table-toolbar">
      <div className="filters">
        <input
          placeholder="Поиск…"
          value={filters.q || ''}
          onChange={(e) => update('q', e.target.value)}
        />

        {/* Новый фильтр по типу */}
        <select
          value={filters.type || 'all'}
          onChange={(e) => update('type', e.target.value)}
        >
          <option value="all">Все типы</option>
          <option value="cargo">Груз</option>
          <option value="transport">Транспорт</option>
        </select>

        {/* Фильтр по статусу */}
        <select
          value={filters.status || ''}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="hidden">Скрытые</option>
          <option value="deleted">Удалённые</option>
          <option value="work">В работе</option>
          <option value="completed">Завершённые</option>
        </select>
      </div>

      <div className="actions">
        {actions.map((a, i) => (
          <button
            key={i}
            className={`btn ${a.variant === 'danger' ? 'btn-danger' : ''}`}
            disabled={a.disabled}
            onClick={a.onClick}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
