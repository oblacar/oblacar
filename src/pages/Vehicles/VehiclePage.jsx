import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';

import { VehicleContext } from '../../hooks/VehicleContext';
import VehicleCard from '../../components/VehicleCard/VehicleCard';
import Button from '../../components/common/Button/Button';
import ConfirmationDialog from '../../components/common/ConfirmationDialog/ConfirmationDialog';

import VehicleFormSection from '../../components/CreateTransportAd/VehicleFormSection';
import { truckTypesWithLoading } from '../../constants/transportAdData';
import AddPhotoButton from '../../components/common/AddPhotoButton/AddPhotoButton';
import MultiTruckPhotoUploader from '../../components/MultiTruckPhotoUploader/MultiTruckPhotoUploader';

import './VehiclePage.css';

const VehiclePage = () => {
  const { truckId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();

  const {
    vehicles,
    loading,
    error,
    refresh,
    updateVehicle,
    removeVehicle,
  } = useContext(VehicleContext);

  const vehicle = useMemo(
    () => vehicles.find((v) => String(v.truckId) === String(truckId)) || null,
    [vehicles, truckId]
  );

  // режим редактирования — через ?edit=1, чтобы переживать F5
  const [isEditing, setIsEditing] = useState(search.get('edit') === '1');

  // снимок на момент начала редактирования (для сравнения)
  const [snapshot, setSnapshot] = useState(null);

  // локальная форма (для превью при редактировании)
  const [formData, setFormData] = useState(() => vehicle || {});
  useEffect(() => {
    if (vehicle && !isEditing) setFormData(vehicle);
  }, [vehicle, isEditing]);

  const formRef = useRef(null);
  const updateFormData = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  // если пришли по прямой ссылке и стейта ещё нет — подтянем
  useEffect(() => {
    if (!vehicle && !loading) {
      refresh().catch(() => {});
    }
  }, [vehicle, loading, refresh]);

  // sync URL ?edit
  useEffect(() => {
    const q = search.get('edit') === '1';
    if (q !== isEditing) setIsEditing(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const goToList = () => navigate('/vehicles');

  const startEdit = () => {
    setSnapshot(vehicle || {});
    setFormData(vehicle || {});
    setIsEditing(true);
    setSearch((prev) => {
      const s = new URLSearchParams(prev);
      s.set('edit', '1');
      return s;
    }, { replace: true });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData(vehicle || {});
    setSnapshot(null);
    setSearch((prev) => {
      const s = new URLSearchParams(prev);
      s.delete('edit');
      return s;
    }, { replace: true });
  };

  // ===== сравнение "были изменения?" =====
  const isDirty = useMemo(() => {
    if (!isEditing) return false;
    if (!snapshot) return false;
    return !deepVehicleEqual(normalizeVehicle(snapshot), normalizeVehicle(formData));
  }, [isEditing, snapshot, formData]);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleSave = async () => {
    // если нечего сохранять — просто выходим
    if (!isDirty) return;

    const ok = formRef.current?.validateFields ? formRef.current.validateFields() : true;
    if (!ok) return;

    try {
      setSaving(true);
      setSavedMsg('');
      await updateVehicle(truckId, formData); // контекст сам сохранит в БД/Storage и обновит список
      setIsEditing(false);
      setSnapshot(null);
      setSearch((prev) => {
        const s = new URLSearchParams(prev);
        s.delete('edit');
        return s;
      }, { replace: true });
      setSavedMsg('Машина сохранена');
      setTimeout(() => setSavedMsg(''), 1800);
    } catch (e) {
      setSavedMsg(`Ошибка: ${String(e?.message || e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      setRemoving(true);
      await removeVehicle(truckId);
      navigate('/vehicles');
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(false);
    }
  };

  if (loading && !vehicle) {
    return (
      <div className="deliveries-container">
        <p>Загрузка…</p>
      </div>
    );
  }
  if (error && !vehicle) {
    return (
      <div className="deliveries-container">
        <p className="error-text">Ошибка: {String(error)}</p>
      </div>
    );
  }
  if (!vehicle) {
    return (
      <div className="deliveries-container">
        <p>Машина не найдена.</p>
      </div>
    );
  }

  return (
    <div className="deliveries-container">
      <div
        className="page-header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
      >
        <h1 className="page-title">{vehicle.truckName || 'Машина'}</h1>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/vehicles">
            <Button>К списку</Button>
          </Link>

          {!isEditing ? (
            <>
              <Button type_btn="yes" onClick={startEdit}>Редактировать</Button>
              <Button type_btn="no" onClick={() => setShowConfirm(true)}>Удалить</Button>
            </>
          ) : (
            <>
              {/* Индикатор изменений */}
              <span className={`dirty-indicator ${isDirty ? 'dirty' : 'clean'}`}>
                {isDirty ? 'Есть несохранённые изменения' : 'Изменений нет'}
              </span>

              <Button onClick={cancelEdit}>Отмена</Button>
              <Button
                type_btn="yes"
                onClick={handleSave}
                disabled={!isDirty || saving}
                title={!isDirty ? 'Нет изменений' : undefined}
              >
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </>
          )}
        </div>
      </div>

      {savedMsg && <div className="vehicle-page__saved">{savedMsg}</div>}

      {/* Превью: при редактировании используем formData, чтобы видеть изменения сразу */}
      <div className="card-wrap">
        <VehicleCard vehicle={isEditing ? formData : vehicle} isCreateCard={false} />
      </div>

      {isEditing && (
        <div className="vehicle-page__form">
          <VehicleFormSection
            ref={formRef}
            formData={formData}
            updateFormData={updateFormData}
            truckTypesWithLoading={truckTypesWithLoading}
            openFileDialog={() => document.getElementById('file-upload')?.click()}
            AddPhotoButton={AddPhotoButton}
            MultiTruckPhotoUploader={MultiTruckPhotoUploader}
          />
        </div>
      )}

      {showConfirm && (
        <div className="confirmation-backdrop">
          <ConfirmationDialog
            message="Удалить эту машину?"
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
          />
        </div>
      )}

      {removing && (
        <div className="saving-overlay">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
};

export default VehiclePage;

/* ===== helpers: нормализация и сравнение ===== */

function normalizeVehicle(v = {}) {
  return {
    truckName: (v.truckName ?? '').toString().trim(),
    transportType: v.transportType ?? '',
    loadingTypes: normalizeLoadingTypes(v.loadingTypes),
    truckWeight: numOrNull(v.truckWeight),
    truckHeight: numOrNull(v.truckHeight),
    truckWidth: numOrNull(v.truckWidth),
    truckDepth: numOrNull(v.truckDepth),
    truckPhotoUrls: normalizePhotoUrls(v.truckPhotoUrls),
  };
}

function normalizeLoadingTypes(val) {
  if (!val) return [];
  if (Array.isArray(val)) return [...val].filter(Boolean).map(String).sort();
  if (typeof val === 'object') {
    return Object.keys(val)
      .filter((k) => !!val[k])
      .sort();
  }
  return [];
}

function normalizePhotoUrls(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === 'object') {
    return Object.entries(val)
      .sort((a, b) =>
        String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true })
      )
      .map(([, url]) => String(url))
      .filter(Boolean);
  }
  return [];
}

function numOrNull(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function deepVehicleEqual(a, b) {
  // Сравниваем по полям; массивы — по длине и элементам.
  if (a.truckName !== b.truckName) return false;
  if (a.transportType !== b.transportType) return false;

  if (a.loadingTypes.length !== b.loadingTypes.length) return false;
  for (let i = 0; i < a.loadingTypes.length; i++) {
    if (a.loadingTypes[i] !== b.loadingTypes[i]) return false;
  }

  if (a.truckWeight !== b.truckWeight) return false;
  if (a.truckHeight !== b.truckHeight) return false;
  if (a.truckWidth !== b.truckWidth) return false;
  if (a.truckDepth !== b.truckDepth) return false;

  if (a.truckPhotoUrls.length !== b.truckPhotoUrls.length) return false;
  for (let i = 0; i < a.truckPhotoUrls.length; i++) {
    if (a.truckPhotoUrls[i] !== b.truckPhotoUrls[i]) return false;
  }

  return true;
}
