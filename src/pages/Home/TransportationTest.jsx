import React, { useContext } from 'react';

import TransportationContext from '../../hooks/TransportationContext';

import TransportationService from '../../services/TransportationService';

import Transportation from '../../entities/Transportation/Transportation';
import TransportationRequest from '../../entities/Transportation/TransportationRequest';
import TransportationRequestMainData from '../../entities/Transportation/TransportationRequestMainData';

const TransportationTest = () => {
    const { adsTransportationRequests } = useContext(TransportationContext);

    // Тестовый объект транспортировки
    const testTransportation = new Transportation({
        transportationId: 'test123',
        adId: 'ad123',
        cargoOwner: {
            id: 'user001',
            name: 'Иван Иванов',
            photo: 'https://example.com/photo1.jpg',
            phone: '+1234567890',
        },
        truckOwner: {
            id: 'user002',
            name: 'Сергей Петров',
            photo: 'https://example.com/photo2.jpg',
            phone: '+0987654321',
        },
        status: 'pending',
        requestDetails: 'Перевозка мебели до офиса',
        startDate: '2024-11-15',
        pickupPhotos: {
            photo1: 'https://example.com/photo_pickup1.jpg',
        },
        deliveryPhotos: {}, // Пустой объект, как указано
    });

    // Обновления для тестирования updateTransportation
    const testUpdates = {
        status: 'inProgress',
        requestDetails: 'Перевозка мебели началась',
    };

    const request = new TransportationRequest({
        sender: {
            id: '11123',
            name: 'Сергей Петров',
            photoUrl: 'https://example.com/sender.jpg',
            contact: '+0987654321',
        },
        dateSent: '15.11.2024',
        status: 'pending',
    });

    const mainData = new TransportationRequestMainData({
        adId: 'ad1234',
        locationFrom: 'Мосва',
        locationTo: 'Санкт-Петербург',
        date: '15.11.2024',
        price: 10000,
        paymentUnit: 'RUB',
        owner: {
            id: '4yFCj7s6pBTNsZnRs0Ek3pNUsYb2',
            name: 'Иван Иванов',
            photoUrl: 'https://example.com/photo.jpg',
            contact: '+1234567890',
        },
    });

    // Обработчики для кнопок
    const handleAddTransportation = async () => {
        try {
            await TransportationService.addTransportation(testTransportation);
            alert('Transportation added successfully!');
        } catch (error) {
            console.error('Error adding transportation:', error);
        }
    };

    const handleGetTransportation = async () => {
        try {
            const transportation =
                await TransportationService.getTransportationById(
                    '-OBkltZJap_krdEU9HDj'
                );
            console.log('Fetched transportation:', transportation);
            alert('Check console for fetched transportation data.');
        } catch (error) {
            console.error('Error fetching transportation:', error);
        }
    };

    const handleUpdateTransportation = async () => {
        try {
            await TransportationService.updateTransportation(
                '-OBkltZJap_krdEU9HDj',
                testUpdates
            );
            alert('Transportation updated successfully!');
        } catch (error) {
            console.error('Error updating transportation:', error);
        }
    };

    //
    const handleAddTransportationRequest = async () => {
        TransportationService.addTransportationRequest(mainData, request)
            .then(() => console.log('Request added successfully.'))
            .catch((error) => console.error('Error adding request:', error));
    };

    const userId = 'user001';

    const handleGetRequestsByUserId = async () => {
        TransportationService.getRequestsByUserId(userId)
            .then((requests) => {
                console.log('Requests for user:', requests);
            })
            .catch((error) => {
                console.error('Error fetching requests:', error);
            });

        // TransportationService.testRead();
        // TransportationService.getRequestsByUserId(userId);
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <div>
                <h1>User Transportation Requests</h1>
                {adsTransportationRequests.map((ad) => (
                    <div key={ad.mainData.adId}>
                        <h2>
                            {ad.mainData.locationFrom} →{' '}
                            {ad.mainData.locationTo}
                        </h2>
                        <p>{ad.requests.length} requests</p>
                    </div>
                ))}
            </div>

            <h2>Test TransportationService Methods</h2>
            <button
                onClick={handleAddTransportation}
                style={{ margin: '10px' }}
            >
                Add Transportation
            </button>
            <button
                onClick={handleGetTransportation}
                style={{ margin: '10px' }}
            >
                Get Transportation
            </button>
            <button
                onClick={handleUpdateTransportation}
                style={{ margin: '10px' }}
            >
                Update Transportation
            </button>
            <div>
                <button
                    onClick={handleAddTransportationRequest}
                    style={{ margin: '10px' }}
                >
                    Add TransportationRequest
                </button>
                <button
                    onClick={handleGetRequestsByUserId}
                    style={{ margin: '10px' }}
                >
                    Get RequestsByUserId
                </button>
            </div>
        </div>
    );
};

export default TransportationTest;
