import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { storage } from '../firebase'; // Импортируйте ваш объект storage

//path='truckPhotos'
export const uploadPhoto = async (path, file) => {
    console.log('в аплоаде до', file); // Проверяем структуру file
    if (!file || !(file instanceof File)) {
        console.error('Некорректный файл для загрузки:', file);
        return null;
    }

    console.log('в аплоаде после');

    const photoRef = storageRef(storage, `${path}/${file.name}`); // создаем уникальную ссылку для фото

    await uploadBytes(photoRef, file); // загружаем фото

    const photoUrl = await getDownloadURL(photoRef); // получаем ссылку на загруженное фото
    return photoUrl; // возвращаем ссылку
};

// Здесь можно добавлять другие полезные функции

// Функция для конвертации base64-строки в объект File
export const base64ToFile = (base64String, fileName) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
};

// Функция для добавления пробелов между тысячами
export const formatNumber = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Обрезаем по третий знак после запятой:
export const cutNumber = (num) => {
    // Умножение трех чисел
    const result = num; // Замените на ваше умножение

    // Обрезаем число до трех знаков после запятой
    const trimmed = Math.abs(result) < 1e-10 ? 0 : Number(result.toFixed(3));

    // Форматируем число с запятой
    return trimmed.toString().replace('.', ',');
};
