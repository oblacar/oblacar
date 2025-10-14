// src/services/withRefs/CargoAdServiceWithRefs.js
import BaseCargoAdService from '../CargoAdService';
import { AdsRefsService } from '../../admin/services/AdsRefsService';

/**
 * Обёртка над CargoAdService:
 *  - create: вызывает initAd(adId, {type:'cargo', ownerId})
 *  - deleteById: сначала каскад по adsRefs, потом базовое удаление
 * Остальные методы проксируются без изменений.
 */
const CargoAdServiceWithRefs = {
    ...BaseCargoAdService,

    async create(adData = {}) {
        const ad = await BaseCargoAdService.create(adData);
        try {
            await AdsRefsService.initAd(ad.adId, {
                type: 'cargo',
                ownerId: ad.ownerId || ad.owner?.id || null,
            });
        } catch {}
        return ad;
    },

    async deleteById(adId) {
        try {
            await AdsRefsService.cascadeDeleteByRefs(adId);
        } catch {}
        return BaseCargoAdService.deleteById(adId);
    },
};

export default CargoAdServiceWithRefs;
