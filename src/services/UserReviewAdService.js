import { ref, update, get, remove } from 'firebase/database';
import { db } from '../firebase';

const UserReviewAdService = {
    addReviewAd: async (userId, adId) => {
        const reviewAdRef = ref(db, `userReviewAds/${userId}/reviewAds`);
        try {
            // Добавляем adId к списку объявлений
            await update(reviewAdRef, {
                [adId]: true,
            });
        } catch (error) {
            console.error('Error adding review ad:', error);
        }
    },

    removeReviewAd: async (userId, adId) => {
        const reviewAdRef = ref(
            db,
            `userReviewAds/${userId}/reviewAds/${adId}`
        );
        try {
            // Удаляем adId из списка
            await remove(reviewAdRef);
        } catch (error) {
            console.error('Error removing review ad:', error);
        }
    },

    getUserReviewAds: async (userId) => {
        const reviewAdRef = ref(db, `userReviewAds/${userId}/reviewAds`);
        try {
            const snapshot = await get(reviewAdRef);
            if (snapshot.exists()) {
                return Object.keys(snapshot.val());
            }
            return [];
        } catch (error) {
            console.error('Error fetching user review ads:', error);
            return [];
        }
    },
};

export default UserReviewAdService;
