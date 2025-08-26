import { useCallback, useEffect, useState } from "react";
import axiosToken from "../../utils/axiosToken";
import { Link } from "react-router-dom";
import CustomTable from "../../components/shared/table/CustomTable";

function ManageAuditTrails() {
  const [auditTrails, setAuditTrails] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serverState, setServerState] = useState({
    searchTerm: "",
    entriesPerPage: 10,
    currentPage: 1,
    sortColumn: "",
    sortDirection: "asc",
  });

  // Columns config from above
  const columns = [
    {
      key: "Trail_ID",
      label: "Trail ID",
      sortable: true,
      minWidth: "100px",
      renderCell: (row) => (
        <Link to={`/audit-trails/view/${row.id}`} state={{ auditTrail: row }}>
          {row.Trail_ID}
        </Link>
      ),
    },
    {
      key: "action_date",
      label: "Date",
      sortable: true,
      renderCell: (row) => new Date(row.action_time).toLocaleDateString(),
      minWidth: "120px",
    },
    {
      key: "action_time",
      label: "Time",
      sortable: false,
      renderCell: (row) => new Date(row.action_time).toLocaleTimeString(),
      minWidth: "120px",
    },
    { key: "table_name", label: "Application Name", sortable: true },
    { key: "action", label: "Description", sortable: false },
    { key: "performed_by_name", label: "User", sortable: true },
  ];

  // Fetch data from server
  useEffect(() => {
    setLoading(true);
    const { currentPage, entriesPerPage, searchTerm, sortColumn, sortDirection } = serverState;
    const params = {
      page: currentPage,
      limit: entriesPerPage,
      search: searchTerm,
      sort: sortColumn,
      dir: sortDirection,
    };

    axiosToken
      .get("/audit-trails", { params })
      .then((res) => {
        setAuditTrails(res.data.data || []);
        setTotal(res.data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setAuditTrails([]);
        setTotal(0);
        setLoading(false);
      });
  }, [serverState]);

  const handleStateChange = useCallback((state) => {
    setServerState((prev) => ({
      ...prev,
      ...state,
      currentPage: state.currentPage || 1,
    }));
  }, [])

  return (
    <section>
      <div className="notification">
        <div className="container-fluid">
          <CustomTable
            data={auditTrails}
            columns={columns}
            totalItems={total}
            isServerSide={true}
            onStateChange={handleStateChange}
            initialEntriesPerPage={10}
            emptyState={loading ? "Loading..." : "No audit trails found."}
            showSearch={false}
          />
        </div>
      </div>
    </section>
  );
}

export default ManageAuditTrails;
