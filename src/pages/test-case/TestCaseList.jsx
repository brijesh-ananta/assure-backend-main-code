import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import TestCaseService from "../../services/TestCase";
import { useAuth } from "../../utils/AuthContext";

import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../../components/shared/table/style.css";
import { environmentMapping } from "../../utils/constent";

const TestCaseList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [environment, setEnvironment] = useState("1");
  const [cardType, setCardType] = useState("Pos");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Active: 0,
    Inactive: 0,
  });
  const [allTestCases, setAllTestCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("test_case_id");
  const [sortDirection, setSortDirection] = useState("desc");

  const icons = {
    sortAsc: ChevronUp,
    sortDesc: ChevronDown,
    sortDefault: ChevronDown,
    firstPage: ChevronsLeft,
    lastPage: ChevronsRight,
    prevPage: ChevronLeft,
    nextPage: ChevronRight,
  };

  const fetchAllTestCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await TestCaseService.getTestCasesList(
        environment,
        cardType
      );
      setAllTestCases(response.data || []); // <-- FIXED: Use `response.data`, not full `response`
    } catch (error) {
      console.error("Error fetching all Test Cases:", error);
      setAllTestCases([]);
    }
    setLoading(false);
  }, [environment, cardType]);

  useEffect(() => {
    fetchAllTestCases();
  }, [fetchAllTestCases]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const allFetchedTestCases = await TestCaseService.getTestCasesList(
          environment,
          cardType
        );

        setStatusCounts({
          Draft: allFetchedTestCases?.data?.filter(
            (tc) => tc.status === "draft"
          ).length,
          Active: allFetchedTestCases?.data?.filter(
            (tc) => tc.status === "active"
          ).length,
          Inactive: allFetchedTestCases?.data?.filter(
            (tc) => tc.status === "inactive"
          ).length,
        });
      } catch (error) {
        setStatusCounts({ Draft: 0, Active: 0, Inactive: 0 });
      }
    };
    fetchCounts();
  }, [environment, cardType]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...allTestCases];

    if (statusFilter !== "All") {
      result = result.filter(
        (item) => item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.test_case_id?.toString().toLowerCase().includes(searchValue) ||
          item.title?.toLowerCase().includes(searchValue) ||
          item.status?.toLowerCase().includes(searchValue) ||
          item.created_by?.toLowerCase().includes(searchValue) ||
          item.env?.toLowerCase().includes(searchValue)
      );
    }

    const columns = [
      { key: "test_case_id", sortable: true },
      { key: "title", sortable: true },
      { key: "status", sortable: true },
      { key: "created_by", sortable: true },
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
  }, [allTestCases, searchTerm, sortColumn, sortDirection, statusFilter]);

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

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
    setCardType("Pos");
    setCurrentPage(1);
  };

  const handleCardTypeChange = (e) => {
    setCardType(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
    setCurrentPage(1);
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

  const tableColumns = useMemo(
    () => [
      {
        key: "test_cases_unique_id",
        label: "Test Case ID",
        sortable: true,
        renderCell: (item) => item.test_cases_unique_id,
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        renderCell: (item) => item.status,
      },
      {
        key: "terminal_type",
        label: "Terminal Type",
        sortable: true,
        renderCell: (item) => item.terminal_type,
      },
      {
        key: "testing_type",
        label: "Testing Type",
        sortable: true,
        renderCell: (item) => item.testing_type,
      },
      {
        key: "testing_scope",
        label: "Scope",
        sortable: true,
        renderCell: (item) => item.testing_scope,
      },
      {
        key: "pin_entry_capability",
        label: "PIN Entry",
        sortable: true,
        renderCell: (item) => item.pin_entry_capability,
      },
      {
        key: "created_by",
        label: "Created By",
        sortable: true,
        renderCell: (item) => item.created_by,
      },
      {
        key: "environment_id",
        label: "Env ID",
        sortable: true,
        renderCell: (item) =>environmentMapping[ item.environment_id],
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
                `/dashboard/test-case/add?environment=${environment}&cardType=${cardType}`
              )
            }
          >
            Add New Test Case
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
                      <tr key={item.id} className="table-row">
                        {tableColumns.map((column) => (
                          <td
                            key={`${item.id}-${column.key}`}
                            onClick={() =>
                              navigate(`/dashboard/test-case/view/${item.id}`)
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
                        No Test Cases found.
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

export default TestCaseList;
