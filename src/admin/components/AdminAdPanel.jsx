import React from 'react';

export default function AdminAdPanel({
    ad,
    type,
    onDelete,
    onBlock,
    onRestore,
    viewMode,
    onViewModeChange,
}) {
    const statusColor =
        {
            active: 'green',
            blocked: 'red',
            deleted: 'gray',
            hidden: 'orange',
            work: 'blue',
        }[ad.status] || 'black';

    return (
        <div
            className='admin-ad-panel flex items-center justify-between p-3 rounded-xl'
            style={{ background: '#f4f4f4', border: '1px solid #ddd' }}
        >
            <div>
                <div>
                    <b>ID:</b> {ad.id}
                </div>
                <div>
                    <b>Тип:</b> {type}
                </div>
                <div>
                    <b>Статус:</b>{' '}
                    <span style={{ color: statusColor }}>
                        {ad.status || '—'}
                    </span>
                </div>
                <div>
                    <b>Владелец:</b> {ad.ownerName || ad.ownerId || '-'}
                </div>
            </div>

            <div className='flex gap-2'>
                <button
                    className='btn'
                    onClick={onBlock}
                >
                    🚫 Заблокировать
                </button>
                <button
                    className='btn'
                    onClick={onRestore}
                >
                    ✅ Восстановить
                </button>
                <button
                    className='btn btn-danger'
                    onClick={onDelete}
                >
                    🗑️ Удалить навсегда
                </button>

                <div className='ml-6'>
                    <label>
                        Режим просмотра:&nbsp;
                        <select
                            value={viewMode}
                            onChange={(e) => onViewModeChange(e.target.value)}
                        >
                            <option value='owner'>Владелец</option>
                            <option value='public'>Посетитель</option>
                        </select>
                    </label>
                </div>
            </div>
        </div>
    );
}
