import React, { useContext, useMemo, useState } from 'react';
import { VehicleContext } from '../../hooks/VehicleContext';
import TransportAdContext from '../../hooks/TransportAdContext'; // как у тебя в проекте
import MultiTruckPhotoUploader from '../../components/MultiTruckPhotoUploader/MultiTruckPhotoUploader';

const DevVehicleQuickTest = () => {
  const {
    vehicles,
    loading,
    createVehicle,
    updateVehicle,
    removeVehicle,
    refresh,
  } = useContext(VehicleContext);

  const { uploadPhotos } = useContext(TransportAdContext);

  const [status, setStatus] = useState('');
  const [lastId, setLastId] = useState(null);

  // Локальная форма с тестовыми данными
  const [formData, setFormData] = useState({
    truckName: 'Тестовый грузовик',
    transportType: 'Еврофура',
    loadingTypes: ['верхняя', 'задняя'],
    truckWeight: 12,
    truckHeight: 2.6,
    truckWidth: 2.4,
    truckDepth: 7.3,
    truckPhotoUrls: [], // сюда MultiTruckPhotoUploader положит base64 превью
    isActive: true,
  });

  const updateFormData = (patch) => setFormData((p) => ({ ...p, ...patch }));
  const openFileDialog = () => document.getElementById('file-upload')?.click();

  // Первый id из списка, если lastId ещё не выбран
  const fallbackId = useMemo(
    () => (vehicles.length ? vehicles[0].truckId : null),
    [vehicles]
  );

  // Создать с аплоудом фото
  const handleCreate = async () => {
    try {
      setStatus('Создаю…');

      let photoUrls = formData.truckPhotoUrls || [];

      // Если выбраны локальные превью (base64) — зальём в Storage
      if (uploadPhotos && Array.isArray(photoUrls) && photoUrls.length) {
        const uploaded = await uploadPhotos(photoUrls);
        // ожидаем, что uploadPhotos вернёт массив URL из Storage
        if (Array.isArray(uploaded) && uploaded.length) {
          photoUrls = uploaded;
        } else {
          // если ваш uploadPhotos не возвращает ссылки — создадим без фото
          photoUrls = [];
          console.warn('uploadPhotos не вернул URL-ы. Создаю без фото.');
        }
      }

      const saved = await createVehicle({
        ...formData,
        truckPhotoUrls: photoUrls,
      });

      setLastId(saved.truckId);
      setStatus(`Создано: ${saved.truckName} (#${saved.truckId})`);
    } catch (e) {
      console.error(e);
      setStatus(`Ошибка: ${e.message || e}`);
    }
  };

  // Простое обновление имени (для проверки update)
  const handleUpdate = async () => {
    try {
      const id = lastId ?? fallbackId;
      if (!id) return setStatus('Нет id для обновления — создайте машину.');

      const now = new Date().toLocaleTimeString();
      const saved = await updateVehicle(id, {
        truckName: `Обновлено ${now}`,
        truckWeight:
          (vehicles.find((x) => String(x.truckId) === String(id))?.truckWeight || 12) + 1,
      });

      setStatus(`Обновлено: ${saved.truckName} (#${saved.truckId})`);
    } catch (e) {
      console.error(e);
      setStatus(`Ошибка: ${e.message || e}`);
    }
  };

  // Удаление
  const handleDelete = async () => {
    try {
      const id = lastId ?? fallbackId;
      if (!id) return setStatus('Нет id для удаления — создайте машину.');

      await removeVehicle(id);
      if (String(lastId) === String(id)) setLastId(null);
      setStatus(`Удалено: #${id}`);
    } catch (e) {
      console.error(e);
      setStatus(`Ошибка: ${e.message || e}`);
    }
  };

  return (
    <div className="deliveries-container" style={{ border: '1px dashed #ddd', padding: 12 }}>
      <h3>DEV: Быстрый тест машины</h3>

      {/* Выбор фото (кладёт base64 в formData.truckPhotoUrls) */}
      <div style={{ marginBottom: 8 }}>
        <MultiTruckPhotoUploader
          openFileDialog={openFileDialog}
          updateFormData={updateFormData}
        />
        <button className="btn" onClick={openFileDialog} style={{ marginTop: 6 }}>
          Выбрать фото
        </button>
      </div>

      {/* Кнопки действий */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <button className="btn primary" onClick={handleCreate} disabled={loading}>
          Создать (с аплоудом фото)
        </button>
        <button className="btn" onClick={handleUpdate} disabled={loading || !vehicles.length}>
          Обновить имя/вес
        </button>
        <button className="btn danger" onClick={handleDelete} disabled={loading || !vehicles.length}>
          Удалить
        </button>
        <button className="btn" onClick={refresh} disabled={loading}>
          Обновить список
        </button>
      </div>

      {/* Статус */}
      <div style={{ minHeight: 22, marginBottom: 8 }}>
        {loading ? 'Загрузка…' : status}
      </div>

      {/* Список машин для наглядности */}
      <div>
        <strong>Мои машины: {vehicles.length}</strong>
        {!vehicles.length && <div>Пусто</div>}
        {!!vehicles.length && (
          <ul style={{ paddingLeft: 18 }}>
            {vehicles.map((v) => (
              <li key={v.truckId} style={{ marginBottom: 4 }}>
                <strong>{v.truckName || 'Без названия'}</strong> #{v.truckId}{' '}
                <span>• {v.transportType}</span>{' '}
                <button
                  className="btn"
                  onClick={() => {
                    setLastId(v.truckId);
                    setStatus(`Выбран id: #${v.truckId}`);
                  }}
                  style={{ marginLeft: 6 }}
                >
                  выбрать
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DevVehicleQuickTest;
