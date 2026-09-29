import { create } from 'zustand';
import axiosClient from "../../../shared/axios/axiosClient.js";

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,

    initAuth: async () => {
        try {
            const res = await axiosClient.get('/auth/me');
            set({
                isAuthenticated: true,
                user: res.data,
                isInitialized: true
            });
        } catch (error) {
            set({
                isAuthenticated: false,
                user: null,
                isInitialized: true
            });
        }
    },

    fetchProfile: async () => {
        const currentUser = get().user;
        if (!currentUser || !currentUser.id) return null;
        try {
            const res = await axiosClient.get(`/admin/users/${currentUser.id}`);
            const profileData = res.data;
            set((state) => ({
                user: {
                    ...state.user,
                    facilityId: profileData.facilityId
                }
            }));
            return profileData.facilityId;
        } catch (error) {
            return null;
        }
    },

    loginSuccess: async () => {
        await get().initAuth();
    },

    logout: async () => {
        try {
            await axiosClient.post('/auth/logout');
        } catch (e) {}
        set({ isAuthenticated: false, user: null });
        window.location.href = '/login';
    }
}));
