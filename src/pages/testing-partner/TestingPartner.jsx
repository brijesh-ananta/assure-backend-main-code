import { useState, useEffect, useMemo } from "react";
import CustomTable from "../../components/shared/table/CustomTable";
import { Link, useNavigate } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import { ToastContainer } from "react-toastify";

const TestingPartnerList = () => {
  const { user } = useAuth();
  const userRole = user.role;
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Active: 0,
    Inactive: 0,
  });
  const [partners, setPartners] = useState([]);

  const statuses = [
    { label: "DRAFT", key: "draft", count: statusCounts.Draft },
    { label: "Active", key: "active", count: statusCounts.Active },
    { label: "Inactive", key: "inactive", count: statusCounts.Inactive },
  ];

  const navigate = useNavigate();

  const handleRowClick = (rowData) => {
    navigate(`/dashboard/testing-partner/edit/${rowData.pt_id}`, {
      state: { partnerData: rowData },
    });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosToken.get("/partners");
        const allPartners = response.data.partners || [];

        setStatusCounts({
          Draft: allPartners.filter((p) => p.status === "draft").length,
          Active: allPartners.filter((p) => p.status === "active").length,
          Inactive: allPartners.filter((p) => p.status === "inactive").length,
        });
      } catch (error) {
        console.error("Error fetching status counts:", error);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        let url = "/partners";
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

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "partner_id",
          label: "Partner ID",
          sortable: true,
          width: "120px",
          renderCell: (item) => (
            <Link
              to={`/dashboard/testing-partner/edit/${item.pt_id}`}
              state={{
                partnerData: item,
              }}
            >
              {item.partner_id}
            </Link>
          ),
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          width: "120px",
        },
        {
          key: "partner_name",
          label: "Testing Partner Name",
          sortable: true,
          width: "180px",
        },
        {
          key: "createdBy",
          label: "Created By",
          sortable: true,
          width: "150px",
        },
        {
          key: "created_at",
          label: "Date Created",
          sortable: true,
          width: "140px",
          renderCell: (item) => new Date(item.created_at).toLocaleDateString(),
        },
      ],
      options: {
        isServerSide: false,
        sortConfig: {
          initialSortColumn: "created_at",
          initialSortDirection: "desc",
        },
        pagination: {
          initialEntriesPerPage: 10,
          pageOptions: [10, 25, 50, 100],
        },
        responsive: {
          breakpoint: "768px",
          minWidth: "600px",
        },
      },
      styles: {
        header: {
          backgroundColor: "#f8f9fa",
          borderBottom: "4px solid #dee2e6",
        },
        row: {
          striped: true,
          hover: true,
        },
      },
    }),
    []
  );

  return (
    <>
      {(userRole === 1 || userRole === 4) && (
        <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
          <div className="container-fluid">
            <div className="d-lg-flex align-items-center justify-content-end w-100">
              <Link
                className="btn save-btn"
                to={`/dashboard/testing-partner/add`}
              >
                Add Testing Partner
              </Link>
            </div>
          </div>
        </div>
      )}

      <section>
        <div className="notification">
          <div className="container-fluid">
            <ul className="w-100 list-unstyled d-flex justify-content-center stepform gap-10 mb-lg-5">
              {statuses.map((status) => (
                <li
                  key={status.key}
                  role="button"
                  tabIndex={0}
                  className="d-flex justify-content-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleStatusFilter(status.key);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span
                    className={`card-custom-shadow-1 totavalue ${
                      statusFilter === status.key ? "active-value" : ""
                    }`}
                  >
                    {status.count}
                  </span>
                  <p>{status.label}</p>
                </li>
              ))}
              <li
                key="all"
                role="button"
                tabIndex={0}
                className="d-flex justify-content-center flex-column text-center gap-2"
                onClick={() => handleStatusFilter("All")}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleStatusFilter("All");
                }}
                style={{ cursor: "pointer" }}
              >
                <span
                  className={`card-custom-shadow-1 totavalue ${
                    statusFilter === "All" ? "active-value" : ""
                  }`}
                >
                  {Object.values(statusCounts).reduce(
                    (total, count) => total + count,
                    0
                  )}
                </span>
                <p>Total</p>
              </li>
            </ul>
          </div>

          <div className="mb-lg-5 mb-3 table-responsive">
            <CustomTable
              options={tableConfig.options}
              styles={tableConfig.styles}
              data={partners}
              columns={tableConfig.columns}
              onRowClick={handleRowClick}
              emptyState={
                <div className="text-center p-5 font fa-1x">
                  No Testing Partner found.
                </div>
              }
            />
          </div>
        </div>
      </section>

       <ToastContainer
        position="bottom-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

export default TestingPartnerList;
