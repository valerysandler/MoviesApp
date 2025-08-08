import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import type { RootState } from './types';

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

export type { RootState };
export type AppDispatch = typeof store.dispatch;
