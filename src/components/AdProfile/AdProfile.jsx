// src/components/AdProfile/AdProfile.js

import React, { useState, useEffect, useContext } from 'react';
// import './AdProfile.css';

import { useSearchParams } from 'react-router-dom';

import AuthContext from '../../hooks/Authorization/AuthContext';
import UserContext from '../../hooks/UserContext';

import PersonalAdProfile from './PersonalAdProfile';
import OtherTransportAdProfile from './OtherTransportAdProfile';
import AdEditMenu from '../AdEditMenu/AdEditMenu';

const AdProfile = ({ ad }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const { user, isUserLoaded } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);
    
    const [sp] = useSearchParams();
    const adType = sp.get('type'); // "cargo" | "transport"

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
                {/* <div
                    style={{
                        padding: '50px',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <AdEditMenu />
                </div> */}
                {/* TODO сделать панель для свого объявления */}
                {isAuthenticated && isUserLoaded && ownerId === user.userId ? (
                    <PersonalAdProfile adType={adType} ad={ad} />
                ) : (
                    <OtherTransportAdProfile ad={ad} />
                )}
            </div>
        </>
    );
};

export default AdProfile;
