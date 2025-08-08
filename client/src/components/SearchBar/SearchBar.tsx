import React from 'react';
import { useForm } from 'react-hook-form';
import styles from './SearchBar.module.scss';
import { FaSearch, FaTimes } from 'react-icons/fa'; // ← добавили FaTimes

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  onClear?: () => void;
}

interface FormData {
  title: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const watchedTitle = watch('title');

  const onSubmit = (data: FormData) => {
    const trimmedTitle = data.title.trim();
    onSearch(trimmedTitle);
  };

  const handleClear = () => {
    setValue('title', '');
    if (onClear) {
      onClear();
    }
  };

  const showClearButton = watchedTitle && watchedTitle.length > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <div className={styles.inputWrapper}>
        <FaSearch className={styles.icon} />
        <input
          type="text"
          placeholder="Search for a movie..."
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 3, message: 'Minimum 3 characters' },
          })}
          className={styles.input}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {errors.title && <span className={styles.errorMsg}>{errors.title.message}</span>}
    </form>
  );
};

export default SearchBar;
