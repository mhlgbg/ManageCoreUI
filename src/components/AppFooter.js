import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="#" target="_blank" rel="noopener noreferrer">
        {import.meta.env.VITE_TITLE1}
        </a>
        <span className="ms-1">&copy; {import.meta.env.VITE_TITLE2}</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="#" target="_blank" rel="noopener noreferrer">
        {import.meta.env.VITE_TITLE3}
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
