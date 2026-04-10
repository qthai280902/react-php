import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8000', // URL của Backend PHP
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để tự động đính kèm Token vào Header nếu có
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response (ví dụ: logout nếu token hết hạn)
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Xử lý khi unauthorized (ví dụ: xóa token và chuyển hướng)
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
