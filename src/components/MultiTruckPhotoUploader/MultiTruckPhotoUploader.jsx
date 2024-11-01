import React, { useState, useContext } from 'react';
import TransportAdContext from '../../hooks/TransportAdContext'; // Импортируем контекс
import './MultiTruckPhotoUploader.css';
import {
    FaCheckCircle,
    FaTrash,
    FaCamera,
    FaTrashAlt,
    FaImages,
    FaTimes,
} from 'react-icons/fa';

const MultiTruckPhotoUploader = ({ openFileDialog }) => {
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const { uploadPhotos } = useContext(TransportAdContext); // Метод загрузки фото из контекста

    //Меню удаления фото из выбранных / установка фото в качестве главного--->>>
    const [menuVisible, setMenuVisible] = useState(null);

    const makePrimary = (index) => {
        if (index !== 0) {
            const newPhotos = [...selectedPhotos];
            [newPhotos[0], newPhotos[index]] = [newPhotos[index], newPhotos[0]];
            setSelectedPhotos(newPhotos);
        }
        setMenuVisible(null);
    };

    const removePhoto = (index) => {
        const newPhotos = selectedPhotos.filter((_, i) => i !== index);
        setSelectedPhotos(newPhotos);
        setMenuVisible(null);
    };

    //<<<---
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
            {/* <div className='multi-photo-btn-add-photos'>
                <FaCamera
                    onClick={() =>
                        document.getElementById('file-upload').click()
                    }
                />
            </div> */}
            <div className='multi-photo-preview'>
                {selectedPhotos.map((file, index) => (
                    <div
                        key={index}
                        className='multi-photo-preview-item'
                        onMouseEnter={() => setMenuVisible(index)}
                        onMouseLeave={() => setMenuVisible(null)}
                    >
                        <img
                            src={URL.createObjectURL(file)}
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
