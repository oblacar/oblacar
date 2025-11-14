// src/components/AdProfile/AdProfile.js
import React, { useContext, useMemo } from 'react';
import AuthContext from '../../hooks/Authorization/AuthContext';
import UserContext from '../../hooks/UserContext';

import PersonalAdProfile from './PersonalAdProfile/PersonalAdProfile';
import OtherAdProfile from './OtherAdProfile/OtherAdProfile';

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

const AdProfile = ({ adType, ad, isOwnAdMode = false }) => {
    const { isAuthenticated } = useContext(AuthContext) || {};
    const { user, isUserLoaded } = useContext(UserContext) || {};

    // единая «data» для всей разметки
    const data = useMemo(() => unwrapAd(ad), [ad]);

    // нормализуем ownerId (или из корня, или из owner.id)
    const ownerId = data?.owner?.id ?? data?.ownerId ?? null;

    // Если данных ещё нет — показываем скелет/лоадер
    if (!data || Object.keys(data).length === 0) {
        return <div className='loading'>Загрузка объявления...</div>;
    }

    //TODO нужно еще добавить проверку на селектор от администратора, что он нажал Вид хозяина объявления
    const isOwnAd =
        Boolean(isAuthenticated && isUserLoaded) &&
        (String(ownerId || '') === String(user?.userId || '') || isOwnAdMode);

    return (
        <div>
            {/* TODO Нужно сделать режим администратора, 
что бы Администратор мог выбрать вариант Хозяин или Нехозяин для просмотра профиля */}

            {isOwnAd ? (
                <PersonalAdProfile
                    adType={adType}
                    ad={data}
                />
            ) : (
                // если у есть «другой» профиль и для груза тоже — лучше передать adType,
                <OtherAdProfile
                    adType={adType}
                    ad={data}
                />
            )}
        </div>
    );
};

export default AdProfile;
