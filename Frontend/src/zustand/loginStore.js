import { create } from "zustand";
import { persist } from "zustand/middleware";

// Validation function for user roles
const isValidRole = (role) => ['Student', 'Teacher', null].includes(role);

const initialLoginState = {
    _id: null,
    email: null,
    fullName: null,
    role: null,
    semester: null,
    avatar: null,
};

const useLoginStore = create(
    persist(
        (set,get) => ({
            loginUserData: initialLoginState,
            isLogin: false,
            accessToken: null,
            refreshToken: null,

            // Sets user data and tokens on login
            setLoggedInUser: (data, accessToken, refreshToken) => {
                if (!isValidRole(data?.role)) {
                    console.error('Invalid user role:', data?.role);
                    return;
                }

                set({ 
                    loginUserData: {
                        ...initialLoginState,
                        ...data,
                    },
                    isLogin: true,
                    accessToken,
                    refreshToken
                });
            },

            // Updates access token if it is refreshed
            updateAccessToken: (newAccessToken) => {
                set({ accessToken: newAccessToken });
            },

            // Updates user profile data
            updateUserProfile: (updatedData) => {
                set(state => ({
                    loginUserData: {
                        ...state.loginUserData,
                        ...updatedData
                    }
                }));
            },

            // Logs out the user and clears all stored data
            logoutUser: () => {
                set({ 
                    loginUserData: initialLoginState,
                    isLogin: false,
                    accessToken: null,
                    refreshToken: null
                });
                // Clear localStorage completely
                localStorage.removeItem('auth-storage');
            },

            // Utility getter for user role
            get userRole() {
                return this.loginUserData.role;
            }
        }),
        {
            name: 'auth-storage',
            Storage: () => localStorage,
        }
    )
);

export default useLoginStore;