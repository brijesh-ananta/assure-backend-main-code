import React from 'react'
import axiosToken from '../../utils/axiosToken'

function Steps({requestId, environment, terminalType}) {
  return (
    <section>
        <div className="container-fluid py-lg-3 py-2">
          <div className="step-form border-bottom1">
            <ul className="d-flex justify-content-lg-between justify-content-center align-items-center flex-wrap list-unstyled gap-3 mb-lg-4">
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span className="activebg"></span>Requestor Info
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Test Information
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Terminal Details
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Shipping Details
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Submitted
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Approved
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Assigned
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Shipped
              </li>
            </ul>
          </div>
        </div>
      </section>
  )
}

export default Steps