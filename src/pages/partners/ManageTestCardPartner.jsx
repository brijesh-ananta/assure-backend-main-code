import React, { useEffect, useState, useRef } from "react";
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

function ManageTestCardPartner() {
  const [headerTitle] = useState("Testing Partner");
  const [partners, setPartners] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Active: 0,
    Inactive: 0,
  });

  const { user } = useAuth();
  const userRole = user?.role;
  const tableRef = useRef(null);

  // Handler for status filter update
  const handleStatusFilter = (status) => {
    // Destroy any existing DataTable instance on the tableRef element
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }
    setStatusFilter(status);
  };

  // Fetch counts for all statuses on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosToken.get(`/partners`);
        const allPartners = response.data.partners || [];
        setStatusCounts({
          Draft: allPartners.filter((p) => p.status === "draft").length,
          Active: allPartners.filter((p) => p.status === "active").length,
          Inactive: allPartners.filter((p) => p.status === "inactive").length,
        });
      } catch (error) {
        console.error("Error fetching partner counts:", error);
      }
    };
    fetchCounts();
  }, []);

  // Fetch filtered partners when statusFilter changes
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        let url = `/partners`;
        if (statusFilter !== "All") {
          url += `?status=${statusFilter}`;
        }
        const response = await axiosToken.get(url);
        setPartners(response.data.partners || []);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    fetchPartners();
  }, [statusFilter]);

  // Initialize DataTable when partners data updates.
  useEffect(() => {
    let dataTable = null;
    const initDataTable = () => {
      if (tableRef.current) {
        if ($.fn.DataTable.isDataTable(tableRef.current)) {
          $(tableRef.current).DataTable().destroy();
        }
        if (partners.length > 0) {
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
  }, [partners]);

  // Define status filter options
  const statuses = [
    { label: "Draft", key: "draft", count: statusCounts.Draft },
    { label: "Active", key: "active", count: statusCounts.Active },
    { label: "Inactive", key: "inactive", count: statusCounts.Inactive },
  ];

  return (
    <>
      <Header title={headerTitle} />
      {userRole === 1 && (
        <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
          <div className="container-fluid">
            <div className="d-lg-flex align-items-center justify-content-between w-100">
              <span></span>

              <div>
                <Link
                  className="btn-add py-2"
                  to={`/dashboard/testing-partner/add-partner`}
                >
                  Add Testing Partner
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      <section>
        <div className="notification">
          <div className="container-fluid">
            {/* Status summary */}
            <ul className="list-unstyled d-flex stepform flex-wrap justify-content-lg-between justify-content-center gap-4 mb-lg-5 col-lg-6">
              {statuses.map((status) => (
                <li
                  key={status.key}
                  className="d-flex justify-content-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
                  style={{ cursor: "pointer" }}
                >
                  <span
                    className={`totavalue ${statusFilter === status.key ? "active-value" : ""}`}
                  >
                    {status.count}
                  </span>
                  <p>{status.label}</p>
                </li>
              ))}
              <li
                className="d-flex justify-content-center flex-column text-center gap-2"
                onClick={() => handleStatusFilter("All")}
                style={{ cursor: "pointer" }}
              >
                <span
                  className={`totavalue ${statusFilter === "All" ? "active-value" : ""}`}
                >
                  {statusCounts.Draft +
                    statusCounts.Active +
                    statusCounts.Inactive}
                </span>
                <p>All</p>
              </li>
            </ul>
          </div>
          <div className="container-fluid">
            <div className="table-responsive">
              {/* Use key prop based on statusFilter to force remount on filter change */}
              <table
                key={statusFilter}
                id="notificationTable"
                ref={tableRef}
                className="table table-bordered border row-border border-3 table-hover"
              >
                <thead className="table-theme theme_noti">
                  <tr>
                    <th>Partner ID</th>
                    <th>Status</th>
                    <th>Partner Name</th>
                    <th>Created By</th>
                    <th>Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {partners && partners.length > 0 ? (
                    partners.map((partner) => (
                      <tr key={partner.id}>
                        <td>
                          <Link
                            to="/dashboard/testing-partner/edit-partner"
                            state={{
                              partnerData: partner,
                            }}
                          >
                            {partner.partner_id}
                          </Link>
                        </td>
                        <td>{partner.status.toUpperCase()}</td>
                        <td>{partner.partner_name}</td>
                        <td>{partner.createdBy}</td>
                        <td>
                          {new Date(partner.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No partners found.
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

export default ManageTestCardPartner;
