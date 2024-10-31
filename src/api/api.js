import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
    //baseURL: 'http://171.244.10.195:5004/api',
    //baseURL: 'http://192.168.80.130:5003/api',
    baseURL: 'http://localhost:5005/api',
    //baseURL: 'http://192.168.1.13:5003/api',
});

// Interceptor cho request để thêm token vào headers nếu có
api.interceptors.request.use(
    (config) => {
        const auth = JSON.parse(sessionStorage.getItem('auth'));
        if (auth && auth.token) {
            config.headers['Authorization'] = `Bearer ${auth.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor cho response để kiểm tra lỗi và chuyển hướng khi token hết hạn
api.interceptors.response.use(
    (response) => {
        return response;  // Trả về response nếu thành công
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Nếu token hết hạn hoặc không hợp lệ, xóa session và chuyển hướng về trang login
            sessionStorage.removeItem('auth'); // Xóa session hiện tại
            
            // Sử dụng hook navigate của react-router-dom để chuyển hướng
            //const navigate = useNavigate();
            window.location.href = '/login'; // Chuyển hướng về trang login
        }
        return Promise.reject(error); // Trả về lỗi để xử lý tiếp
    }
);

export default api;
