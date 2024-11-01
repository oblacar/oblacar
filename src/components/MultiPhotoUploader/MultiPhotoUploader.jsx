import React, { useState, useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext'; // Импортируем контекс
import './MultiPhotoUploader.css';

const MultiPhotoUploader = () => {
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const { uploadPhotos } = useContext(TransportAdContext); // Метод загрузки фото из контекста

    const handleFileChange = (event) => {
        setSelectedPhotos([...event.target.files]); // Обновляем список выбранных файлов
    };

    const handleUpload = async () => {
        await uploadPhotos(selectedPhotos);
        setSelectedPhotos([]); // Очистка после загрузки
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
            <button
                onClick={() => document.getElementById('file-upload').click()}
            >
                Выбрать фото
            </button>
            <button
                onClick={handleUpload}
                disabled={!selectedPhotos.length}
            >
                Загрузить
            </button>
            <div className='multi-photo-preview'>
                {selectedPhotos.map((file, index) => (
                    <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt='preview'
                        className='multi-photo-preview-image'
                    />
                ))}
            </div>
        </div>
    );
};

export default MultiPhotoUploader;
