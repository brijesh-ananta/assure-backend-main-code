import React, { useState, useEffect, useRef } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { Link } from "react-router-dom";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs4/css/dataTables.bootstrap4.min.css";
import "datatables.net-bs4/js/dataTables.bootstrap4.min.js";

function ManageIssuers() {
  const [headerTitle] = useState("Test Card Issuer");
  const [environment, setEnvironment] = useState("1"); // Default to Prod ("1")
  const [issuers, setIssuers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");

  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Active: 0,
    Inactive: 0,
  });

  const { user } = useAuth();
  const userRole = user?.role;
  const tableRef = useRef(null);

  // Update environment state on change
  const handleEnvironmentChange = (e) => {
    // Destroy existing DataTable before changing environment
    if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setEnvironment(e.target.value);
    // Optionally reset status filter when environment changes:
    setStatusFilter("All");
  };

  // Handler for status filter update
  const handleStatusFilter = (status) => {
    if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setStatusFilter(status);
  };

  // Fetch issuer counts for current environment
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosToken.get(`/issuers?environment=${environment}`);
        const allIssuers = response.data;
        setStatusCounts({
          Draft: allIssuers.filter((i) => i.status === "draft").length,
          Active: allIssuers.filter((i) => i.status === "active").length,
          Inactive: allIssuers.filter((i) => i.status === "inactive").length,
        });
      } catch (error) {
        console.error("Error fetching issuer counts:", error);
      }
    };
    fetchCounts();
  }, [environment]);

  // Fetch issuers when environment or statusFilter changes
  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        let url = `/issuers?environment=${environment}`;
        if (statusFilter !== "All") {
          url += `&status=${statusFilter}`;
        }
        const response = await axiosToken.get(url);
        setIssuers(response.data);
      } catch (error) {
        console.error("Error fetching issuers:", error);
      }
    };
    fetchIssuers();
  }, [environment, statusFilter]);

  const totalCount = statusCounts.Draft + statusCounts.Active + statusCounts.Inactive;
  const statuses = [
    { label: "Draft", key: "draft", count: statusCounts.Draft },
    { label: "Active", key: "active", count: statusCounts.Active },
    { label: "Inactive", key: "inactive", count: statusCounts.Inactive },
  ];

  // Extra effect to destroy DataTable when environment changes
  useEffect(() => {
    if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
  }, [environment]);

  // Initialize DataTable after issuers update
  useEffect(() => {
    let dataTable = null;
    const initDataTable = () => {
      if (tableRef.current) {
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
          $(tableRef.current).DataTable().destroy();
        }
        if (issuers.length > 0) {
          dataTable = $(tableRef.current).DataTable({
            responsive: true,
            pageLength: 10,
            lengthMenu: [
              [10, 25, 50, -1],
              [10, 25, 50, "All"],
            ],
          });
        }
      }
    };

    const timer = setTimeout(() => {
      initDataTable();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (dataTable) {
        dataTable.destroy();
        dataTable = null;
      }
    };
  }, [issuers]);

  return (
    <>
      <Header title={headerTitle} />

      {/* Environment and Add Issuer Section */}
      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <span></span>
            <div className="d-lg-flex formcard">
              <span className="me-3 font">Environment</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value="1"
                  checked={environment === "1"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault1"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value="2"
                  checked={environment === "2"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault2"
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
            </div>

            <div className="">
              {userRole === 1 && (
                <div>
                  <Link
                    className="btn-add py-2"
                    to={`/dashboard/test-card-issuer/add-issuer`}
                  >
                    Add Issuer
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Section */}
      <section>
        <div className="notification">
          <div className="container-fluid">
            <ul className="list-unstyled d-flex stepform flex-wrap justify-content-lg-between justify-content-center gap-4 mb-lg-5 col-lg-6">
              
              {statuses.map((status) => (
                <li
                  key={status.key}
                  className="d-flex justify-content-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
                  style={{ cursor: "pointer" }}
                >
                  <span className={`totavalue ${statusFilter === status.key ? "active-value" : ""}`}>
                    {status.count}
                  </span>
                  <p>{status.label}</p>
                </li>
              ))}
              <li
                key="all"
                className="d-flex justify-content-center flex-column text-center gap-2"
                onClick={() => handleStatusFilter("All")}
                style={{ cursor: "pointer" }}
              >
                <span className={`totavalue ${statusFilter === "All" ? "active-value" : ""}`}>
                  {totalCount}
                </span>
                <p>Total</p>
              </li>
            </ul>
          </div>

          {/* Wrap the table in a div with a key including both environment and statusFilter */}
          <div className="container-fluid" key={`${environment}-${statusFilter}`}>
            <div className="table-responsive">
              <table
                ref={tableRef}
                id="auditTable"
                className="table table-bordered border row-border border-3 table-hover"
              >
                <thead className="table-theme theme_noti">
                  <tr>
                    <th scope="col">Request ID</th>
                    <th scope="col">Status</th>
                    <th scope="col">Issuer Name</th>
                    <th scope="col">BIN</th>
                    <th scope="col">BIN Product</th>
                    <th scope="col">Pan Length</th>
                    <th scope="col">IISC</th>
                    <th scope="col">Test Card Type</th>
                    <th scope="col">Created By</th>
                    <th scope="col">Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {issuers && issuers.length > 0 ? (
                    issuers.map((issuer) => (
                      <tr key={issuer.id}>
                        <td>
                          <Link
                            to="/dashboard/test-card-issuer/view-issuer"
                            state={{
                              id: issuer.id,
                              environment: issuer.environment,
                              issuer: issuer,
                            }}
                          >
                            {issuer.issuer_id}
                          </Link>
                        </td>
                        <td>{issuer.status.toUpperCase()}</td>
                        <td>{issuer.issuer_name}</td>
                        <td>{issuer.bin}</td>
                        <td>{issuer.binProduct}</td>
                        <td>{issuer.pan_length}</td>
                        <td>{issuer.iisc}</td>
                        <td>{issuer.test_card_type}</td>
                        <td>{issuer.createdBy}</td>
                        <td>{new Date(issuer.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No issuers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Sidebar />
      <Footer />
    </>
  );
}

export default ManageIssuers;
