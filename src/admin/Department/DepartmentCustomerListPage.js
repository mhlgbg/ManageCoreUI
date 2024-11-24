import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Import React-Select

import axios from '../../api/api';
import {
    CForm,
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
    const [selectedCompany, setSelectedCompany] = useState(null); // Công ty được chọn
    const [showAddCompanyModal, setShowAddCompanyModal] = useState(false); // Hiển thị modal thêm công ty
    const [newCompany, setNewCompany] = useState({
        name: '',
        code: '',
        foundedDate: '',
        taxCode: '',
        registrationNumber: '',
        address: '',
        website: '',
        notes: '',
    }); // Thông tin công ty mới
    const [companies, setCompanies] = useState([]); // Danh sách công ty

    const [errorMessage, setErrorMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [modalType, setModalType] = useState('add'); // 'add' hoặc 'edit' hoặc 'delete'
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [totalPages, setTotalPages] = useState(1); // Tổng số trang
    const [file, setFile] = useState(null); // File avatar
    const [searchText, setSearchText] = useState(''); // Thêm state cho từ khóa tìm kiếm

    useEffect(() => {
        fetchDepartments();
        fetchCompanies(); // Gọi API để lấy danh sách công ty
    }, []);

    // Lọc công ty khi từ khóa thay đổi


    // Hàm lấy danh sách công ty
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('/companies/all');
            // Chuyển đổi dữ liệu để phù hợp với react-select
            const formattedCompanies = response.data.map((company) => ({
                value: company._id,
                label: company.name,
            }));
            setCompanies(formattedCompanies);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };
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
    const fetchCustomers = async (departmentId, page = 1, search = searchText) => {
        if (!departmentId) {
            setErrorMessage("Phòng ban không được xác định.");
            return;
        }

        try {
            const response = await axios.get(`/department-customer/departments/${departmentId}/customers`, {
                params: { page, limit: 12, search }
            });

            if (response.data && Array.isArray(response.data.customers)) {
                setCustomers(response.data.customers);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.currentPage);
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
            setCurrentCustomer({
                id: customer._id, // Đảm bảo lấy _id từ customer
                customerCode: customer.customerCode,
                fullName: customer.fullName,
                gender: customer.gender || 'Nam',
                phone: customer.phone,
                email: customer.email,
                birthday: customer.birthday ? new Date(customer.birthday).toISOString().split('T')[0] : '',
                status: customer.status,
                note: customer.note,
                company: customer.company?._id || '',
                avatar: customer.avatar
            });
            setSelectedCompany(
                customer.company
                    ? { value: customer.company._id, label: customer.company.name }
                    : null
            );
            setModalType('edit');
        } else {
            setCurrentCustomer({
                customerCode: '',
                fullName: '',
                phone: '',
                email: '',
                birthday: '',
                gender: 'Nam',
                avatar: '',
                note: '',
                status: 'pending',
                company: ''
            });
            setSelectedCompany(null);
            setModalType('add');
        }
        setShowModal(true);
    };
    // Xử lý thay đổi file avatar
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Lưu file ảnh vào state
    };
    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSearch = () => {
        fetchCustomers(selectedDepartment, 1, searchText); // Tìm lại từ trang đầu tiên với điều kiện tìm kiếm
    };
    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setCurrentCustomer(null);
        setFile(null); // Reset file
    };

    // Lưu công ty mới
    // Lưu công ty mới
    const handleSaveNewCompany = async () => {
        try {
            const response = await axios.post('/companies', newCompany);
            const createdCompany = response.data;

            // Thêm công ty mới vào danh sách
            const newOption = { value: createdCompany._id, label: createdCompany.name };
            setCompanies((prev) => [...prev, newOption]);
            setSelectedCompany(newOption);

            setNewCompany({
                name: '',
                code: '',
                foundedDate: '',
                taxCode: '',
                registrationNumber: '',
                address: '',
                website: '',
                notes: '',
            }); // Reset form
            setShowAddCompanyModal(false);
        } catch (error) {
            console.error('Error adding new company:', error);
        }
    };

    // Lưu thông tin khách hàng
    const saveCustomer = async () => {
        try {
            const formData = new FormData();

            Object.keys(currentCustomer).forEach((key) => {
                // Kiểm tra và xử lý riêng cho `company` để chỉ lấy `_id`
                if (key === 'company' && typeof currentCustomer.company === 'object') {
                    formData.append(key, currentCustomer.company._id || ''); // Lấy _id nếu có
                } else {
                    formData.append(key, currentCustomer[key]);
                }
            });

            if (file) {
                formData.append('avatar', file); // Thêm avatar vào formData nếu có
            }

            if (modalType === 'add') {
                await axios.post(`/department-customer/departments/${selectedDepartment}/customers`, formData);
            } else if (modalType === 'edit') {
                await axios.put(`/department-customer/departments/customers/${currentCustomer.id}`, formData);
            }

            fetchCustomers(selectedDepartment, currentPage); // Tải lại danh sách khách hàng sau khi thêm/sửa
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

            {/* Ô tìm kiếm khách hàng */}
            <CFormInput
                type="text"
                placeholder="Tìm kiếm khách hàng"
                value={searchText}
                onChange={handleSearchChange}
                onBlur={handleSearch}
                className="mb-3"
            />
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
                            <CTableHeaderCell>Giới tính</CTableHeaderCell>
                            <CTableHeaderCell>Công ty</CTableHeaderCell>
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
                            <CTableRow key={customer._id}>
                                <CTableDataCell>{customer.customerCode}</CTableDataCell>
                                <CTableDataCell>{customer.fullName}</CTableDataCell>
                                <CTableDataCell>{customer.gender}</CTableDataCell> {/* Hiển thị giới tính */}
                                <CTableDataCell>{customer.company?.name || 'N/A'}</CTableDataCell>
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
            <CModal visible={showModal} onClose={closeModal} backdrop="static" size="lg">
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
                    <CFormSelect
                        label="Giới tính"
                        value={currentCustomer?.gender || 'Nam'}
                        onChange={(e) => setCurrentCustomer({ ...currentCustomer, gender: e.target.value })}
                    >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </CFormSelect>

                    {/* Select công ty */}
                    <label htmlFor="company-select">Chọn công ty</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: '3' }}>
                            <Select
                                id="company-select"
                                options={companies}
                                value={selectedCompany}
                                onChange={(selectedOption) => setSelectedCompany(selectedOption)}
                                placeholder="Nhập từ khóa công ty..."
                                isClearable
                                isSearchable
                            />
                        </div>
                        <div style={{ flex: '1' }}>
                            <CButton color="primary" style={{ width: '100%' }} onClick={() => setShowAddCompanyModal(true)}>
                                Thêm công ty
                            </CButton>
                        </div>
                    </div>


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

            {/* Modal Thêm Công ty */}
            <CModal
                visible={showAddCompanyModal}
                onClose={() => setShowAddCompanyModal(false)}
                backdrop="static"
            >
                <CModalHeader closeButton>
                    <CModalTitle>Thêm Công ty</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            label="Tên Công ty"
                            placeholder="Nhập tên công ty"
                            value={newCompany.name}
                            onChange={(e) =>
                                setNewCompany((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="mb-3"
                            required
                        />
                        <CFormInput
                            type="text"
                            label="Mã Công ty"
                            placeholder="Nhập mã công ty"
                            value={newCompany.code}
                            onChange={(e) =>
                                setNewCompany((prev) => ({ ...prev, code: e.target.value }))
                            }
                            className="mb-3"
                            required
                        />
                        <CFormInput
                            type="date"
                            label="Ngày Thành Lập"
                            placeholder="Nhập ngày thành lập"
                            value={newCompany.foundedDate}
                            onChange={(e) =>
                                setNewCompany((prev) => ({ ...prev, foundedDate: e.target.value }))
                            }
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            label="Mã Số Thuế"
                            placeholder="Nhập mã số thuế"
                            value={newCompany.taxCode}
                            onChange={(e) =>
                                setNewCompany((prev) => ({ ...prev, taxCode: e.target.value }))
                            }
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            label="Số Đăng Ký Kinh Doanh"
                            placeholder="Nhập số đăng ký kinh doanh"
                            value={newCompany.registrationNumber}
                            onChange={(e) =>
                                setNewCompany((prev) => ({
                                    ...prev,
                                    registrationNumber: e.target.value,
                                }))
                            }
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            label="Địa Chỉ"
                            placeholder="Nhập địa chỉ công ty"
                            value={newCompany.address}
                            onChange={(e) =>
                                setNewCompany((prev) => ({ ...prev, address: e.target.value }))
                            }
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            label="Website"
                            placeholder="Nhập website công ty"
                            value={newCompany.website}
                            onChange={(e) =>
                                setNewCompany((prev) => ({ ...prev, website: e.target.value }))
                            }
                            className="mb-3"
                        />
                        <CFormInput
                            type="textarea"
                            label="Ghi Chú"
                            placeholder="Nhập ghi chú"
                            value={newCompany.notes}
                            onChange={(e) =>
                                setNewCompany((prev) => ({ ...prev, notes: e.target.value }))
                            }
                            className="mb-3"
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowAddCompanyModal(false)}>
                        Đóng
                    </CButton>
                    <CButton color="primary" onClick={handleSaveNewCompany}>
                        Lưu
                    </CButton>
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
