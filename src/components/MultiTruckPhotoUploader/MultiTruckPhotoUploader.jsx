import React, { useState, useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext';
import './MultiTruckPhotoUploader.css';
import { FaTimes } from 'react-icons/fa';

const MultiTruckPhotoUploader = ({ openFileDialog, updateFormData }) => {
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const { uploadPhotos } = useContext(TransportAdContext);
    const [menuVisible, setMenuVisible] = useState(null);

    const handleFileChange = (event) => {
        const { files } = event.target;

        if (files && files.length > 0) {
            const newTruckPhotoUrls = []; // Для хранения результатов FileReader
            const fileReaders = []; // Для отслеживания FileReader

            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                fileReaders.push(reader);

                reader.onloadend = () => {
                    newTruckPhotoUrls[index] = reader.result; // Сохраняем в порядке загрузки
                    if (
                        newTruckPhotoUrls.filter(Boolean).length ===
                        files.length
                    ) {
                        // Устанавливаем состояние, только когда все файлы загружены
                        setSelectedPhotos(newTruckPhotoUrls); // Для локального отображения
                        updateFormData({ truckPhotoUrls: newTruckPhotoUrls }); // Для отправки данных в formData

                        // console.log(newTruckPhotoUrls);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const makePrimary = (index) => {
        if (index !== 0) {
            const newPhotos = [...selectedPhotos];
            // Перемещаем выбранное фото на первое место
            [newPhotos[0], newPhotos[index]] = [newPhotos[index], newPhotos[0]];

            // Обновляем состояние выбранных фото
            setSelectedPhotos(newPhotos);

            // Обновляем данные в родительской компоненте
            updateFormData({ truckPhotoUrls: newPhotos });
        }
    };

    const removePhoto = (index) => {
        const newPhotos = selectedPhotos.filter((_, i) => i !== index);
        setSelectedPhotos(newPhotos);
        setMenuVisible(null);
        updateFormData({ truckPhotoUrls: newPhotos });
    };

    const handleUpload = async () => {
        await uploadPhotos(selectedPhotos);
        setSelectedPhotos([]);
    };

    return (
        <div className='multi-photo-uploader'>
            <input
                type='file'
                accept='image/*'
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id='file-upload'
            />
            <div className='multi-photo-preview'>
                {selectedPhotos.map((url, index) => (
                    <div
                        key={index}
                        className='multi-photo-preview-item'
                        onMouseEnter={() => setMenuVisible(index)}
                        onMouseLeave={() => setMenuVisible(null)}
                    >
                        <img
                            src={url}
                            alt='preview'
                            className='multi-photo-preview-image'
                            onClick={() => makePrimary(index)}
                        />
                        {menuVisible === index && (
                            <div
                                className='delete-photo-icon'
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
};

export default MultiTruckPhotoUploader;
