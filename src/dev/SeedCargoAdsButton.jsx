// src/components/dev/SeedCargoAdsButton.jsx
import React, { useContext, useState } from 'react';
import { seedCargoAds } from './seedCargoAds';
import AuthContext from '../hooks/Authorization/AuthContext'; // подставь ваш хук

const SeedCargoAdsButton = ({ count = 20 }) => {
  const { userId } = useContext(AuthContext);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    if (!userId) {
      setErr('Нет userId (не авторизованы?)');
      return;
    }
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      await seedCargoAds(userId, count);
      setOk(true);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <button onClick={run} disabled={busy}>
        {busy ? 'Заливаю…' : `Залить ${count} грузов`}
      </button>
      {ok && <span style={{ color: 'green' }}>Готово!</span>}
      {err && <span style={{ color: 'crimson' }}>Ошибка: {err}</span>}
    </div>
  );
};

export default SeedCargoAdsButton;
