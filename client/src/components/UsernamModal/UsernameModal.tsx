import React, { useState } from 'react';
import styles from './UsernameModal.module.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (username: string) => void;
  error?: string | null;
  successMessage?: string | null;
}

const UsernameModal: React.FC<Props> = ({ isOpen, onClose, onSave, error, successMessage }) => {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSave(username.trim());
      setUsername('');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Enter your name</h2>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" className={styles.saveButton}>
              Save
            </button>
          </div>
        </form>

        <button type="button" onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UsernameModal;
