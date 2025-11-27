import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import HamburgerMenu from './HamburgerMenu';

const Controls = ({ params, setParams, isRunning, onStart, onStop, onReset, runtime = 0, samples = 0, isSidebarOpen = false, setIsSidebarOpen }) => {
    const { t } = useTranslation();
    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = parseFloat(value);

        if (name === 'temperature') {
            // Convert Celsius to Kelvin
            val = val + 273.15;
        }

        setParams(prev => ({
            ...prev,
            [name]: val
        }));
    };

    const handleNmChange = (e) => {
        const { name, value } = e.target;
        let val = parseFloat(value);
        // Convert nm to meters
        setParams(prev => ({
            ...prev,
            [name]: val * 1e-9
        }));
    };

    return (
        <>
            {!isSidebarOpen && (
                <div style={{ position: 'fixed', top: '0.5rem', left: '0.5rem', zIndex: 50 }}>
                    <HamburgerMenu isOpen={false} onClick={() => setIsSidebarOpen(true)} />
                </div>
            )}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <HamburgerMenu isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                        <h1>{t('common.appTitle')}</h1>
                        <LanguageSelector />
                    </div>
                </div>
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

                <div className="control-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                    {!isRunning ? (
                        <button
                            onClick={onStart}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: '#22c55e',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {t('common.start')}
                        </button>
                    ) : (
                        <button
                            onClick={onStop}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: '#eab308',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {t('common.stop')}
                        </button>
                    )}
                    <button
                        onClick={onReset}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {t('common.reset')}
                    </button>
                </div>

                <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{t('controls.temperature')}</label>
                        <input
                            type="number"
                            name="temperature" // Reusing name for logic, but value is C
                            value={Math.round((params.temperature - 273.15) * 10) / 10}
                            onChange={(e) => setParams(prev => ({ ...prev, temperature: parseFloat(e.target.value) + 273.15 }))}
                            style={{ width: '60px', padding: '2px' }}
                        />
                    </div>
                    <input
                        type="range"
                        name="temperature"
                        min="0"
                        max="100"
                        step="0.1"
                        value={params.temperature - 273.15}
                        onChange={handleChange}
                    />
                </div>

                <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{t('controls.viscosity')}</label>
                        <input
                            type="number"
                            name="viscosity"
                            step="0.0001"
                            value={params.viscosity}
                            onChange={handleChange}
                            style={{ width: '70px', padding: '2px' }}
                        />
                    </div>
                    <input
                        type="range"
                        name="viscosity"
                        min="0.0001"
                        max="0.01"
                        step="0.0001"
                        value={params.viscosity}
                        onChange={handleChange}
                    />
                </div>

                <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{t('controls.particleCount')}</label>
                        <input
                            type="number"
                            name="numParticles"
                            value={params.numParticles}
                            onChange={handleChange}
                            style={{ width: '60px', padding: '2px' }}
                        />
                    </div>
                    <input
                        type="range"
                        name="numParticles"
                        min="50"
                        max="1000"
                        step="50"
                        value={params.numParticles}
                        onChange={handleChange}
                    />
                </div>

                <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{t('controls.particleDiameter')}</label>
                        <input
                            type="number"
                            name="diameter"
                            value={Math.round(params.diameter * 1e9)}
                            onChange={handleNmChange}
                            style={{ width: '60px', padding: '2px' }}
                        />
                    </div>
                    <input
                        type="range"
                        name="diameter"
                        min="1e-9"
                        max="1000e-9"
                        step="1e-9"
                        value={params.diameter}
                        onChange={handleChange}
                    />
                </div>

                <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{t('controls.polydispersity')}</label>
                        <input
                            type="number"
                            name="polydispersity"
                            step="0.01"
                            value={params.polydispersity}
                            onChange={handleChange}
                            style={{ width: '60px', padding: '2px' }}
                        />
                    </div>
                    <input
                        type="range"
                        name="polydispersity"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={params.polydispersity}
                        onChange={handleChange}
                    />
                </div>

                <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{t('controls.laserWavelength')}</label>
                        <input
                            type="number"
                            name="wavelength"
                            value={Math.round(params.wavelength * 1e9)}
                            onChange={handleNmChange}
                            style={{ width: '60px', padding: '2px' }}
                        />
                    </div>
                    <input
                        type="range"
                        name="wavelength"
                        min="400e-9"
                        max="800e-9"
                        step="10e-9"
                        value={params.wavelength}
                        onChange={handleChange}
                    />
                </div>

                <div className="stats-panel">
                    <h3>{t('stats.liveStats')}</h3>
                    <div className="stat-item">
                        <span className="stat-label">{t('stats.intensity')}</span>
                        <span className="stat-value" id="stat-intensity">0</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{t('stats.estimatedDiameter')}</span>
                        <span className="stat-value" id="stat-diameter">--</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{t('stats.runtime')}</span>
                        <span className="stat-value">{runtime.toFixed(1)} s</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">{t('stats.measurements')}</span>
                        <span className="stat-value">{samples.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Controls;
