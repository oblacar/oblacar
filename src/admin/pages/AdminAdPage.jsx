// src/admin/pages/AdminAdPage.jsx
import React, { useContext, useState } from 'react';
import AdminAdPanel from '../components/AdminAdPanel';
import AdProfile from '../../components/AdProfile/AdProfile';
import UserContext from '../../hooks/UserContext';
import AdminAdsProvider from '../context/AdminAdsContext';

import './AdminAdPage.css';

export default function AdminAdPage({ ad, adType }) {
    const { user } = useContext(UserContext);
    const [ownerMode, setOwnerMode] = useState(false);

    // Если не админ — обычная страница
    if (!user || user.userRole !== 'admin') {
        return (
            <AdProfile
                ad={ad}
                adType={adType}
            />
        );
    }

    // ✅ Оборачиваем админскую панель в провайдер
    return (
        <AdminAdsProvider>
            <div>
                <AdminAdPanel
                    adId={ad.id}
                    adRoot={ad._root}
                    ownerMode={ownerMode}
                    onToggleOwnerMode={setOwnerMode}
                    isAdmin={true} // флаг, чтобы панель точно рендерилась
                    isOwnAd={ownerMode}
                />
                <div className='ad-profile-admin-container'>
                    <AdProfile
                        ad={ad}
                        adType={adType}
                        isOwnAdMode={ownerMode}
                    />
                </div>
            </div>
        </AdminAdsProvider>
    );
}
