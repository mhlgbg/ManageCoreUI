import React, { useState, useEffect } from 'react';
import axios from '../../api/api';
import { useParams } from 'react-router-dom';
import EmployeePersonalInfo from './EmployeePersonalInfo';
import EmployeeJobInfo from './EmployeeJobInfo';
// Import các khối khác khi cần thêm vào
import './EmployeeForm.css';
import { CButton } from '@coreui/react';
import EmployeePayrollInfo from './EmployeePayrollInfo';
import EmployeeEducationAndCertifications from './EmployeeEducationAndCertifications';
import EmployeeWorkExperience from './EmployeeWorkExperience';

const EmployeeForm = () => {
    const { employeeId } = useParams();
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const fetchEmployeeData = async () => {
        try {
            const response = await axios.get(`/employees/${employeeId}`);
            setEmployee(response.data.data);
            console.log('personalInfo ', employee);

        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };

    return (
        <div className="employee-form-container">
            <div className="section-container">
                <div className="section-header">Thông tin cá nhân</div>
                <div className="section-content">
                    {employee && <EmployeePersonalInfo employeeId={employeeId} personalInfo={employee.personalInfo} />}
                </div>
            </div>

            <div className="section-container">
                <div className="section-header">Thông tin công việc</div>
                <div className="section-content">
                    {employee && <EmployeeJobInfo employeeId={employeeId} jobInfo={employee.jobInfo} />}
                </div>
            </div>
            <div className="section-container">
                <div className="section-header">Thông tin bảo hiểm và lương</div>
                <div className="section-content">
                    <EmployeePayrollInfo employeeId={employeeId} payrollInfo={employee?.payrollInfo} />
                </div>
            </div>
            <div className="section-container">
                <div className="section-header">Bằng cấp và chứng chỉ</div>
                <div className="section-content">
                    <EmployeeEducationAndCertifications
                        employeeId={employeeId}
                        educationAndCertification={employee?.educationAndCertification}
                    />
                </div>
            </div>
            <div className="section-container">
                <div className="section-header">Kinh nghiệm làm việc</div>
                <div className="section-content">
                    <EmployeeWorkExperience
                        employeeId={employeeId}
                        workExperience={employee?.workExperience}
                    />
                </div>
            </div>
        </div>
    );

};

export default EmployeeForm;
