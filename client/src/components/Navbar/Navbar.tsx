import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.scss';

const Navbar: React.FC = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    🎬 Movies
                </Link>

                <div className={styles.description}>
                    Discover, manage and organize your favorite movies
                </div>

                <div className={styles.nav}>
                    <Link
                        to="/"
                        className={`${styles.navLink} ${isHome ? styles.active : ''}`}
                    >
                        🏠 Home
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
