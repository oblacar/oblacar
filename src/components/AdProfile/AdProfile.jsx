// src/components/AdProfile/AdProfile.js

import React, { useState, useEffect, useContext } from 'react';
import './AdProfile.css';

import AuthContext from '../../hooks/Authorization/AuthContext';

import PersonalTransportAdProfile from './PersonalTransportAdProfile';
import OtherTransportAdProfile from './OtherTransportAdProfile';

const AdProfile = ({ ad }) => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ad) {
            setIsLoading(false);
        }
    }, [ad]);

    if (isLoading) {
        return <div className='loading'>Загрузка объявления...</div>;
    }

    const { ownerId } = ad;

    return (
        <>
            <div>
                {isAuthenticated && ownerId === user.userId ? (
                    <PersonalTransportAdProfile ad={ad} />
                ) : (
                    <OtherTransportAdProfile ad={ad} />
                )}
            </div>
        </>
    );
};

export default AdProfile;
