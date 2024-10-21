import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link từ react-router-dom
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';


import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { auth, setAuth, loading } = useAuth();  // Thêm loading từ useAuth
  useEffect(() => {
    if (!loading && auth) {  // Kiểm tra nếu `auth` đã tồn tại và không còn đang tải
      navigate('/');  // Điều hướng thẳng đến trang /admin nếu đăng nhập thành công
    }
  }, [auth, loading, navigate]);
  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/users/login', { username, password });
      const data = response.data;
      const decodedToken = parseJwt(data.token);  // Giải mã JWT
      const authData = {
        token: data.token,
        roles: decodedToken.roles,
        user: {
          _id: decodedToken.id,
          avatar: decodedToken.avatar,
          username: decodedToken.username
        },
        expiresAt: Date.now() + 60 * 60 * 1000  // Phiên hết hạn sau 1 giờ

      };

      sessionStorage.setItem('auth', JSON.stringify(authData));
      localStorage.setItem('username', username);
      localStorage.setItem('roles', authData.roles);
      localStorage.setItem('avatar', authData.user.avatar);

      setAuth(authData);  // Đặt trạng thái đăng nhập

      // Điều hướng thẳng đến trang quản trị

      navigate('/dashboard');

    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your username and password.");
    }
  };
  // Hàm giải mã JWT
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to parse JWT:", e);
      return {};
    }
  }
  if (loading) {
    return <div>Loading...</div>;  // Hiển thị loading khi đang kiểm tra trạng thái đăng nhập
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}  // Liên kết với state username
                        onChange={(e) => setUsername(e.target.value)}  // Cập nhật state khi người dùng nhập

                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}  // Liên kết với state password
                        onChange={(e) => setPassword(e.target.value)}  // Cập nhật state khi người dùng nhập
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" onClick={handleLogin}>
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <Link to="/forgot-pass" style={{ textDecoration: 'none' }}>
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
