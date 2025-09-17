import React, {
    useState, useContext, useRef,
    forwardRef, useImperativeHandle
} from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import './MultiTruckPhotoUploader.css';
import { FaTimes } from 'react-icons/fa';

const MultiTruckPhotoUploader = forwardRef(({
    openFileDialog,          // оставим для совместимости (опц.)
    updateFormData,
}, ref) => {
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const { uploadPhotos } = useContext(TransportAdContext); // если используешь
    const [menuVisible, setMenuVisible] = useState(null);

    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
        /** Очистить превью и синхронизировать с формой */
        clear() {
            setSelectedPhotos([]);
            setMenuVisible(null);
            updateFormData?.({ truckPhotoUrls: [] });
            if (inputRef.current) {
                // очистить <input type="file">, чтобы можно было выбрать те же файлы заново
                inputRef.current.value = '';
            }
        },
        /** Открыть диалог выбора файлов */
        open() {
            if (typeof openFileDialog === 'function') {
                openFileDialog(); // твоя старая функция, если передана
            } else {
                inputRef.current?.click();
            }
        }
    }), [openFileDialog, updateFormData]);

    const handleFileChange = (event) => {
        const { files } = event.target;
        if (!files || !files.length) return;

        const newTruckPhotoUrls = [];
        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newTruckPhotoUrls[index] = reader.result; // dataURL
                if (newTruckPhotoUrls.filter(Boolean).length === files.length) {
                    setSelectedPhotos(newTruckPhotoUrls);
                    updateFormData?.({ truckPhotoUrls: newTruckPhotoUrls });
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const makePrimary = (index) => {
        if (index === 0) return;
        const newPhotos = [...selectedPhotos];
        [newPhotos[0], newPhotos[index]] = [newPhotos[index], newPhotos[0]];
        setSelectedPhotos(newPhotos);
        updateFormData?.({ truckPhotoUrls: newPhotos });
    };

    const removePhoto = (index) => {
        const newPhotos = selectedPhotos.filter((_, i) => i !== index);
        setSelectedPhotos(newPhotos);
        setMenuVisible(null);
        updateFormData?.({ truckPhotoUrls: newPhotos });
    };

    // опционально — если когда-то будешь вызывать аплоад отсюда
    const handleUpload = async () => {
        await uploadPhotos?.(selectedPhotos);
        setSelectedPhotos([]);
        updateFormData?.({ truckPhotoUrls: [] });
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="multi-photo-uploader">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"  // оставлен для совместимости с твоим openFileDialog
            />

            <div className="multi-photo-preview">
                {selectedPhotos.map((url, index) => (
                    <div
                        key={index}
                        className="multi-photo-preview-item"
                        onMouseEnter={() => setMenuVisible(index)}
                        onMouseLeave={() => setMenuVisible(null)}
                    >
                        <img
                            src={url}
                            alt="preview"
                            className="multi-photo-preview-image"
                            onClick={() => makePrimary(index)}
                        />
                        {menuVisible === index && (
                            <div
                                className="delete-photo-icon"
                                onClick={() => removePhoto(index)}
                            >
                                <FaTimes />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default MultiTruckPhotoUploader;

// Как вызывать из страницы
// // NewVehiclePage.jsx
// import React, { useRef } from 'react';
// // ...
// const uploaderRef = useRef(null);

// // ...
// <MultiTruckPhotoUploader
//   ref={uploaderRef}
//   updateFormData={updateFormData}
// />

// // После успешного сохранения:
// uploaderRef.current?.clear();

// // Если хочешь открыть диалог выбора файлов «снаружи»:
// uploaderRef.current?.open();

// Плюс: 
// можешь больше не передавать в форму openFileDialog 
// и не искать document.getElementById('file-upload'): 
// используешь uploaderRef.current.open() там, где нужна кнопка «Выбрать фото».
