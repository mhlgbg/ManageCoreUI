import React, { useState, useEffect } from 'react';
import axios from '../../api/api';
import {
    CButton,
    CForm,
    CFormInput,
    CTable,
    CTableHead,
    CTableBody,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CPagination,
    CPaginationItem,
    CFormSelect
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const CustomerListPage = () => {
    const [customers, setCustomers] = useState([]);
    const [newCustomer, setNewCustomer] = useState({
        customerCode: '',
        fullName: '',
        phone: '',
        email: '',
        birthday: '',
        avatar: '',
        status: 'pending',
        note: ''
    });
    const [todos, setTodos] = useState([]);  // Danh sách todo cho khách hàng hiện tại
    const [newTodo, setNewTodo] = useState({ title: '', dueDate: '', notes: '' });
    const [editingTodo, setEditingTodo] = useState(null);  // Đang chỉnh sửa todo
    const [currentCustomerId, setCurrentCustomerId] = useState(null);  // ID khách hàng hiện tại
    const [showTodoModal, setShowTodoModal] = useState(false);  // Hiển thị modal ToDoList
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');  // Ô tìm kiếm
    const [currentPage, setCurrentPage] = useState(1);  // Trang hiện tại
    const [totalPages, setTotalPages] = useState(1);  // Tổng số trang
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, search]);

    const fetchCustomers = async () => {
        const response = await axios.get(`/customers?page=${currentPage}&limit=12&search=${search}`);
        setCustomers(response.data.customers);
        setTotalPages(response.data.totalPages);
    };

    // Thêm hoặc cập nhật khách hàng
    const handleSaveCustomer = async () => {
        try {
            const formData = new FormData();
            Object.keys(newCustomer).forEach(key => {
                formData.append(key, newCustomer[key]);
            });

            if (editingCustomer) {
                await axios.put(`/customers/${editingCustomer._id}`, formData);
            } else {
                await axios.post('/customers', formData);
            }

            setNewCustomer({
                customerCode: '', fullName: '', phone: '', email: '', birthday: '', avatar: '', status: 'pending', note: ''
            });

            setShowModal(false);
            fetchCustomers();
        } catch (error) {
            if (error.response && error.response.data.message === 'Phone number already exists') {
                alert('Phone number already exists. Please use a different phone number.');
            } else {
                console.error('Error saving customer:', error);
            }
        }
    };

    // Xóa khách hàng
    const handleDeleteCustomer = async (id) => {
        await axios.delete(`/customers/${id}`);
        setDeleteId(null);
        fetchCustomers();
    };

    // Thay đổi file avatar
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewCustomer({ ...newCustomer, avatar: file });
    };

    // Mở Modal cho thêm hoặc sửa
    const openModal = (customer = null) => {
        setEditingCustomer(customer);
        setNewCustomer(customer || {
            customerCode: '', fullName: '', phone: '', email: '', birthday: '', avatar: '', status: 'pending', note: ''
        });
        setShowModal(true);
    };

    // Đóng Modal
    const closeModal = () => {
        setEditingCustomer(null);
        setShowModal(false);
    };

    // Xác nhận xóa
    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    // Xử lý tìm kiếm
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);  // Khi tìm kiếm, reset về trang 1
    };

    // Phân trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Lấy danh sách Todo cho một khách hàng
    const fetchCustomerTodos = async (customerId) => {
        try {
            const response = await axios.get(`/customers/${customerId}/todos`);
            setTodos(response.data); // Lưu dữ liệu vào state
            setCurrentCustomerId(customerId);
            setShowTodoModal(true);
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    // Thêm hoặc cập nhật ToDo item
    const handleSaveTodo = async () => {
        if (editingTodo) {
            await axios.put(`/customers/${currentCustomerId}/todos/${editingTodo._id}`, newTodo);
        } else {
            await axios.post(`/customers/${currentCustomerId}/todos`, newTodo);
        }
        setNewTodo({ title: '', dueDate: '', notes: '' });
        setEditingTodo(null);
        fetchCustomerTodos(currentCustomerId);
    };

    // Xóa ToDo item
    const handleDeleteTodo = async (todoId) => {
        await axios.delete(`/customers/${currentCustomerId}/todos/${todoId}`);
        fetchCustomerTodos(currentCustomerId);
    };

    // Mở modal quản lý ToDo cho một khách hàng
    const openTodoModal = (customer) => {
        fetchCustomerTodos(customer._id);
    };

    return (
        <div>
            <h2 className="my-4">Customer Management</h2>

            {/* Ô tìm kiếm */}
            <CFormInput
                type="text"
                placeholder="Search customers by name..."
                value={search}
                onChange={handleSearchChange}
                className="mb-3"
            />

            {
                /*<CButton color="primary" className="mb-4" onClick={() => openModal()}>Create New Customer</CButton>*/
            }

            <h3>Existing Customers</h3>
            <CTable striped hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell>Avatar</CTableHeaderCell>
                        <CTableHeaderCell>Code</CTableHeaderCell>
                        <CTableHeaderCell>Name</CTableHeaderCell>
                        <CTableHeaderCell>DoB</CTableHeaderCell>
                        <CTableHeaderCell>Phone</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {customers && customers.length > 0 ? (
                        customers.map((customer) => (
                            <CTableRow key={customer._id}>
                                <CTableDataCell>
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/${customer.avatar ? customer.avatar : 'uploads/avatars/150.jpg'}`}
                                        alt="Avatar"
                                        width="100"
                                    />
                                </CTableDataCell>
                                <CTableDataCell>{customer.customerCode}</CTableDataCell>
                                <CTableDataCell>{customer.fullName}</CTableDataCell>
                                <CTableDataCell>{customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A'}</CTableDataCell>
                                <CTableDataCell>{customer.phone}</CTableDataCell>
                                <CTableDataCell>{customer.email}</CTableDataCell>
                                <CTableDataCell>{customer.status}</CTableDataCell>
                                <CTableDataCell>
                                    <CButton color="warning" className="me-2" onClick={() => openModal(customer)}>Edit</CButton>
                                    <CButton color="danger" onClick={() => confirmDelete(customer._id)}>Delete</CButton>
                                    <CButton color="info" onClick={() => openTodoModal(customer)}>ToDo List</CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))
                    ) : (
                        <CTableRow>
                            <CTableDataCell colSpan="8" className="text-center">No customers found.</CTableDataCell>
                        </CTableRow>
                    )}
                </CTableBody>
            </CTable>

            {/* Phân trang */}
            <CPagination>
                {[...Array(totalPages).keys()].map(page => (
                    <CPaginationItem
                        key={page + 1}
                        active={page + 1 === currentPage}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        {page + 1}
                    </CPaginationItem>
                ))}
            </CPagination>

            {/* Modal thêm/sửa khách hàng */}
            <CModal visible={showModal} onClose={closeModal} backdrop="static">
                <CModalHeader closeButton>
                    <CModalTitle>{editingCustomer ? 'Edit Customer' : 'Create New Customer'}</CModalTitle>
                </CModalHeader>
                <CModalBody onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // Ngăn chặn hành vi mặc định của phím Enter
                        handleSaveCustomer(); // Gọi hàm lưu khi nhấn Enter
                    }
                }}>
                    <CForm>
                        <CFormSelect
                            label="Customer Type"
                            value={newCustomer.customerType || ''}  // Đảm bảo không có giá trị null
                            onChange={(e) => setNewCustomer({ ...newCustomer, customerType: e.target.value })}
                        >
                            <option value="">Select Type</option>
                            <option value="SVG">Siêu Việt Group (SVG)</option>
                            <option value="HAN">Hãng (HAN)</option>
                            <option value="NPP">Nhà phân phối (NPP)</option>
                            <option value="SSI">SSI</option>
                            <option value="SMD">Đại lý phân phối (SMD)</option>
                            <option value="EUR">EUR</option>
                            <option value="OTH">Khác (OTH)</option>
                        </CFormSelect>

                        {editingCustomer && (
                            <CFormInput
                                type="text"
                                label="Customer Code"
                                value={newCustomer.customerCode || ''}  // Đảm bảo không có giá trị null
                                readOnly  // Không cho phép chỉnh sửa mã khách hàng
                            />
                        )}
                        <CFormInput
                            type="text"
                            label="Full Name"
                            value={newCustomer.fullName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                        />
                        <CFormInput
                            type="text"
                            label="Phone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        />
                        <CFormInput
                            type="text"
                            label="Email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        />
                        <CFormInput
                            type="date"
                            label="Birthday"
                            value={newCustomer.birthday ? new Date(newCustomer.birthday).toISOString().substring(0, 10) : ''}  // Đảm bảo định dạng YYYY-MM-DD
                            onChange={(e) => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                        />
                        <CFormInput type="file" label="Avatar" onChange={handleFileChange} />
                        <CFormSelect
                            label="Status"
                            value={newCustomer.status}
                            onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </CFormSelect>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={closeModal}>Close</CButton>
                    <CButton color="primary" onClick={handleSaveCustomer}>
                        {editingCustomer ? 'Save Changes' : 'Create Customer'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Modal xác nhận xóa */}
            <CModal visible={!!deleteId} onClose={() => setDeleteId(null)} backdrop="static">
                <CModalHeader closeButton>
                    <CModalTitle>Confirm Deletion</CModalTitle>
                </CModalHeader>
                <CModalBody>Are you sure you want to delete this customer?</CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeleteId(null)}>Cancel</CButton>
                    <CButton color="danger" onClick={() => handleDeleteCustomer(deleteId)}>Delete</CButton>
                </CModalFooter>
            </CModal>

            {/* Modal ToDo List */}
            <CModal visible={showTodoModal} onClose={() => setShowTodoModal(false)} backdrop="static">
                <CModalHeader closeButton>
                    <CModalTitle>ToDo List</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CTable>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Title</CTableHeaderCell>
                                <CTableHeaderCell>Due Date</CTableHeaderCell>
                                <CTableHeaderCell>Notes</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {todos && todos.length > 0 ? (
                                todos.map((todo) => (
                                    <CTableRow key={todo._id}>
                                        <CTableDataCell>{todo.title}</CTableDataCell>
                                        <CTableDataCell>{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'N/A'}</CTableDataCell>
                                        <CTableDataCell>{todo.notes}</CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="warning" onClick={() => setEditingTodo(todo)}>Edit</CButton>
                                            <CButton color="danger" onClick={() => handleDeleteTodo(todo._id)}>Delete</CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))
                            ) : (
                                <CTableRow>
                                    <CTableDataCell colSpan="4" className="text-center">No ToDo items found.</CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>
                    </CTable>
                    <CForm>
                        <CFormInput
                            type="text"
                            label="Title"
                            value={newTodo.title}
                            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                        />
                        <CFormInput
                            type="date"
                            label="Due Date"
                            value={newTodo.dueDate}
                            onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                        />
                        <CFormInput
                            type="text"
                            label="Notes"
                            value={newTodo.notes}
                            onChange={(e) => setNewTodo({ ...newTodo, notes: e.target.value })}
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowTodoModal(false)}>Close</CButton>
                    <CButton color="primary" onClick={handleSaveTodo}>
                        {editingTodo ? 'Save Changes' : 'Add ToDo'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default CustomerListPage;
