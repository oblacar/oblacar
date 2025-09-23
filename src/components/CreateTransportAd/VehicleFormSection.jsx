import React, {
    useState,
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';

// Секция «Транспорт»:
const VehicleFormSection = forwardRef(
    (
        {
            formData,
            updateFormData,
            truckTypesWithLoading,
            openFileDialog,
            AddPhotoButton,
            MultiTruckPhotoUploader,
        },
        ref
    ) => {
        const [errors, setErrors] = useState({
            truckName: '',
            transportType: '',
            loadingTypes: '',
            truckWeight: '',
            truckHeight: '',
            truckWidth: '',
            truckDepth: '',
        });

        const uploaderRef = useRef(null); // ← ref на аплоадер

        const allowedLoadingTypes = useMemo(() => {
            const item = truckTypesWithLoading?.find(
                (x) => x.name === formData.transportType
            );
            return item?.loadingTypes || [];
        }, [truckTypesWithLoading, formData.transportType]);

        const handleTextChange = (e) => {
            const { name, value } = e.target;
            updateFormData({ [name]: value });
            setErrors((prev) => ({ ...prev, [name]: '' }));
        };

        const handleNumberChange = (e) => {
            const { name, value } = e.target;
            updateFormData({ [name]: value });
            setErrors((prev) => ({ ...prev, [name]: '' }));
        };

        const handleTransportTypeChange = (e) => {
            const value = e.target.value;
            // очистим невалидные варианты загрузки при смене типа
            const nextSelected = (formData.loadingTypes || []).filter((x) =>
                (
                    truckTypesWithLoading.find((t) => t.name === value)?.loadingTypes ||
                    []
                ).includes(x)
            );
            updateFormData({
                transportType: value,
                loadingTypes: nextSelected,
            });
            setErrors((prev) => ({
                ...prev,
                transportType: '',
                loadingTypes: '',
            }));
        };

        const handleLoadingTypeToggle = (e) => {
            const { value, checked } = e.target;
            let next = Array.isArray(formData.loadingTypes)
                ? [...formData.loadingTypes]
                : [];
            if (checked) {
                if (!next.includes(value)) next.push(value);
            } else {
                next = next.filter((x) => x !== value);
            }
            updateFormData({ loadingTypes: next });
            setErrors((prev) => ({ ...prev, loadingTypes: '' }));
        };

        // Валидация, аналогично твоему RouteSection
        useImperativeHandle(ref, () => ({
            validateFields: () => {
                let isValid = true;
                const newErrors = {};

                if (!formData.truckName) {
                    newErrors.truckName = 'Укажите марку/название машины';
                    isValid = false;
                }
                if (!formData.transportType) {
                    newErrors.transportType = 'Выберите тип машины';
                    isValid = false;
                }
                if (
                    !Array.isArray(formData.loadingTypes) ||
                    formData.loadingTypes.length === 0
                ) {
                    newErrors.loadingTypes = 'Выберите хотя бы один вариант загрузки';
                    isValid = false;
                }

                const pos = (v) => v !== '' && !isNaN(Number(v)) && Number(v) > 0;
                if (!pos(formData.truckWeight)) {
                    newErrors.truckWeight = 'Укажите вес (> 0)';
                    isValid = false;
                }
                if (!pos(formData.truckHeight)) {
                    newErrors.truckHeight = 'Укажите высоту (> 0)';
                    isValid = false;
                }
                if (!pos(formData.truckWidth)) {
                    newErrors.truckWidth = 'Укажите ширину (> 0)';
                    isValid = false;
                }
                if (!pos(formData.truckDepth)) {
                    newErrors.truckDepth = 'Укажите глубину (> 0)';
                    isValid = false;
                }

                // чистим выбранные загрузки от недопустимых ключей на всякий случай
                const sanitized = (formData.loadingTypes || []).filter((x) =>
                    allowedLoadingTypes.includes(x)
                );
                if (sanitized.length !== (formData.loadingTypes || []).length) {
                    updateFormData({ loadingTypes: sanitized });
                }

                setErrors(newErrors);
                return isValid;
            },
            clearPhotos: () => {
                uploaderRef.current?.clear?.(); // ← вызов метода аплоадера
            },
            // опционально: открыть диалог выбора файлов снаружи
            openPhotoPicker: () => {
                uploaderRef.current?.open?.();
            },
        }));

        return (
            <div className="truck-corrector">
                <div className="truck-name-photo">
                    <div className="truck-name">
                        <input
                            type="text"
                            id="truckName"
                            name="truckName"
                            value={formData.truckName || ''}
                            onChange={handleTextChange}
                            placeholder="Марка машины"
                            className="create-transport-ad-input"
                        />
                    </div>
                    {AddPhotoButton && (
                        <AddPhotoButton openFileDialog={openFileDialog} />
                    )}
                </div>
                {errors.truckName && <p className="error-text">{errors.truckName}</p>}

                {MultiTruckPhotoUploader && (
                    <div>
                        <MultiTruckPhotoUploader
                            updateFormData={updateFormData}
                            openFileDialog={openFileDialog}
                            ref={uploaderRef} /* ← ref в аплоадер */
                        />
                    </div>
                )}

                {/* Тип */}
                <p className="new-ad-title without-bottom-margine">Тип:</p>
                <select
                    name="transportType"
                    value={formData.transportType || ''}
                    onChange={handleTransportTypeChange}
                    className="select-transport-type"
                >
                    <option value="" disabled>
                        Выберите
                    </option>
                    {truckTypesWithLoading?.map((transport) => (
                        <option key={transport.name} value={transport.name}>
                            {transport.name}
                        </option>
                    ))}
                </select>
                {errors.transportType && (
                    <p className="error-text">{errors.transportType}</p>
                )}

                {/* Варианты загрузки */}
                <p className="new-ad-title without-bottom-margine">Вариант загрузки:</p>
                {allowedLoadingTypes.map((loadingType) => (
                    <div key={loadingType} className="checkbox-item">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                id={`loadingType-${loadingType}`}
                                value={loadingType}
                                className="input-checkbox create-transport-ad-input create-transport-ad-checkbox"
                                onChange={handleLoadingTypeToggle}
                                checked={
                                    Array.isArray(formData.loadingTypes) &&
                                    formData.loadingTypes.includes(loadingType)
                                }
                            />
                            <span className="checkbox-title">{loadingType}</span>
                        </label>
                    </div>
                ))}
                {errors.loadingTypes && (
                    <p className="error-text">{errors.loadingTypes}</p>
                )}

                {/* Габариты */}
                <div className="truck-capacity">
                    <div className="weight-dimension">
                        <p className="new-ad-title weight-label">Вес (т):</p>
                        <input
                            className="weight-input create-transport-ad-input"
                            type="number"
                            name="truckWeight"
                            value={formData.truckWeight || ''}
                            onChange={handleNumberChange}
                            placeholder="Введите вес"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    {errors.truckWeight && (
                        <p className="error-text create-transport-ad">
                            {errors.truckWeight}
                        </p>
                    )}

                    <p className="new-ad-title without-bottom-margine">
                        Объем (м3) ВхШхГ:
                    </p>
                    <div className="dimensions">
                        <div className="value-dimension">
                            <div className="dimension-item">
                                <input
                                    type="number"
                                    name="truckHeight"
                                    value={formData.truckHeight || ''}
                                    onChange={handleNumberChange}
                                    placeholder="Высота"
                                    min="0"
                                    step="0.1"
                                    className="cta-truck-height create-transport-ad-input"
                                />
                            </div>
                            <div className="dimension-item">
                                <input
                                    type="number"
                                    name="truckWidth"
                                    value={formData.truckWidth || ''}
                                    onChange={handleNumberChange}
                                    placeholder="Ширина"
                                    min="0"
                                    step="0.1"
                                    className="cta-truck-width create-transport-ad-input"
                                />
                            </div>
                            <div className="dimension-item">
                                <input
                                    type="number"
                                    name="truckDepth"
                                    value={formData.truckDepth || ''}
                                    onChange={handleNumberChange}
                                    placeholder="Глубина"
                                    min="0"
                                    step="0.1"
                                    className="cta-truck-depth create-transport-ad-input"
                                />
                            </div>
                        </div>
                    </div>

                    {errors.truckHeight && (
                        <p className="error-text create-transport-ad">
                            {errors.truckHeight}
                        </p>
                    )}
                    {errors.truckWidth && (
                        <p className="error-text create-transport-ad">
                            {errors.truckWidth}
                        </p>
                    )}
                    {errors.truckDepth && (
                        <p className="error-text create-transport-ad">
                            {errors.truckDepth}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

export default VehicleFormSection;
