import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const Controls = ({ params, setParams, isSidebarOpen, setIsSidebarOpen }) => {
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
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>{t('common.settings')}</h2>
                    <div className="mobile-only">
                        <LanguageSelector />
                    </div>
                </div>

                <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>{t('controls.temperature')}</label>
                        <input
                            type="number"
                            name="temperature"
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
            </div>
        </>
    );
};

export default Controls;
