import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { storage } from '../firebase'; // Импортируйте ваш объект storage

//path='truckPhotos'
export const uploadPhoto = async (path, file) => {
    if (!file) return null;

    const photoRef = storageRef(storage, `${path}/${file.name}`); // создаем уникальную ссылку для фото

    await uploadBytes(photoRef, file); // загружаем фото

    const photoUrl = await getDownloadURL(photoRef); // получаем ссылку на загруженное фото
    return photoUrl; // возвращаем ссылку
};

// Здесь можно добавлять другие полезные функции
// Функция для добавления пробелов между тысячами
export const formatNumber = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
