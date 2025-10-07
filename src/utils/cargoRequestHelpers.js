// utils/cargoRequestHelpers.js
export const toDMY = (d) => {
    const dt = d instanceof Date ? d : new Date(d || Date.now());
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

export const asNumber = (v, def = 0) =>
    typeof v === 'number' && !Number.isNaN(v) ? v : def;

export const buildDriverFromUser = (u) => ({
    id: u?.userId || u?.id || '',
    name: u?.userName || u?.displayName || u?.name || '',
    photourl: u?.profilePhotoUrl || u?.photoUrl || u?.photoURL || '',
    contact: u?.phone || u?.phoneNumber || u?.userPhone || u?.contact || '',
});

// Нормализует СЫРОЕ объявление груза → экземпляр CargoRequestMainData
import CargoRequestMainData from '../../entities/Cargo/CargoRequestMainData';

export const makeCargoMainData = (raw) => {
    if (!raw) return null;
    const adId = raw.adId ?? raw.id ?? null;
    const ownerId = raw.ownerId ?? raw.owner?.id ?? '';

    const departureCity =
        raw.departureCity ??
        raw.locationFrom ??
        raw.routeFrom ??
        '';

    const destinationCity =
        raw.destinationCity ??
        raw.locationTo ??
        raw.routeTo ??
        '';

    const date =
        raw.pickupDate ??
        raw.date ??
        '';

    const price =
        typeof raw.price === 'number'
            ? raw.price
            : (raw.priceAndPaymentUnit?.price ?? 0);

    const paymentUnit =
        raw.paymentUnit ??
        raw.priceAndPaymentUnit?.unit ??
        raw.currency ??
        '';

    const owner = {
        id: ownerId,
        name: raw.owner?.name ?? raw.ownerName ?? '',
        photourl: raw.owner?.photourl ?? raw.ownerPhotoUrl ?? raw.owner?.photoUrl ?? '',
        contact: raw.owner?.contact ?? raw.ownerPhone ?? '',
    };

    return new CargoRequestMainData({
        adId,
        departureCity,
        destinationCity,
        date,                 // оставляем как в карточке (если хочешь — можно конвертировать в dd.mm.yyyy)
        price: asNumber(price),
        paymentUnit,
        owner,
    });
};
