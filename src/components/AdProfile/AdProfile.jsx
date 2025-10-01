// src/components/AdProfile/AdProfile.js
import React, { useContext, useMemo } from 'react';
import AuthContext from '../../hooks/Authorization/AuthContext';
import UserContext from '../../hooks/UserContext';

import PersonalAdProfile from './PersonalAdProfile';
import OtherAdProfile from './OtherAdProfile';

// аккуратно разворачиваем вложенные { ad: { ... } }
function unwrapAd(input) {
    let out = input ?? {};
    let hops = 0;
    while (
        out &&
        typeof out === 'object' &&
        'ad' in out &&
        out.ad &&
        typeof out.ad === 'object' &&
        hops < 5
    ) {
        out = out.ad;
        hops++;
    }
    return out;
}

const AdProfile = ({ adType, ad }) => {
    const { isAuthenticated } = useContext(AuthContext) || {};
    const { user, isUserLoaded } = useContext(UserContext) || {};

    console.log('adType: ' + { adType });

    // единая «data» для всей разметки
    const data = useMemo(() => unwrapAd(ad), [ad]);

    // нормализуем ownerId (или из корня, или из owner.id)
    const ownerId = data?.owner?.id ?? data?.ownerId ?? null;

    // Если данных ещё нет — показываем скелет/лоадер
    if (!data || Object.keys(data).length === 0) {
        return <div className="loading">Загрузка объявления...</div>;
    }

    const isOwnAd =
        Boolean(isAuthenticated && isUserLoaded) &&
        String(ownerId || '') === String(user?.userId || '');

    return (
        <div>
            {isOwnAd ? (
                <PersonalAdProfile adType={adType} ad={data} />
            ) : (
                // если у тебя есть «другой» профиль и для груза тоже — лучше передать adType,
                // чтобы внутри он тоже мог отличать, что рендерить
                <OtherAdProfile adType={adType} ad={data} />
            )}
        </div>
    );
};

export default AdProfile;
