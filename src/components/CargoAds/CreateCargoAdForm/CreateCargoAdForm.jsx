// src/components/CargoAd/CreateCargoAdForm.jsx
import React, {
    useMemo,
    useState,
    forwardRef,
    useImperativeHandle,
    useRef,
    useEffect,
    useContext,
} from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import CitySearch from '../../common/CitySearch/CitySearch';

import PackagingMultiSelect from '../PackagingPicker/PackagingMultiSelect';
import { PACKAGING_OPTIONS } from '../../../constants/cargoPackagingOptions';

import './CreateCargoAdForm.css';
import UserContext from '../../../hooks/UserContext';

const CreateCargoAdForm = forwardRef(
    (
        {
            // onSubmit,
            // onSubmit — коллбэк, который форма может вызывать при сохранении (передать наружу собранные данные). В текущей версии мы сохраняем из страницы (через ref.validate() + getFormData()), поэтому onSubmit не используется. Оставлен «на будущее/совместимость». Можно смело убрать, если не планируешь вызывать submit из самой формы.
            // layout = 'stack',
            // layout = 'stack' — настройка раскладки. Раньше управлял видом (stack/columns). В актуальной разметке мы жёстко используем двухколоночный грид (accf__grid--2col), т.е. layout сейчас не влияет. Либо удаляй проп, либо верни логику, например:
            formData: externalFormData,
            updateFormData: externalUpdateFormData,
        },
        ref
    ) => {
        const { user: profile, isUserLoaded } = useContext(UserContext) || {};

        // если внешние пропы не переданы — форма работает как раньше (локальный state)
        const [innerFormData, setInnerFormData] = useState(() => ({
            createdAt: '',
            ownerId: '',
            ownerName: '',
            ownerPhotoUrl: '',
            ownerRating: '',
            departureCity: '',
            destinationCity: '',
            pickupDate: '',
            deliveryDate: '',
            price: '',
            paymentUnit: 'руб',
            readyToNegotiate: true,
            title: '',
            cargoType: '',
            description: '',
            photos: [],
            weightTons: '',
            dimensionsMeters: { height: '', width: '', depth: '' },
            quantity: '',
            packagingType: '',
            isFragile: false,
            isStackable: false,
            adrClass: '',
            temperature: { mode: 'ambient', minC: '', maxC: '' },
            preferredLoadingTypes: [],
        }));

        // ЕДИНАЯ точка правды — до useEffect!
        const formData = externalFormData ?? innerFormData;
        const updateFormData = (patch) => {
            if (externalUpdateFormData) externalUpdateFormData(patch);
            else setInnerFormData(prev => ({ ...prev, ...patch }));
        };

        useEffect(() => {
            if (!isUserLoaded || !profile) return;
            const today = new Date().toLocaleDateString('ru-RU');
            // формируем патч только для пустых полей
            const patch = {};
            if (!formData.createdAt) patch.createdAt = today;
            if (!formData.ownerId && profile.userId)
                patch.ownerId = profile.userId;
            if (!formData.ownerName && (profile.userName || profile.userEmail))
                patch.ownerName = profile.userName || profile.userEmail || 'Пользователь';
            if (!formData.ownerPhotoUrl && profile.userPhoto)
                patch.ownerPhotoUrl = profile.userPhoto;
            if (Object.keys(patch).length > 0) {
                updateFormData(patch); // это обновит либо внешний стейт, либо локальный
            }
            // завязка на profile и нужные поля из formData; так мы избегаем лишних перерендеров
        }, [isUserLoaded, profile, formData.createdAt, formData.ownerId, formData.ownerName, formData.ownerPhotoUrl]);

        const updateDims = (name, value) =>
            updateFormData({
                dimensionsMeters: {
                    ...(formData.dimensionsMeters || {}),
                    [name]: value,
                },
            });

        const [errors, setErrors] = useState({});
        const [showConfirm, setShowConfirm] = useState(false); // можно оставить, если используешь внутри
        const [saving, setSaving] = useState(false);

        const cargoTypes = useMemo(
            () => [
                'строительные материалы',
                'мебель',
                'продукты',
                'промтовары',
                'насыпной',
                'наливной',
                'ADR',
                'прочее',
            ],
            []
        );
        const loadingTypesAll = useMemo(
            () => [
                'верхняя',
                'боковая',
                'задняя',
                'гидроборт',
                'аппарели',
                'без ворот',
            ],
            []
        );
        const temperatureModes = ['ambient', 'chilled', 'frozen'];

        // const updateFormData = (patch) =>
        //     setFormData((prev) => ({ ...prev, ...patch }));

        // const updateDims = (name, value) =>
        //     setFormData((prev) => ({
        //         ...prev,
        //         dimensionsMeters: { ...prev.dimensionsMeters, [name]: value },
        //     }));

        const toggleLoadingType = (val) => {
            const arr = Array.isArray(formData.preferredLoadingTypes)
                ? [...formData.preferredLoadingTypes]
                : [];
            const i = arr.indexOf(val);
            if (i === -1) arr.push(val);
            else arr.splice(i, 1);
            updateFormData({ preferredLoadingTypes: arr });
        };

        // главное — используй `formData` и `updateFormData` вместо локальных имён

        const validate = () => {
            const e = {};
            const pos = (v) => v !== '' && !isNaN(Number(v)) && Number(v) > 0;

            if (!formData.departureCity)
                e.departureCity = 'Укажите пункт отправления';
            if (!formData.destinationCity)
                e.destinationCity = 'Укажите пункт назначения';
            if (!formData.pickupDate)
                e.pickupDate = 'Укажите дату готовности к отгрузке';

            if (!formData.title?.trim())
                e.title = 'Укажите краткое название груза';
            if (!formData.cargoType) e.cargoType = 'Выберите тип груза';
            if (!pos(formData.weightTons))
                e.weightTons = 'Укажите общий вес (> 0)';

            setErrors(e);
            return Object.keys(e).length === 0;
        };

        // Экспортируем методы наружу
        useImperativeHandle(ref, () => ({
            validate,
            getFormData: () => formData,
            reset: () => {
                const empty = {
                    departureCity: '',
                    destinationCity: '',
                    pickupDate: '',
                    deliveryDate: '',
                    price: '',
                    paymentUnit: 'руб',
                    readyToNegotiate: true,
                    title: '',
                    cargoType: '',
                    description: '',
                    photos: [],
                    weightTons: '',
                    dimensionsMeters: { height: '', width: '', depth: '' },
                    quantity: '',
                    packagingType: '',
                    isFragile: false,
                    isStackable: false,
                    adrClass: '',
                    temperature: { mode: 'ambient', minC: '', maxC: '' },
                    preferredLoadingTypes: [],
                };
                if (externalUpdateFormData) {
                    externalUpdateFormData(empty);
                } else {
                    setInnerFormData(empty);
                }
                setErrors({});
            },
        }));

        // Фото загрузка:
        const fileInputRef = useRef(null);

        // ограничители (можно подкрутить)
        const MAX_FILES = 12;
        const MAX_SIZE_MB = 8;

        // конвертация File -> dataURL
        const fileToDataURL = (file) =>
            new Promise((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = () => resolve(fr.result);
                fr.onerror = reject;
                fr.readAsDataURL(file);
            });

        const handlePickFilesClick = () => fileInputRef.current?.click();

        const handleFilesSelected = async (e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;

            // отсекаем лишнее и большие файлы
            const existing = Array.isArray(formData.photos) ? formData.photos : [];
            const room = Math.max(MAX_FILES - existing.length, 0);
            const picked = files.slice(0, room).filter(f => (f.size / 1024 / 1024) <= MAX_SIZE_MB);

            if (picked.length === 0) return;

            // читаем в dataURL
            const dataUrls = await Promise.all(picked.map(file => fileToDataURL(file)));

            const next = [
                ...existing,
                ...dataUrls.map((src) => ({ id: crypto.randomUUID?.() || String(Math.random()), src }))
            ];

            updateFormData({ photos: next });
            // сбрасываем input, чтобы повторно выбирать те же файлы при желании
            e.target.value = '';
        };

        const removePhoto = (id) => {
            const arr = Array.isArray(formData.photos) ? formData.photos : [];
            updateFormData({ photos: arr.filter(p => p.id !== id) });
        };


        return (
            <div className='accf'>
                {/* ДВЕ КОЛОНКИ: левая (1/3) = Маршрут + Стоимость, правая (2/3) = Груз */}
                <div className='accf__grid accf__grid--2col'>
                    {/* ===== ЛЕВАЯ КОЛОНКА ===== */}
                    <div className='accf__col accf__col--left'>
                        {/* === 1) Маршрут === */}
                        <section className='accf__card'>
                            <div className='accf__section-title-container'>
                                <h3 className='accf__section-title'>Маршрут</h3>
                            </div>
                            <p className='accf__section-hint'>
                                Когда и где груз готов к перевозке, и куда его
                                доставить.
                            </p>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Дата готовности к отгрузке
                                </label>
                                <DatePicker
                                    selected={
                                        formData.pickupDate
                                            ? new Date(
                                                formData.pickupDate
                                                    .split('.')
                                                    .reverse()
                                                    .join('-')
                                            )
                                            : null
                                    }
                                    onChange={(date) => {
                                        const formatted = date
                                            ? date.toLocaleDateString('ru-RU')
                                            : '';
                                        updateFormData({
                                            pickupDate: formatted,
                                            availabilityFrom: formatted, // ← добавь это
                                        });
                                        setErrors((p) => ({
                                            ...p,
                                            pickupDate: '',
                                        }));
                                    }}
                                    dateFormat='dd.MM.yyyy'
                                    placeholderText='дд.мм.гггг'
                                    className='accf__input accf__date-input'
                                />
                                {errors.pickupDate && (
                                    <p className='accf__error'>
                                        {errors.pickupDate}
                                    </p>
                                )}
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Пункт отправления
                                </label>
                                <CitySearch
                                    onCitySelected={(city) => {
                                        updateFormData({ departureCity: city });
                                        setErrors((p) => ({
                                            ...p,
                                            departureCity: '',
                                        }));
                                    }}
                                    inputClassName='accf__input accf__input--city'
                                    placeholder='Например, Москва'
                                />
                                {errors.departureCity && (
                                    <p className='accf__error'>
                                        {errors.departureCity}
                                    </p>
                                )}
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Пункт назначения
                                </label>
                                <CitySearch
                                    onCitySelected={(city) => {
                                        updateFormData({
                                            destinationCity: city,
                                        });
                                        setErrors((p) => ({
                                            ...p,
                                            destinationCity: '',
                                        }));
                                    }}
                                    inputClassName='accf__input accf__input--city'
                                    placeholder='Например, Санкт-Петербург'
                                />
                                {errors.destinationCity && (
                                    <p className='accf__error'>
                                        {errors.destinationCity}
                                    </p>
                                )}
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Желаемая дата доставки (опц.)
                                </label>
                                <DatePicker
                                    selected={
                                        formData.deliveryDate
                                            ? new Date(
                                                formData.deliveryDate
                                                    .split('.')
                                                    .reverse()
                                                    .join('-')
                                            )
                                            : null
                                    }
                                    onChange={(date) => {
                                        const formatted = date
                                            ? date.toLocaleDateString('ru-RU')
                                            : '';
                                        updateFormData({
                                            deliveryDate: formatted,
                                            availabilityTo: formatted, // ← и это
                                        });
                                    }}
                                    dateFormat='dd.MM.yyyy'
                                    placeholderText='дд.мм.гггг'
                                    className='accf__input accf__date-input'
                                />
                            </div>
                        </section>

                        {/* === 2) Стоимость === */}
                        <section className='accf__card'>
                            <div className='accf__section-title-container'>
                                <h3 className='accf__section-title'>
                                    Стоимость
                                </h3>
                            </div>

                            <div className='accf__row accf__row--price'>
                                <input
                                    type='number'
                                    placeholder='Цена (опц.)'
                                    min='0'
                                    step='1'
                                    value={formData.price}
                                    onChange={(e) =>
                                        updateFormData({
                                            price: e.target.value,
                                        })
                                    }
                                    className='accf__input'
                                />
                                <select
                                    value={formData.paymentUnit}
                                    onChange={(e) =>
                                        updateFormData({
                                            paymentUnit: e.target.value,
                                        })
                                    }
                                    className='accf__select'
                                >
                                    <option value='руб'>руб</option>
                                    <option value='₽'>₽</option>
                                </select>
                            </div>

                            <label className='accf__checkbox'>
                                <input
                                    type='checkbox'
                                    checked={formData.readyToNegotiate}
                                    onChange={(e) =>
                                        updateFormData({
                                            readyToNegotiate: e.target.checked,
                                        })
                                    }
                                />
                                <span>Торг уместен</span>
                            </label>
                        </section>
                    </div>

                    {/* ===== ПРАВАЯ КОЛОНКА ===== */}
                    <div className='accf__col accf__col--right'>
                        {/* === 3) Груз === */}
                        <section className='accf__card'>
                            <div className='accf__section-title-container'>
                                <h3 className='accf__section-title'>Груз</h3>
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Короткое название
                                </label>
                                <input
                                    type='text'
                                    name='title'
                                    placeholder='Например, 12 паллет плитки'
                                    value={formData.title}
                                    onChange={(e) => {
                                        updateFormData({
                                            title: e.target.value,
                                        });
                                        setErrors((p) => ({ ...p, title: '' }));
                                    }}
                                    className='accf__input'
                                />
                                {errors.title && (
                                    <p className='accf__error'>
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>Тип груза</label>
                                <select
                                    name='cargoType'
                                    value={formData.cargoType}
                                    onChange={(e) => {
                                        updateFormData({
                                            cargoType: e.target.value,
                                        });
                                        setErrors((p) => ({
                                            ...p,
                                            cargoType: '',
                                        }));
                                    }}
                                    className='accf__select'
                                >
                                    <option
                                        value=''
                                        disabled
                                    >
                                        Выберите
                                    </option>
                                    {cargoTypes.map((ct) => (
                                        <option
                                            key={ct}
                                            value={ct}
                                        >
                                            {ct}
                                        </option>
                                    ))}
                                </select>
                                {errors.cargoType && (
                                    <p className='accf__error'>
                                        {errors.cargoType}
                                    </p>
                                )}
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Описание (опц.)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder='Любые доп. детали'
                                    value={formData.description}
                                    onChange={(e) =>
                                        updateFormData({
                                            description: e.target.value,
                                        })
                                    }
                                    className='accf__textarea'
                                />
                            </div>

                            <div className="accf__field">
                                <label className="accf__label">Фотографии груза</label>

                                <div className="accf__photos">
                                    <button
                                        type="button"
                                        className="accf__photo-add"
                                        onClick={handlePickFilesClick}
                                    >
                                        + Добавить фото
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFilesSelected}
                                        className="accf__file-input"
                                    />

                                    {Array.isArray(formData.photos) && formData.photos.length > 0 && (
                                        <div className="accf__thumbs">
                                            {formData.photos.map(p => (
                                                <div className="accf__thumb" key={p.id}>
                                                    <img src={p.src} alt="cargo" />
                                                    <button
                                                        type="button"
                                                        className="accf__thumb-del"
                                                        onClick={() => removePhoto(p.id)}
                                                        aria-label="Удалить фото"
                                                        title="Удалить"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="accf__hint">
                                        до {MAX_FILES} фото, не более {MAX_SIZE_MB} МБ каждое
                                    </div>
                                </div>
                            </div>


                            <div className='accf__field'>
                                <label className='accf__label'>Вес, т</label>
                                <input
                                    className='accf__input'
                                    type='number'
                                    name='weightTons'
                                    placeholder='Введите вес'
                                    min='0'
                                    step='0.01'
                                    value={formData.weightTons}
                                    onChange={(e) => {
                                        updateFormData({
                                            weightTons: e.target.value,
                                        });
                                        setErrors((p) => ({
                                            ...p,
                                            weightTons: '',
                                        }));
                                    }}
                                />
                                {errors.weightTons && (
                                    <p className='accf__error'>
                                        {errors.weightTons}
                                    </p>
                                )}
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Общие габариты (м) В×Ш×Г
                                </label>
                                <div className='accf__row accf__row--dims'>
                                    <input
                                        type='number'
                                        placeholder='Высота'
                                        min='0'
                                        step='0.01'
                                        value={formData.dimensionsMeters.height}
                                        onChange={(e) =>
                                            updateDims('height', e.target.value)
                                        }
                                        className='accf__input'
                                    />
                                    <input
                                        type='number'
                                        placeholder='Ширина'
                                        min='0'
                                        step='0.01'
                                        value={formData.dimensionsMeters.width}
                                        onChange={(e) =>
                                            updateDims('width', e.target.value)
                                        }
                                        className='accf__input'
                                    />
                                    <input
                                        type='number'
                                        placeholder='Глубина'
                                        min='0'
                                        step='0.01'
                                        value={formData.dimensionsMeters.depth}
                                        onChange={(e) =>
                                            updateDims('depth', e.target.value)
                                        }
                                        className='accf__input'
                                    />
                                </div>
                            </div>

                            <div className='accf-break-line accf__row accf__row--wrap'>
                                <label className='accf__label'>
                                    Количество мест
                                </label>
                                <input
                                    type='number'
                                    placeholder='Количество мест'
                                    min='0'
                                    step='1'
                                    value={formData.quantity}
                                    onChange={(e) =>
                                        updateFormData({
                                            quantity: e.target.value,
                                        })
                                    }
                                    className='accf__input'
                                />
                            </div>
                            <div className='accf__row accf__row--wrap'>
                                <div className='accf__field'>
                                    <label className='accf__label'>
                                        Тип упаковки
                                    </label>
                                    <PackagingMultiSelect
                                        options={PACKAGING_OPTIONS}
                                        value={formData.packagingTypes ?? []}
                                        onChange={(next) =>
                                            updateFormData({ packagingTypes: next })
                                            // console.log(next)
                                        }
                                        placeholder='Выбрать упаковку'
                                    />
                                </div>
                            </div>

                            <div className='accf-break-line accf__row accf__row--wrap'>
                                <label className='accf__checkbox'>
                                    <input
                                        type='checkbox'
                                        checked={formData.isFragile}
                                        onChange={(e) =>
                                            updateFormData({
                                                isFragile: e.target.checked,
                                            })
                                        }
                                    />
                                    <span>Хрупкий</span>
                                </label>
                                <label className='accf__checkbox'>
                                    <input
                                        type='checkbox'
                                        checked={formData.isStackable}
                                        onChange={(e) =>
                                            updateFormData({
                                                isStackable: e.target.checked,
                                            })
                                        }
                                    />
                                    <span>Штабелируемый</span>
                                </label>
                                <input
                                    type='text'
                                    placeholder='ADR класс (опц.)'
                                    value={formData.adrClass}
                                    onChange={(e) =>
                                        updateFormData({
                                            adrClass: e.target.value,
                                        })
                                    }
                                    className='accf__input accf__input--short'
                                />
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Температура
                                </label>
                                <div className='accf__row accf__row--wrap'>
                                    <select
                                        value={formData.temperature.mode}
                                        onChange={(e) =>
                                            updateFormData({
                                                temperature: {
                                                    ...formData.temperature,
                                                    mode: e.target.value,
                                                },
                                            })
                                        }
                                        className='accf__select'
                                    >
                                        {temperatureModes.map((m) => (
                                            <option
                                                key={m}
                                                value={m}
                                            >
                                                {m === 'ambient'
                                                    ? 'Обычная'
                                                    : m === 'chilled'
                                                        ? 'Охлажд.'
                                                        : 'Заморозка'}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type='number'
                                        placeholder='Мин °C'
                                        value={formData.temperature.minC}
                                        onChange={(e) =>
                                            updateFormData({
                                                temperature: {
                                                    ...formData.temperature,
                                                    minC: e.target.value,
                                                },
                                            })
                                        }
                                        className='accf__input accf__input--short'
                                    />
                                    <input
                                        type='number'
                                        placeholder='Макс °C'
                                        value={formData.temperature.maxC}
                                        onChange={(e) =>
                                            updateFormData({
                                                temperature: {
                                                    ...formData.temperature,
                                                    maxC: e.target.value,
                                                },
                                            })
                                        }
                                        className='accf__input accf__input--short'
                                    />
                                </div>
                            </div>

                            <div className='accf__field'>
                                <label className='accf__label'>
                                    Предпочтительные варианты загрузки
                                </label>
                                <div className='accf__tags'>
                                    {loadingTypesAll.map((t) => (
                                        <label
                                            key={t}
                                            className='accf__checkbox accf__checkbox--pill'
                                        >
                                            <input
                                                type='checkbox'
                                                checked={formData.preferredLoadingTypes.includes(
                                                    t
                                                )}
                                                onChange={() =>
                                                    toggleLoadingType(t)
                                                }
                                            />
                                            <span>{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }
);

export default CreateCargoAdForm;

/* ===== helpers ===== */
function getInitialForm() {
    return {
        // Маршрут
        departureCity: '',
        destinationCity: '',
        pickupDate: '', // dd.MM.yyyy
        deliveryDate: '', // dd.MM.yyyy (опц.)
        // Стоимость
        price: '',
        paymentUnit: 'руб',
        readyToNegotiate: true,
        // Груз
        title: '',
        cargoType: '',
        description: '',
        photos: [], // base64 строки; сервис позже заменит на URL из Storage
        weightTons: '',
        dimensionsMeters: { height: '', width: '', depth: '' },
        quantity: '',
        packagingType: '',
        isFragile: false,
        isStackable: false,
        adrClass: '',
        temperature: { mode: 'ambient', minC: '', maxC: '' },
        preferredLoadingTypes: [],
    };
}
