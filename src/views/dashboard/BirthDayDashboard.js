import React, { useEffect, useState } from 'react'
import axios from '../../api/api';
import {
  CAvatar,
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilBirthdayCake, cilCalendar } from '@coreui/icons'

const BirthDayDashboard = () => {
  const [reportData, setReportData] = useState(null)
  const today = new Date().toISOString().split('T')[0] // Format date as 'YYYY-MM-DD'

  useEffect(() => {
    // Fetch birthday report data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get(`/customers/birthday-report?date=${today}`)
        setReportData(response.data)
      } catch (error) {
        console.error('Error fetching birthday report:', error)
      }
    }

    fetchData()
  }, [today])

  if (!reportData) {
    return <p>Loading...</p>
  }

  const formattedToday = new Date().toLocaleDateString('vi-VN')
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')

  return (
    <>
      {/* Total Customers Card */}
      <CCard className="mb-4">
        <CCardBody className="text-center bg-info text-white">
          <CIcon icon={cilUser} size="4xl" />
          <h2>{reportData.totalCustomers} KHÁCH HÀNG</h2>
          <p>Tổng số đang có trong hệ thống</p>
        </CCardBody>
      </CCard>

      {/* Summary Cards */}
      <CRow>
        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CIcon icon={cilBirthdayCake} size="4xl" />
              <h5>{formattedToday}</h5>
              <p>Sinh nhật hôm nay: {reportData.today}</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CIcon icon={cilCalendar} size="4xl" />
              <h5>7 ngày</h5>
              <p>Sinh nhật trong 07 ngày tiếp: {reportData.next7Days}</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol sm={4}>
          <CCard className="text-center">
            <CCardBody>
              <CIcon icon={cilCalendar} size="4xl" />
              <h5>Trong 30 ngày</h5>
              <p>Sinh nhật trong 30 ngày tiếp: {reportData.next30Days}</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Birthday List */}
      <CRow className="mt-4">
        {reportData.customersNext7Days.map((customer) => (
          <CCol key={customer._id} sm={4}>
            <CCard className="mb-4 text-center">
              <CCardBody>
                <CAvatar size="lg" src={`${import.meta.env.VITE_API_BASE_URL}/${customer.avatar ? customer.avatar : 'uploads/avatars/150.jpg'}`} />
                <h5>Chúc mừng sinh nhật {customer.fullName}</h5>
                <p>{new Date(customer.birthday).toLocaleDateString('vi-VN')}</p>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </>
  )
}

export default BirthDayDashboard
