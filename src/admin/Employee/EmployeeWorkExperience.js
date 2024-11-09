import React, { useState } from 'react';
import { CButton, CForm, CFormLabel, CFormInput, CRow, CCol, CTable, CTableBody, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react';
import axios from '../../api/api';

const EmployeeWorkExperience = ({ employeeId, workExperience }) => {
    const [experiences, setExperiences] = useState(workExperience || []);
    const [newExperience, setNewExperience] = useState({
        companyName: '',
        position: '',
        duration: '',
        achievements: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExperience({ ...newExperience, [name]: value });
    };

    const handleAddExperience = async () => {
        try {
            // Thêm kinh nghiệm mới vào DB
            const response = await axios.post(`/employees/${employeeId}/workExperience`, newExperience);
            const savedExperience = response.data.data;

            // Cập nhật danh sách sau khi thêm
            setExperiences([...experiences, savedExperience]);
            setNewExperience({
                companyName: '',
                position: '',
                duration: '',
                achievements: '',
            });
        } catch (error) {
            console.error('Error adding work experience:', error);
        }
    };

    const handleRemoveExperience = async (index, experienceId) => {
        try {
            await axios.delete(`/employees/${employeeId}/workExperience/${experienceId}`);
            setExperiences(experiences.filter((_, i) => i !== index));
        } catch (error) {
            console.error('Error removing work experience:', error);
        }
    };

    return (
        <div>
            <h5>Kinh nghiệm làm việc</h5>
            <CTable striped hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell>Tên công ty</CTableHeaderCell>
                        <CTableHeaderCell>Vị trí</CTableHeaderCell>
                        <CTableHeaderCell>Thời gian</CTableHeaderCell>
                        <CTableHeaderCell>Thành tích</CTableHeaderCell>
                        <CTableHeaderCell>Thao tác</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {experiences.map((exp, index) => (
                        <CTableRow key={exp._id}>
                            <CTableDataCell>{exp.companyName}</CTableDataCell>
                            <CTableDataCell>{exp.position}</CTableDataCell>
                            <CTableDataCell>{exp.duration}</CTableDataCell>
                            <CTableDataCell>{exp.achievements}</CTableDataCell>
                            <CTableDataCell>
                                <CButton color="danger" onClick={() => handleRemoveExperience(index, exp._id)}>Xóa</CButton>
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>

            <h6>Thêm kinh nghiệm mới</h6>
            <CForm className="mb-3">
                <CRow className="align-items-center">
                    <CCol sm="2">
                        <CFormLabel>Tên công ty</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="companyName"
                            value={newExperience.companyName}
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>
                <CRow className="align-items-center mt-2">
                    <CCol sm="2">
                        <CFormLabel>Vị trí</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="position"
                            value={newExperience.position}
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>
                <CRow className="align-items-center mt-2">
                    <CCol sm="2">
                        <CFormLabel>Thời gian</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="duration"
                            placeholder="Jan 2018 - Dec 2020"
                            value={newExperience.duration}
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>
                <CRow className="align-items-center mt-2">
                    <CCol sm="2">
                        <CFormLabel>Thành tích</CFormLabel>
                    </CCol>
                    <CCol sm="10">
                        <CFormInput
                            type="text"
                            name="achievements"
                            value={newExperience.achievements}
                            onChange={handleInputChange}
                        />
                    </CCol>
                </CRow>
                <CButton color="secondary" className="mt-3" onClick={handleAddExperience}>
                    Thêm vào danh sách
                </CButton>
            </CForm>
        </div>
    );
};

export default EmployeeWorkExperience;
