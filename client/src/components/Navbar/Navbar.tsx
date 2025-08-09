import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { clearSearch } from '../../store/moviesSlice';
import { useNotification } from '../../hooks/useNotification';
import styles from './Navbar.module.scss';

const Navbar: React.FC = () => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { showInfo } = useNotification();
    const isHome = location.pathname === '/';

    const handleHomeClick = () => {
        // Clear search when clicking Home
        dispatch(clearSearch());
        showInfo('🏠 Returned to home page');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo} onClick={handleHomeClick}>
                    🎬 Movies
                </Link>

                <div className={styles.description}>
                    Discover, manage and organize your favorite movies
                </div>

                <div className={styles.nav}>
                    <Link
                        to="/"
                        aria-label="Home"
                        title="Home"
                        className={`${styles.navLink} ${isHome ? styles.active : ''}`}
                        onClick={handleHomeClick}
                    >
                        🏠 Home
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
