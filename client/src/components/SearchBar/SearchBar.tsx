import React from 'react';
import { useForm } from 'react-hook-form';
import styles from './SearchBar.module.scss';
import { FaSearch } from 'react-icons/fa'; // ← иконка

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

interface FormData {
  title: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    onSearch(data.title.trim());
  };

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
      </div>
      {errors.title && <span className={styles.errorMsg}>{errors.title.message}</span>}
    </form>
  );
};

export default SearchBar;
