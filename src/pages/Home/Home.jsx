// src/pages/Home/Home.jsx
import React, { useContext } from 'react';
import styles from './Home.module.css';

import SearchModeContext from '../../hooks/SearchModeContext';
import { TruckIcon, CubeIcon } from '@heroicons/react/24/outline';

import ToggleSearchMode from '../../components/common/ToggleSearchMode/ToggleSearchMode';
import SearchTransport from '../../components/SearchTransport/SearchTransport';
import TransportAdsList from '../../components/TransportAds/TransportAdsList';
import CargoAdLisT from '../../components/CargoAds/CargoAdsList';

function Home() {
    const ctx = useContext(SearchModeContext);

    // fallback, если провайдер ещё не смонтирован/горячая перезагрузка ломает порядок
    const mode = ctx?.mode ?? 'transport';
    const setMode = ctx?.setMode ?? (() => { });
    const isSelectFirst = mode === 'transport';

    const handleToggle = (isFirstSelected) => {
        setMode(isFirstSelected ? 'transport' : 'cargo');
    };

    return (
        <>
            <div style={{ padding: '20px' }}>
                <ToggleSearchMode
                    firstOption={{ icon: <TruckIcon />, label: 'Найти машину' }}
                    secondOption={{ icon: <CubeIcon />, label: 'Найти груз' }}
                    isSelectFirst={isSelectFirst}
                    onToggle={handleToggle}
                />
            </div>

            <div className={styles.container}>
                <SearchTransport />
                {mode === 'transport' ? <TransportAdsList /> : <CargoAdLisT />}
            </div>
        </>
    );
}

export default Home;
