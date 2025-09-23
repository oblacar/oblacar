// src/pages/CargoAds/NewCargoAdPage.jsx
import React, { useState } from 'react';
import CargoAdItem from '../../../../components/CargoAds/CargoAdItem';
import CreateCargoAdForm from '../../../../components/CargoAds/CreateCargoAdForm/CreateCargoAdForm';
import Button from '../../../../components/common/Button/Button';
import ConfirmationDialog from '../../../../components/common/ConfirmationDialog/ConfirmationDialog';

import './NewCargoAdPage.css';

const NewCargoAdPage = () => {
    // «черновик» объявления — летит в превью
    const [draft, setDraft] = useState({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Нажали «+ Разместить»
    const handlePlaceClick = () => {
        // тут позже можно дернуть валидацию формы (ref/контекст)
        setConfirmOpen(true);
    };

    // Подтвердили размещение
    const handleConfirmPlace = async () => {
        setConfirmOpen(false);
        setSaving(true);

        try {
            // TODO: здесь будет реальный вызов контекста/сервиса:
            // await cargoAdsCtx.createAd(draft)
            await new Promise((r) => setTimeout(r, 1000)); // имитация
            // TODO: показать тост «Объявление размещено», очистить форму/черновик при необходимости
            console.log('РАЗМЕЩЕНО (заглушка):', draft);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='new-cargo-page'>
            {/* Заголовок */}
            <h1 className='new-cargo-page__title'>
                Новое объявление на перевозку Груза
            </h1>

            {/* Полоса: превью слева, кнопка справа */}
            <div className='new-cargo-page__topbar'>
                <div className='new-cargo-page__preview'>
                    <CargoAdItem ad={draft} />
                </div>
                <div className='new-cargo-page__actions'>
                    <Button
                        type_btn=''
                        onClick={handlePlaceClick}
                    >
                        + Разместить
                    </Button>
                </div>
            </div>

            {/* Подзаголовок перед формой */}
            <div className='new-cargo-page__subtitle'>Введите данные:</div>

            {/* Форма. Если твоя форма поддерживает onDraftChange — превью будет «живым» */}
            <CreateCargoAdForm
                layout='columns'
                onDraftChange={(patch) =>
                    setDraft((prev) => ({ ...prev, ...patch }))
                }
            />

            {/* Диалог подтверждения */}
            {confirmOpen && (
                <div className='confirmation-backdrop'>
                    <ConfirmationDialog
                        message='Разместить объявление?'
                        onConfirm={handleConfirmPlace}
                        onCancel={() => setConfirmOpen(false)}
                    />
                </div>
            )}

            {/* Индикатор сохранения */}
            {saving && (
                <div className='saving-overlay'>
                    <div className='spinner' />
                </div>
            )}
        </div>
    );
};

export default NewCargoAdPage;
