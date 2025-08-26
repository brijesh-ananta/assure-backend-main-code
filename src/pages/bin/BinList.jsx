import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import binService from "../../services/bin";

// Import icons (assuming lucide-react is installed or you have equivalents)
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../../components/shared/table/style.css"; // Re-import the custom table styles
import { environmentMapping } from "../../utils/constent";

const BinList = () => {
  const navigate = useNavigate();

  const [environment, setEnvironment] = useState("1");
  const [cardType, setCardType] = useState("Pos");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Active: 0,
    Inactive: 0,
  });
  const [allBins, setAllBins] = useState([]); // Store all fetched bins for client-side filtering
  const [loading, setLoading] = useState(true);

  // States for client-side table logic (replicated from CustomTable's typical internal logic)
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("bin_id"); // Default sort column
  const [sortDirection, setSortDirection] = useState("desc"); // Default sort direction

  // Replicate icons from CustomTable if used for sorting/pagination
  const icons = {
    sortAsc: ChevronUp,
    sortDesc: ChevronDown,
    sortDefault: ChevronDown,
    firstPage: ChevronsLeft,
    lastPage: ChevronsRight,
    prevPage: ChevronLeft,
    nextPage: ChevronRight,
  };

  // --- Data Fetching ---
  const fetchAllBins = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all bins, as filtering will be done client-side
      const data = await binService.getBinsByEnv(environment, "All", cardType);
      setAllBins(data || []);
    } catch (error) {
      console.error("Error fetching all bins:", error);
      setAllBins([]);
    }
    setLoading(false);
  }, [environment, cardType]); // Only re-fetch if environment or cardType changes

  useEffect(() => {
    fetchAllBins();
  }, [fetchAllBins]);

  // Fetch status counts (still uses a separate fetch if you want counts based on all data)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const allFetchedBins = await binService.getBinsByEnv(
          environment,
          "All",
          cardType
        );
        setStatusCounts({
          Draft: allFetchedBins.filter((b) => b.bin_status === "draft").length,
          Active: allFetchedBins.filter((b) => b.bin_status === "active")
            .length,
          Inactive: allFetchedBins.filter((b) => b.bin_status === "inactive")
            .length,
        });
      } catch {
        setStatusCounts({ Draft: 0, Active: 0, Inactive: 0 });
      }
    };
    fetchCounts();
  }, [environment, cardType]);

  // --- Filtering and Sorting Logic (replicated from CustomTable's internal memoization) ---
  const filteredAndSortedData = useMemo(() => {
    let result = [...allBins];

    // Status Filter
    if (statusFilter !== "All") {
      result = result.filter(
        (item) => item.bin_status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search Term Filter (simplified for common fields)
    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.bin_id?.toString().toLowerCase().includes(searchValue) ||
          item.bin_status?.toLowerCase().includes(searchValue) ||
          item.bin?.toLowerCase().includes(searchValue) ||
          item.pan_length?.toString().toLowerCase().includes(searchValue) ||
          item.bin_product?.toLowerCase().includes(searchValue) ||
          item.card_type?.toLowerCase().includes(searchValue) ||
          item.issuer_unique_id?.toLowerCase().includes(searchValue) ||
          item.issuer_name?.toLowerCase().includes(searchValue) ||
          item.created_by_name?.toLowerCase().includes(searchValue) ||
          item.env?.toLowerCase().includes(searchValue)
      );
    }

    // Sorting
    const columns = [
      // Define columns for sorting logic
      { key: "bin_id", sortable: true },
      {
        key: "bin_status",
        sortable: true,
        accessor: (item) => item.bin_status,
      },
      { key: "bin", sortable: true },
      { key: "pan_length", sortable: true },
      {
        key: "bin_product",
        sortable: true,
        accessor: (item) => item.bin_product,
      },
      { key: "card_type", sortable: true },
      {
        key: "issuer_unique_id",
        sortable: true,
        accessor: (item) => item.issuer_unique_id,
      },
      {
        key: "issuer_name",
        sortable: true,
        accessor: (item) => item.issuer_name,
      },
      {
        key: "created_by_name",
        sortable: true,
        accessor: (item) => item.created_by_name,
      },
      { key: "env", sortable: true },
    ];

    if (sortColumn) {
      const colDef = columns.find((col) => col.key === sortColumn);

      result.sort((a, b) => {
        const aValue = colDef?.accessor
          ? colDef.accessor(a)?.toString().toLowerCase() || ""
          : a[sortColumn]?.toString().toLowerCase() || "";
        const bValue = colDef?.accessor
          ? colDef.accessor(b)?.toString().toLowerCase() || ""
          : b[sortColumn]?.toString().toLowerCase() || "";

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      });
    }

    return result;
  }, [allBins, searchTerm, sortColumn, sortDirection, statusFilter]);

  // Pagination Logic
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredAndSortedData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAndSortedData.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  // --- Handlers for Filters/Sort/Pagination ---
  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
    setCardType("Pos"); // Reset card type on env change
    setCurrentPage(1); // Reset pagination
  };

  const handleCardTypeChange = (e) => {
    setCardType(e.target.value);
    setCurrentPage(1); // Reset pagination
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset pagination
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset pagination on sort
  };

  const renderSortIcon = (columnKey) => {
    if (sortColumn !== columnKey) {
      return <icons.sortDefault className="inline-block ml-1 w-4 h-4" />;
    }
    return sortDirection === "asc" ? (
      <icons.sortAsc className="inline-block ml-1 w-4 h-4" />
    ) : (
      <icons.sortDesc className="inline-block ml-1 w-4 h-4" />
    );
  };

  const statusesList = [
    { label: "Draft", key: "Draft", count: statusCounts.Draft },
    { label: "Active", key: "Active", count: statusCounts.Active },
    { label: "Inactive", key: "Inactive", count: statusCounts.Inactive },
  ];

  // Column definitions for rendering headers and cells
  const tableColumns = useMemo(
    () => [
      {
        key: "bin_id",
        label: "Bin ID",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/bin-list/view/${item.bin_id}`}
            style={{ cursor: "pointer", color: "#399eb8" }}
          >
            {console.log(item)}
            {item.bin_unique_id}
          </Link>
        ),
      },
      {
        key: "bin_status",
        label: "Status",
        sortable: true,
        renderCell: (item) => item.bin_status,
      },
      {
        key: "bin",
        label: "Bin",
        sortable: true,
        renderCell: (item) => item.bin,
      },
      {
        key: "pan_length",
        label: "PAN Length",
        sortable: true,
        renderCell: (item) => item.pan_length,
      },
      {
        key: "bin_product",
        label: "Product",
        sortable: true,
        renderCell: (item) => item.bin_product,
      },
      {
        key: "card_type",
        label: "Card Type",
        sortable: true,
        renderCell: (item) => item.card_type,
      },
      {
        key: "issuer_unique_id",
        label: "Issuer ID",
        sortable: true,
        renderCell: (item) => item.issuer_unique_id,
      },
      {
        key: "issuer_name",
        label: "Issuer Name",
        sortable: true,
        renderCell: (item) => item.issuer_name,
      },
      {
        key: "created_by_name",
        label: "Created By",
        sortable: true,
        renderCell: (item) => item.created_by_name,
      },
      {
        key: "env",
        label: "Env",
        sortable: true,
        renderCell: (item) => environmentMapping[item.env],
      },
    ],
    []
  );

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container d-lg-flex align-items-center justify-content-between w-100">
          {/* Environment Radio Buttons */}
          <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
            <span className="me-3 font">Environment</span>
            <div className="form-check me-3 d-flex gap-2 align-items-center">
              <input
                className="form-check-input"
                type="radio"
                name="environment"
                value={"1"}
                checked={environment === "1"}
                onChange={handleEnvironmentChange}
                id="flexRadioDefault1"
              />
              <label className="form-check-label" htmlFor="flexRadioDefault1">
                Prod
              </label>
            </div>
            <div className="form-check me-3 d-flex gap-2 align-items-center">
              <input
                className="form-check-input"
                type="radio"
                name="environment"
                value={"2"}
                checked={environment === "2"}
                onChange={handleEnvironmentChange}
                id="flexRadioDefault2"
              />
              <label className="form-check-label" htmlFor="flexRadioDefault2">
                QA
              </label>
            </div>
          </div>

          {/* Card Type Radio Buttons */}
          <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
            <span className="me-3 font">Card Type</span>
            <div className="form-check me-3 d-flex gap-2 align-items-center">
              <input
                className="form-check-input"
                type="radio"
                name="cardType"
                value={"Pos"}
                checked={cardType === "Pos" || environment === "2"}
                onChange={handleCardTypeChange}
                id="cardType1"
              />
              <label className="form-check-label" htmlFor="cardType1">
                POS
              </label>
            </div>
            <div className="form-check d-flex gap-2 align-items-center">
              <input
                className="form-check-input"
                type="radio"
                name="cardType"
                value={"Ecomm"}
                checked={cardType === "Ecomm" && environment !== "2"}
                onChange={handleCardTypeChange}
                id="cardType2"
                disabled={environment === "2"}
              />
              <label className="form-check-label" htmlFor="cardType2">
                Ecomm
              </label>
            </div>
          </div>

          {/* Add Bin Button */}
          <button
            className="btn save-btn"
            onClick={() =>
              navigate(
                `/dashboard/bin-list/add?environment=${environment}&cardType=${cardType}`
              )
            }
          >
            Add Bin
          </button>
        </div>
      </div>

      {/* Bin Table and Status Filtering */}
      <section>
        <div className="notification">
          <div className="container-fluid">
            {/* Status summary */}
            <ul className="w-[100%] list-unstyled d-flex justify-content-center stepform gap-10 mb-lg-5">
              {statusesList.map((status) => (
                <li
                  key={status.key}
                  role="button"
                  tabIndex={0}
                  className="d-flex justify-content-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
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

          {/* Table Container - Replicating CustomTable's layout */}
          <div className="container-fluid p-4 table-wrapper">
            <div className="row mb-3">
              <div className="col-md-6 d-flex align-items-center">
                <select
                  className="form-select me-2"
                  style={{ width: "80px" }}
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="font">Entries per page</span>
              </div>
              <div className="col-md-6 d-flex justify-content-end align-items-center">
                <span className="me-2 font">Search</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "250px" }}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className={`table`}>
                <thead>
                  <tr>
                    {tableColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`table-header ${
                          column.sortable ? "sortable" : ""
                        }`}
                        onClick={() =>
                          column.sortable && handleSort(column.key)
                        }
                        style={{
                          cursor: column.sortable ? "pointer" : "default",
                          width: column.width || "auto",
                          minWidth: column.minWidth || "100px",
                          backgroundColor: "#f8f9fa",
                          borderBottom: "4px solid #dee2e6",
                        }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <span className="text-nowrap">{column.label}</span>
                          {column.sortable && (
                            <span className="sort-icon">
                              {renderSortIcon(column.key)}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={tableColumns.length}
                        className="font p-4 text-center"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.bin_id} className="table-row">
                        {tableColumns.map((column) => (
                          <td
                            key={`${item.bin_id}-${column.key}`}
                            onClick={() =>
                              navigate(
                                `/dashboard/bin-list/view/${item.bin_id}`
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {column.renderCell
                              ? column.renderCell(item)
                              : item[column.key]}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={tableColumns.length}
                        className="font p-4 text-center"
                      >
                        No Bin found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls (replicated from CustomTable) */}
            <div className="row mt-4">
              <div className="col-md-6">
                <p>
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredAndSortedData?.length)} of{" "}
                  {filteredAndSortedData?.length} entries
                </p>
              </div>
              <div className="col-md-6">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-end">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={firstPage}
                      >
                        <icons.firstPage className="w-4 h-4" />
                      </button>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={prevPage}
                      >
                        <icons.prevPage className="w-4 h-4" />
                      </button>
                    </li>
                    {(() => {
                      const pageButtons = [];
                      const maxButtons = 5;
                      let start = Math.max(
                        currentPage - Math.floor(maxButtons / 2),
                        1
                      );
                      let end = start + maxButtons - 1;

                      if (end > totalPages) {
                        end = totalPages;
                        start = Math.max(end - maxButtons + 1, 1);
                      }

                      if (start > 1) {
                        pageButtons.push(
                          <li
                            key={1}
                            className={`page-item ${
                              currentPage === 1 ? "active" : ""
                            }`}
                          >
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => paginate(1)}
                            >
                              1
                            </button>
                          </li>
                        );
                        if (start > 2) {
                          pageButtons.push(
                            <li
                              key="start-ellipsis"
                              className="page-item disabled"
                            >
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                      }

                      for (let i = start; i <= end; i++) {
                        pageButtons.push(
                          <li
                            key={i}
                            className={`page-item ${
                              currentPage === i ? "active" : ""
                            }`}
                          >
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => paginate(i)}
                            >
                              {i}
                            </button>
                          </li>
                        );
                      }

                      if (end < totalPages) {
                        if (end < totalPages - 1) {
                          pageButtons.push(
                            <li
                              key="end-ellipsis"
                              className="page-item disabled"
                            >
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        pageButtons.push(
                          <li
                            key={totalPages}
                            className={`page-item ${
                              currentPage === totalPages ? "active" : ""
                            }`}
                          >
                            <button
                              type="button"
                              className="page-link"
                              onClick={() => paginate(totalPages)}
                            >
                              {totalPages}
                            </button>
                          </li>
                        );
                      }
                      return pageButtons;
                    })()}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={nextPage}
                      >
                        <icons.nextPage className="w-4 h-4" />
                      </button>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="page-link"
                        onClick={lastPage}
                      >
                        <icons.lastPage className="w-4 h-4" />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BinList;
