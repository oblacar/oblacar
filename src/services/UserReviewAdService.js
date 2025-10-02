// src/services/UserReviewAdService.js
import { ref, update, get, remove } from 'firebase/database';
import { db } from '../firebase';

// userReviewAds/{userId}/{adType}/{adId}: true
const PATH = (userId, adType) => `userReviewAds/${userId}/${adType}`;

/**
 * Добавить объявление в «отобранные варианты»
 * @param {string} userId
 * @param {string} adId
 * @param {'transport'|'cargo'} [adType='transport']
 */
const addReviewAd = async (userId, adId, adType = 'transport') => {
    if (!userId || !adId) throw new Error('addReviewAd: userId, adId иобязательны');
    const nodeRef = ref(db, PATH(userId, adType));
    await update(nodeRef, { [adId]: true });
};

/**
 * Удалить объявление из «отобранных вариантов»
 * @param {string} userId
 * @param {string} adId
 * @param {'transport'|'cargo'} [adType='transport']
 */
const removeReviewAd = async (userId, adId, adType = 'transport') => {
    if (!userId || !adId) throw new Error('removeReviewAd: userId и adId обязательны');
    const nodeRef = ref(db, `${PATH(userId, adType)}/${adId}`);
    await remove(nodeRef);
};

/**
 * Получить список id отмеченных объявлений для типа
 * @param {string} userId
 * @param {'transport'|'cargo'} [adType='transport']
 * @returns {Promise<string[]>}
 */
const getUserReviewAds = async (userId, adType = 'transport') => {
    if (!userId) return [];
    const nodeRef = ref(db, PATH(userId, adType));
    const snap = await get(nodeRef);
    return snap.exists() ? Object.keys(snap.val() || {}) : [];
};

const UserReviewAdService = {
    addReviewAd,
    removeReviewAd,
    getUserReviewAds,
};

export default UserReviewAdService;
