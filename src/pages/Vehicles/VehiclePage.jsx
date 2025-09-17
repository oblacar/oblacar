// src/pages/Vehicles/VehicleDetailsPage.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { VehicleContext } from '../../hooks/VehicleContext';
import VehicleCard from '../../components/VehicleCard/VehicleCard';
import Button from '../../components/common/Button/Button';
import ConfirmationDialog from '../../components/common/ConfirmationDialog/ConfirmationDialog';

const VehicleDetailsPage = () => {
  const { truckId } = useParams();
  const navigate = useNavigate();

  const {
    vehicles,
    loading,
    error,
    removeVehicle,
    refresh,
    selectVehicle,
  } = useContext(VehicleContext);

  const vehicle = useMemo(
    () => vehicles.find((v) => String(v.truckId) === String(truckId)),
    [vehicles, truckId]
  );

  const [showConfirm, setShowConfirm] = useState(false);
  const [removing, setRemoving] = useState(false);

  // если пришли по прямой ссылке и в стейте нет машины — подтянем список
  useEffect(() => {
    if (!vehicle && !loading) {
      refresh().catch(() => {});
    }
  }, [vehicle, loading, refresh]);

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      setRemoving(true);
      await removeVehicle(truckId);
      navigate('/vehicles');
    } catch (e) {
      // можно показать уведомление
      console.error(e);
    } finally {
      setRemoving(false);
    }
  };

  if (loading && !vehicle) return <div className="deliveries-container"><p>Загрузка…</p></div>;
  if (error && !vehicle) return <div className="deliveries-container"><p className="error-text">Ошибка: {String(error)}</p></div>;
  if (!vehicle) return <div className="deliveries-container"><p>Машина не найдена.</p></div>;

  return (
    <div className="deliveries-container">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <h1 className="page-title">{vehicle.truckName || 'Машина'}</h1>
        <div style={{display:'flex',gap:8}}>
          <Link to="/vehicles">
            <Button type_btn="">К списку</Button>
          </Link>
          {/* Заглушка под редактирование — страницу добавим позже */}
          <Link to={`/vehicles/${vehicle.truckId}/edit`}>
            <Button type_btn="">Редактировать</Button>
          </Link>
          <Button
            type_btn="no"
            onClick={() => setShowConfirm(true)}
          >
            Удалить
          </Button>
        </div>
      </div>

      <div className="card-wrap">
        <VehicleCard vehicle={vehicle} />
      </div>

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

export default VehicleDetailsPage;
