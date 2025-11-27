import React from 'react';

const HamburgerMenu = ({ isOpen, onClick }) => {
    return (
        <button
            className="hamburger-menu"
            onClick={onClick}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
        >
            <span className={isOpen ? "open" : ""}></span>
            <span className={isOpen ? "open" : ""}></span>
            <span className={isOpen ? "open" : ""}></span>
        </button>
    );
};

export default HamburgerMenu;
