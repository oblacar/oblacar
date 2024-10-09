// src/components/UserProfile/UserProfile.js

import React from 'react';
import PersonalInfo from './UserProfileSections/PersonalInfo';
import Requests from './UserProfileSections/Requests';
import Deliveries from './UserProfileSections/Deliveries';
import PaymentDetails from './UserProfileSections/PaymentDetails';
import './UserProfile.css'; // Импортируйте стили

const UserProfile = () => {
    return (
        <div className='user-profile-container'>
            <div className='personal-info'>
                <PersonalInfo />
            </div>
            <div className='side-info'>
                <div className='profile-section requests-wrapper'>
                    <Requests />
                </div>
                <div className='profile-section deliveries-wrapper'>
                    <Deliveries />
                </div>
                <div className='profile-section payment-details-wrapper'>
                    <PaymentDetails />
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
