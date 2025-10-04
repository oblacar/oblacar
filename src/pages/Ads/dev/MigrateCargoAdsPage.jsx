import React, { useState } from 'react';
import CargoAdService from '../../../services/CargoAdService';

const box = {
    maxWidth: 860,
    margin: '32px auto',
    padding: 20,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fff',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
};

const row = { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 };
const btn = (variant = 'primary') => ({
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px solid',
    cursor: 'pointer',
    fontSize: 14,
    ...(variant === 'primary'
        ? { background: '#2563eb', color: '#fff', borderColor: '#1d4ed8' }
        : variant === 'danger'
            ? { background: '#ef4444', color: '#fff', borderColor: '#dc2626' }
            : { background: '#f3f4f6', color: '#111827', borderColor: '#e5e7eb' }),
    opacity: 1,
});
const btnDisabled = { opacity: 0.6, cursor: 'not-allowed' };
const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 };

export default function MigrateCargoAdsPage() {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [log, setLog] = useState([]);

    const appendLog = (msg, data) => {
        setLog((prev) => [...prev, { ts: new Date(), msg, data }]);
    };

    const runDry = async () => {
        if (running) return;
        setRunning(true);
        setResult(null);
        setLog([]);
        appendLog('Старт dry-run миграции…');
        try {
            const res = await CargoAdService.migrateAllToCanonical({ dryRun: true, keepAliases: true });
            setResult(res);
            appendLog('Dry-run завершён', res);
        } catch (e) {
            appendLog('Ошибка dry-run', String(e?.message || e));
            console.error(e);
        } finally {
            setRunning(false);
        }
    };

    const runWrite = async () => {
        if (running) return;
        if (!window.confirm('Выполнить миграцию с записью в БД? Это изменит все cargoAds.')) {
            return;
        }
        setRunning(true);
        setResult(null);
        setLog([]);
        appendLog('Старт миграции (запись)…');
        try {
            const res = await CargoAdService.migrateAllToCanonical({ dryRun: false, keepAliases: true });
            setResult(res);
            appendLog('Миграция завершена (запись)', res);
        } catch (e) {
            appendLog('Ошибка миграции (запись)', String(e?.message || e));
            console.error(e);
        } finally {
            setRunning(false);
        }
    };

    const dropAliases = async () => {
        if (running) return;
        if (
            !window.confirm(
                'Очистить алиасы (departureCity/destinationCity, packagingType) по всей БД?\n' +
                'Делай это только если фронт больше их не читает.'
            )
        ) {
            return;
        }
        setRunning(true);
        setResult(null);
        setLog([]);
        appendLog('Старт чистки алиасов (запись, keepAliases=false)…');
        try {
            const res = await CargoAdService.migrateAllToCanonical({ dryRun: false, keepAliases: false });
            setResult(res);
            appendLog('Очистка алиасов завершена', res);
        } catch (e) {
            appendLog('Ошибка при очистке алиасов', String(e?.message || e));
            console.error(e);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div style={box}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Миграция cargoAds → каноническая схема</h2>
            <p style={{ marginTop: 8, color: '#4b5563' }}>
                Dry-run ничего не пишет в БД, только логирует ожидаемые изменения. Миграция (запись) — применяет
                патчи по всей базе.
            </p>

            <div style={row}>
                <button
                    style={{ ...btn('secondary'), ...(running ? btnDisabled : {}) }}
                    disabled={running}
                    onClick={runDry}
                >
                    Пробный прогон (dry-run)
                </button>

                <button
                    style={{ ...btn('primary'), ...(running ? btnDisabled : {}) }}
                    disabled={running}
                    onClick={runWrite}
                >
                    Мигрировать (запись)
                </button>

                <button
                    style={{ ...btn('danger'), ...(running ? btnDisabled : {}) }}
                    disabled={running}
                    onClick={dropAliases}
                    title="Удаляет departureCity/destinationCity и packagingType. Внимание!"
                >
                    Очистить алиасы
                </button>
            </div>

            {running && (
                <div style={{ marginTop: 16, color: '#2563eb' }}>
                    Выполняется… смотри также логи в консоли браузера.
                </div>
            )}

            {result && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Итог:</div>
                    <pre style={mono}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            {log.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Логи:</div>
                    <div
                        style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            maxHeight: 320,
                            overflow: 'auto',
                            background: '#fafafa',
                        }}
                    >
                        {log.map((l, i) => (
                            <div key={i} style={{ marginBottom: 8 }}>
                                <div style={{ color: '#6b7280', fontSize: 12 }}>
                                    {l.ts.toLocaleTimeString()} — {l.msg}
                                </div>
                                {l.data && <pre style={{ ...mono, margin: 0 }}>{JSON.stringify(l.data, null, 2)}</pre>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
