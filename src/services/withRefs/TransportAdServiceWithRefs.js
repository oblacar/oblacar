// src/services/withRefs/TransportAdServiceWithRefs.js
import BaseTransportAdService from '../TransportAdService';
import { AdsRefsService } from '../../admin/services/AdsRefsService';

/**
 * Обёртка над TransportAdService:
 *  - createAd: initAd(adId, {type:'transport', ownerId})
 *  - deleteAd: каскад по adsRefs -> базовое удаление
 */
const TransportAdServiceWithRefs = {
    ...BaseTransportAdService,

    async createAd(adData) {
        const ad = await BaseTransportAdService.createAd(adData);
        try {
            await AdsRefsService.initAd(ad.adId, {
                type: 'transport',
                ownerId: ad.ownerId || ad.owner?.id || null,
            });
        } catch {}
        return ad;
    },

    async deleteAd(adId) {
        try {
            await AdsRefsService.cascadeDeleteByRefs(adId);
        } catch {}
        return BaseTransportAdService.deleteAd(adId);
    },
};

export default TransportAdServiceWithRefs;
