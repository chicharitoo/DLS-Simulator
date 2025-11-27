import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    return (
        <div className="language-selector">
            <button
                onClick={() => changeLanguage('en')}
                className={i18n.language === 'en' ? 'active' : ''}
                aria-label="Switch to English"
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('es-MX')}
                className={i18n.language === 'es-MX' ? 'active' : ''}
                aria-label="Cambiar a Español"
            >
                ES
            </button>
        </div>
    );
};

export default LanguageSelector;
