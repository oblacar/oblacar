// src/admin/services/AdsRefsService.js
import { ref, update, get } from 'firebase/database';
import { db } from '../../firebase';

const setAt = (obj, path, value) => {
    obj[path] = value;
};

export const AdsRefsService = {
    // Создаёт «карточку» ссылок для объявления с полезной мета-информацией
    async initAd(adId, meta = {}) {
        if (!adId) return;
        const updates = {};
        setAt(updates, `adsRefs/${adId}/meta`, {
            type: meta.type || null, // 'cargo' | 'transport'
            ownerId: meta.ownerId || null, // uid владельца
            createdAt: Date.now(),
        });
        await update(ref(db), updates);
    },

    async addRef(adId, bucket, key) {
        const updates = {};
        setAt(updates, `adsRefs/${adId}/${bucket}/${key}`, true);
        await update(ref(db), updates);
    },

    async removeRef(adId, bucket, key) {
        const updates = {};
        setAt(updates, `adsRefs/${adId}/${bucket}/${key}`, null);
        await update(ref(db), updates);
    },

    // Удаляет все связанные записи по refs (и сам узел adsRefs/{adId})
    async cascadeDeleteByRefs(adId) {
        if (!adId) return;
        const refsSnap = await get(ref(db, `adsRefs/${adId}`));
        const refs = refsSnap.exists() ? refsSnap.val() : null;

        const updates = {};

        // cargoRequests
        if (refs?.cargoRequests) {
            Object.keys(refs.cargoRequests).forEach((ownerId) => {
                setAt(updates, `cargoRequests/${ownerId}/${adId}`, null);
            });
        }
        // cargoRequestsSent
        if (refs?.cargoRequestsSent) {
            Object.keys(refs.cargoRequestsSent).forEach((driverId) => {
                setAt(updates, `cargoRequestsSent/${driverId}/${adId}`, null);
            });
        }
        // conversations (и желательно messages хранить под conversationId)
        if (refs?.conversations) {
            Object.keys(refs.conversations).forEach((convId) => {
                setAt(updates, `conversations/${convId}`, null);
                // Если messages плоские — тут лучше иметь отдельный индекс messagesByConversation.
                // Если уже messages/{convId}/{msgId} — просто:
                setAt(updates, `messages/${convId}`, null);
            });
        }
        // транспортировки/заявки — при наличии
        if (refs?.transportationRequests) {
            Object.keys(refs.transportationRequests).forEach((reqId) => {
                setAt(updates, `transportationRequests/${reqId}`, null);
            });
        }
        if (refs?.transportationRequestsSent) {
            Object.keys(refs.transportationRequestsSent).forEach((reqId) => {
                setAt(updates, `transportationRequestsSent/${reqId}`, null);
            });
        }
        if (refs?.transportations) {
            Object.keys(refs.transportations).forEach((id) => {
                setAt(updates, `transportations/${id}`, null);
            });
        }

        // удалить сам индекс
        setAt(updates, `adsRefs/${adId}`, null);

        await update(ref(db), updates);
    },
};
