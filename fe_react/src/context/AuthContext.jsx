import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem('user');
            setUser(updatedUser && updatedUser !== "undefined" ? JSON.parse(updatedUser) : null);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (userData, token) => {
        // [GHI LÒNG TẠC DẠ]: Đảm bảo lưu đúng và đủ object user mới nhất vào bộ nhớ
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
        if (token) {
            localStorage.setItem('token', token);
        }
        setUser(userData ? { ...userData } : null);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const setAuthUser = (userData) => {
        // Cập nhật bộ nhớ vật lý trước khi kích hoạt Virtual DOM re-render
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
        // Kỹ thuật Clone Object: Tạo ra tham chiếu mới để React bắt buộc phải quét lại UI
        setUser(userData ? { ...userData } : null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};
