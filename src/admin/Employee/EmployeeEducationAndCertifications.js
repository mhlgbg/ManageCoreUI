import React, { useState, useEffect } from 'react';
import {
    CButton,
    CForm,
    CFormLabel,
    CFormInput,
    CRow,
    CCol,
    CTable,
    CTableBody,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
} from '@coreui/react';
import axios from '../../api/api';

const EmployeeEducationAndCertifications = ({ employeeId, educationAndCertification }) => {
    const [formValues, setFormValues] = useState(educationAndCertification || {});
    const [certifications, setCertifications] = useState(educationAndCertification?.certifications || []);
    const [newCertification, setNewCertification] = useState({ name: '', issuedBy: '', issueDate: '', fileKey: '' });
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchEducationAndCertifications();
    }, []);

    const fetchEducationAndCertifications = async () => {
        try {
            const response = await axios.get(`/employees/${employeeId}/educationAndCertifications`);
            setFormValues(response.data);
            setCertifications(response.data.certifications || []);
        } catch (error) {
            console.error('Error fetching education and certifications:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleCertificationChange = (e) => {
        const { name, value } = e.target;
        setNewCertification((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const addCertification = async () => {
        try {
            const response = await axios.post(`/employees/${employeeId}/educationAndCertifications/certifications`, newCertification);
            setCertifications([...certifications, response.data]);
            setNewCertification({ name: '', issuedBy: '', issueDate: '', fileKey: '' });
            setShowModal(false);
        } catch (error) {
            console.error('Error adding certification:', error);
            alert('Không thể thêm chứng chỉ.');
        }
    };

    const removeCertification = async (index, certificationId) => {
        try {
            await axios.delete(`/employees/${employeeId}/educationAndCertifications/certifications/${certificationId}`);
            const updatedCertifications = certifications.filter((_, i) => i !== index);
            setCertifications(updatedCertifications);
        } catch (error) {
            console.error('Error removing certification:', error);
            alert('Không thể xóa chứng chỉ.');
        }
    };

    const handleSaveEducationAndCertifications = async () => {
        try {
            await axios.put(`/employees/${employeeId}/educationAndCertifications`, {
                ...formValues,
                certifications,
            });
            alert('Cập nhật thành công.');
        } catch (error) {
            console.error('Error updating education and certifications:', error);
            alert('Có lỗi xảy ra khi lưu.');
        }
    };

    return (
        <div>
            <h5>Quản lý bằng cấp và chứng chỉ</h5>
            <CForm>
                <CRow className="mb-3">
                    <CCol sm="2">
                        <CFormLabel>Bằng cấp cao nhất</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="highestDegree"
                            value={formValues.highestDegree || ''}
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol sm="2">
                        <CFormLabel>Cơ sở đào tạo</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="institution"
                            value={formValues.institution || ''}
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol sm="2">
                        <CFormLabel>Ngành học</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="major"
                            value={formValues.major || ''}
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>

                <CRow className="mb-3">
                    <CCol sm="2">
                        <CFormLabel>Key file quyết định</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="fileKey"
                            value={formValues.fileKey || ''}
                            onChange={handleInputChange}
                        />
                        {formValues.fileKey && (
                            <CButton
                                className="mt-2"
                                color="info"
                                href={`${import.meta.env.VITE_API_BASE_URL}/api/uploaded-files/${formValues.fileKey}`}
                                target="_blank"
                            >
                                View/Download
                            </CButton>
                        )}
                    </CCol>
                </CRow>

                <h6>Danh sách chứng chỉ</h6>
                <CTable striped hover>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Tên chứng chỉ</CTableHeaderCell>
                            <CTableHeaderCell>Cơ quan cấp</CTableHeaderCell>
                            <CTableHeaderCell>Ngày cấp</CTableHeaderCell>
                            <CTableHeaderCell>Key file</CTableHeaderCell>
                            <CTableHeaderCell>Thao tác</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {certifications.map((cert, index) => (
                            <CTableRow key={cert._id}>
                                <CTableDataCell>{cert.name}</CTableDataCell>
                                <CTableDataCell>{cert.issuedBy}</CTableDataCell>
                                <CTableDataCell>{new Date(cert.issueDate).toLocaleDateString()}</CTableDataCell>
                                <CTableDataCell>{cert.fileKey ? (
                                        <a
                                            href={`${import.meta.env.VITE_API_BASE_URL}/api/uploaded-files/${cert.fileKey}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View/Download
                                        </a>
                                    ) : (
                                        'N/A'
                                    )}</CTableDataCell>
                                <CTableDataCell>
                                    <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() => removeCertification(index, cert._id)}
                                    >
                                        Xóa
                                    </CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>

                <CButton color="primary" className="mt-3" onClick={() => setShowModal(true)}>
                    Thêm chứng chỉ
                </CButton>
                <CButton color="success" className="ms-3 mt-3" onClick={handleSaveEducationAndCertifications}>
                    Lưu
                </CButton>
            </CForm>

            {/* Modal thêm chứng chỉ */}
            <CModal visible={showModal} onClose={() => setShowModal(false)} backdrop="static">
                <CModalHeader>
                    <CModalTitle>Thêm chứng chỉ</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className="mb-3">
                        <CCol sm="3">
                            <CFormLabel>Tên chứng chỉ</CFormLabel>
                        </CCol>
                        <CCol sm="9">
                            <CFormInput
                                type="text"
                                name="name"
                                value={newCertification.name}
                                onChange={handleCertificationChange}
                            />
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol sm="3">
                            <CFormLabel>Cơ quan cấp</CFormLabel>
                        </CCol>
                        <CCol sm="9">
                            <CFormInput
                                type="text"
                                name="issuedBy"
                                value={newCertification.issuedBy}
                                onChange={handleCertificationChange}
                            />
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol sm="3">
                            <CFormLabel>Ngày cấp</CFormLabel>
                        </CCol>
                        <CCol sm="9">
                            <CFormInput
                                type="date"
                                name="issueDate"
                                value={newCertification.issueDate}
                                onChange={handleCertificationChange}
                            />
                        </CCol>
                    </CRow>
                    <CRow className="mb-3">
                        <CCol sm="3">
                            <CFormLabel>Key file</CFormLabel>
                        </CCol>
                        <CCol sm="9">
                            <CFormInput
                                type="text"
                                name="fileKey"
                                value={newCertification.fileKey}
                                onChange={handleCertificationChange}
                            />
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </CButton>
                    <CButton color="primary" onClick={addCertification}>
                        Thêm
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default EmployeeEducationAndCertifications;
