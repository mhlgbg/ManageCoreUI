import React, { useState, useEffect } from 'react';
import axios from '../../api/api';
import {
    CFormSelect,
    CAlert,
    CTable,
    CTableHead,
    CTableBody,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormInput,
    CPagination,
    CPaginationItem
} from '@coreui/react';

const DepartmentCustomerListPage = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [modalType, setModalType] = useState('add'); // 'add' hoặc 'edit' hoặc 'delete'
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [totalPages, setTotalPages] = useState(1); // Tổng số trang
    const [file, setFile] = useState(null); // File avatar

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Hàm lấy danh sách phòng ban
    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/department-customer/departments');
            if (response.status === 404) {
                setErrorMessage('Bạn không được phân công quản lý phòng ban nào.');
                setDepartments([]);
            } else if (response.status === 200) {
                setDepartments(response.data);
                setErrorMessage('');
            }
        } catch (error) {
            setErrorMessage('Có lỗi xảy ra khi tải danh sách phòng ban.');
            console.error('Error fetching departments:', error);
        }
    };

    // Hàm lấy danh sách khách hàng của phòng ban với phân trang
    const fetchCustomers = async (departmentId, page = 1) => {
        try {
            const response = await axios.get(`/department-customer/departments/${departmentId}/customers?page=${page}&limit=12`);
            if (response.data && Array.isArray(response.data.customers)) {
                setCustomers(response.data.customers);
                setTotalPages(response.data.totalPages); // Cập nhật tổng số trang
                setCurrentPage(response.data.currentPage); // Cập nhật trang hiện tại
            } else {
                setCustomers([]);
            }
        } catch (error) {
            setErrorMessage('Có lỗi xảy ra khi tải danh sách khách hàng.');
            console.error('Error fetching customers:', error);
            setCustomers([]);
        }
    };

    // Khi người dùng chọn phòng ban
    const handleDepartmentChange = (e) => {
        const departmentId = e.target.value;
        setSelectedDepartment(departmentId);
        fetchCustomers(departmentId); // Gọi API lấy khách hàng của trang đầu tiên
    };

    // Thay đổi trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        fetchCustomers(selectedDepartment, pageNumber); // Gọi API lấy khách hàng theo trang
    };

    // Mở modal thêm hoặc sửa khách hàng
    const openModal = (customer = null) => {
        if (customer) {
            // Định dạng lại ngày sinh để tương thích với input type="date"
            const formattedBirthday = customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : '';
            setCurrentCustomer({
                ...customer,
                birthday: formattedBirthday // Đặt lại định dạng ngày sinh
            });
            setModalType('edit');
        } else {
            // Tạo đối tượng khách hàng trống khi thêm mới
            setCurrentCustomer({
                customerCode: '', // Mã sẽ được tạo ở API, không cần từ frontend
                fullName: '',
                phone: '',
                email: '',
                birthday: '',
                avatar: '',
                note: '',
                status: 'pending'
            });
            setModalType('add');
        }
        setShowModal(true);
    };

    // Xử lý thay đổi file avatar
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Lưu file ảnh vào state
    };

    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setCurrentCustomer(null);
        setFile(null); // Reset file
    };

    // Lưu thông tin khách hàng
    const saveCustomer = async () => {
        try {
            const formData = new FormData();
            Object.keys(currentCustomer).forEach(key => {
                formData.append(key, currentCustomer[key]);
            });

            if (file) {
                formData.append('avatar', file); // Thêm avatar vào formData nếu có
            }

            if (modalType === 'add') {
                const { customerCode, ...customerData } = currentCustomer;
                await axios.post(`/department-customer/departments/${selectedDepartment}/customers`, formData);
            } else if (modalType === 'edit') {
                await axios.put(`/department-customer/departments/customers/${currentCustomer.id}`, formData);
            }

            fetchCustomers(selectedDepartment); // Tải lại danh sách khách hàng sau khi thêm/sửa
            closeModal();
        } catch (error) {
            setErrorMessage('Có lỗi xảy ra khi lưu thông tin khách hàng.');
            console.error('Error saving customer:', error);
        }
    };

    // Xóa khách hàng
    const deleteCustomer = async () => {
        try {
            await axios.delete(`/department-customer/customers/${currentCustomer.id}`);
            fetchCustomers(selectedDepartment); // Tải lại danh sách khách hàng sau khi xóa
            setShowDeleteModal(false);
        } catch (error) {
            setErrorMessage('Có lỗi xảy ra khi xóa khách hàng.');
            console.error('Error deleting customer:', error);
        }
    };

    // Mở modal xóa khách hàng
    const openDeleteModal = (customer) => {
        setCurrentCustomer(customer);
        setShowDeleteModal(true);
    };

    return (
        <div>
            <h2 className="my-4">Department Customer Management</h2>

            {/* Thông báo khi không có phòng ban */}
            {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}

            {/* Chọn phòng ban */}
            {departments.length > 0 && (
                <CFormSelect
                    onChange={handleDepartmentChange}
                    value={selectedDepartment || ''}
                    className="mb-3"
                >
                    <option value="">Chọn phòng ban</option>
                    {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                            {department.name}
                        </option>
                    ))}
                </CFormSelect>
            )}

            {/* Nút Thêm khách hàng chỉ hiện khi đã chọn phòng ban */}
            {selectedDepartment && (
                <CButton color="primary" className="mb-3" onClick={() => openModal(null)}>
                    Thêm khách hàng
                </CButton>
            )}

            {/* Bảng khách hàng */}
            {customers.length > 0 && (
                <CTable striped hover>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Mã khách hàng</CTableHeaderCell>
                            <CTableHeaderCell>Họ tên</CTableHeaderCell>
                            <CTableHeaderCell>Điện thoại</CTableHeaderCell>
                            <CTableHeaderCell>Email</CTableHeaderCell>
                            <CTableHeaderCell>Ngày sinh</CTableHeaderCell>
                            <CTableHeaderCell>Note</CTableHeaderCell>
                            <CTableHeaderCell>Avatar</CTableHeaderCell>
                            <CTableHeaderCell>Hành động</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {customers.map((customer) => (
                            <CTableRow key={customer.id}>
                                <CTableDataCell>{customer.customerCode}</CTableDataCell>
                                <CTableDataCell>{customer.fullName}</CTableDataCell>
                                <CTableDataCell>{customer.phone}</CTableDataCell>
                                <CTableDataCell>{customer.email}</CTableDataCell>
                                <CTableDataCell>{customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A'}</CTableDataCell>
                                <CTableDataCell>{customer.note}</CTableDataCell>
                                <CTableDataCell>
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/${customer.avatar ? customer.avatar : 'uploads/avatars/150.jpg'}`}
                                        alt="Avatar"
                                        width="100"
                                    />
                                </CTableDataCell>
                                <CTableDataCell>
                                    <CButton color="warning" onClick={() => openModal(customer)} className="me-2">Sửa</CButton>
                                    <CButton color="danger" onClick={() => openDeleteModal(customer)}>Xóa</CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            )}

            {/* Phân trang */}
            <CPagination>
                {[...Array(totalPages).keys()].map((page) => (
                    <CPaginationItem
                        key={page + 1}
                        active={page + 1 === currentPage}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        {page + 1}
                    </CPaginationItem>
                ))}
            </CPagination>

            {/* Thêm/Sửa Khách hàng */}
            <CModal visible={showModal} onClose={closeModal} backdrop="static">
                <CModalHeader closeButton>
                    <CModalTitle>{modalType === 'add' ? 'Thêm khách hàng' : 'Sửa khách hàng'}</CModalTitle>
                </CModalHeader>
                <CModalBody onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // Ngăn chặn hành vi mặc định của phím Enter
                        saveCustomer(); // Gọi hàm lưu khi nhấn Enter
                    }
                }}>
                    {/* Ẩn mã khách hàng khi thêm */}
                    {modalType === 'edit' && (
                        <CFormInput
                            type="text"
                            label="Mã khách hàng"
                            value={currentCustomer?.customerCode || ''}
                            disabled={true} // Không cho phép sửa mã khách hàng
                        />
                    )}
                    <CFormInput
                        type="text"
                        label="Họ tên"
                        value={currentCustomer?.fullName || ''}
                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, fullName: e.target.value })}
                    />
                    <CFormInput
                        type="text"
                        label="Điện thoại"
                        value={currentCustomer?.phone || ''}
                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                    />
                    <CFormInput
                        type="email"
                        label="Email"
                        value={currentCustomer?.email || ''}
                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
                    />
                    <CFormInput
                        type="date"
                        label="Ngày sinh"
                        value={currentCustomer?.birthday || ''}
                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, birthday: e.target.value })}
                    />
                    <CFormInput
                        type="file"
                        label="Avatar"
                        onChange={handleFileChange}
                    />
                    <CFormInput
                        type="text"
                        label="Ghi chú"
                        value={currentCustomer?.note || ''}
                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, note: e.target.value })}
                    />
                    <CFormSelect
                        label="Trạng thái"
                        value={currentCustomer?.status || 'pending'}
                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, status: e.target.value })}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </CFormSelect>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={closeModal}>Đóng</CButton>
                    <CButton color="primary" onClick={saveCustomer}>Lưu</CButton>
                </CModalFooter>
            </CModal>

            {/* Xóa Khách hàng */}
            <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} backdrop="static">
                <CModalHeader closeButton>
                    <CModalTitle>Xóa khách hàng</CModalTitle>
                </CModalHeader>
                <CModalBody>Bạn có chắc chắn muốn xóa khách hàng {currentCustomer?.fullName} không?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>Đóng</CButton>
                    <CButton color="danger" onClick={deleteCustomer}>Xóa</CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default DepartmentCustomerListPage;
