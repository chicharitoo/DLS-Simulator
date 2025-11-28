import React from 'react';
import { useTranslation } from 'react-i18next';
import HamburgerMenu from './HamburgerMenu';
import LanguageSelector from './LanguageSelector';

const Dashboard = ({
    isRunning,
    onStart,
    onStop,
    onReset,
    runtime = 0,
    samples = 0,
    isSidebarOpen,
    setIsSidebarOpen
}) => {
    const { t } = useTranslation();

    return (
        <div className="dashboard">
            <div className="dashboard-left">
                <HamburgerMenu isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <h1 className="app-title">{t('common.appTitle')}</h1>
            </div>

            <div className="dashboard-center">
                <div className="live-stats">
                    <div className="stat-pill">
                        <span className="stat-label">{t('stats.intensity')}:</span>
                        <span className="stat-value" id="stat-intensity">0</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-label">{t('stats.estimatedDiameter')}:</span>
                        <span className="stat-value" id="stat-diameter">--</span>
                    </div>
                    <div className="stat-pill mobile-hide">
                        <span className="stat-label">{t('stats.runtime')}:</span>
                        <span className="stat-value">{runtime.toFixed(1)}s</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-right">
                <div className="control-buttons">
                    {!isRunning ? (
                        <button className="btn-start" onClick={onStart}>
                            {t('common.start')}
                        </button>
                    ) : (
                        <button className="btn-stop" onClick={onStop}>
                            {t('common.stop')}
                        </button>
                    )}
                    <button className="btn-reset" onClick={onReset}>
                        {t('common.reset')}
                    </button>
                </div>
                <div className="desktop-only">
                    <LanguageSelector />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
