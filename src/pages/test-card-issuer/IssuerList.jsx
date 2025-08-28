import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services";
import { useAuth } from "../../utils/AuthContext";
import axiosToken from "../../utils/axiosToken";

import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "../../components/shared/table/style.css";
import { formatDate } from "../../utils/date";

function IssuerList() {
  const navigate = useNavigate();
  const [environment, setEnvironment] = useState("1");
  const [cardType, setcardType] = useState("Pos");
  const [statusFilter, setStatusFilter] = useState("All");
  const [statusCounts, setStatusCounts] = useState({
    Draft: 0,
    Active: 0,
    Inactive: 0,
  });
  const [allIssuers, setAllIssuers] = useState([]);
  const { user } = useAuth();
  const userRole = user?.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const icons = {
    sortAsc: ChevronUp,
    sortDesc: ChevronDown,
    sortDefault: ChevronDown,
    firstPage: ChevronsLeft,
    lastPage: ChevronsRight,
    prevPage: ChevronLeft,
    nextPage: ChevronRight,
  };

  const fetchAllIssuers = useCallback(async () => {
    try {
      const resp = await apiService.issuers.getByEnv(
        environment,
        "All",
        cardType
      );
      setAllIssuers(resp || []);
    } catch (error) {
      console.error("Error fetching all issuers:", error);
    }
  }, [cardType, environment]);

  useEffect(() => {
    if (environment) {
      fetchAllIssuers();
    }
  }, [environment, fetchAllIssuers]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axiosToken.get(
          `/issuers?environment=${environment}&cardType=${cardType}`
        );
        const fetchedIssuers = response.data || [];
        setStatusCounts({
          Draft: fetchedIssuers.filter((i) => i.status === "draft").length,
          Active: fetchedIssuers.filter((i) => i.status === "active").length,
          Inactive: fetchedIssuers.filter((i) => i.status === "inactive")
            .length,
        });
      } catch (error) {
        console.error("Error fetching issuer counts:", error);
      }
    };
    fetchCounts();
  }, [environment, cardType]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...allIssuers];

    if (statusFilter !== "All") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase().trim();
      result = result?.filter((item) => {
        const stringValues = Object.values(item)
          .flatMap((val) => {
            if (typeof val === "string") {
              try {
                const parsed = JSON.parse(val);
                return JSON.stringify(parsed).toLowerCase();
              } catch {
                return val.toLowerCase();
              }
            }
            return val?.toString().toLowerCase() || "";
          })
          .join(" ");

        return stringValues?.includes(searchValue);
      });
    }

    const columns = [
      { key: "issuer_id", sortable: true },
      { key: "status", sortable: true },
      { key: "iisc", sortable: true },
      { key: "issuer_name", sortable: true },
      {
        key: "test_card_type",
        sortable: true,
        accessor: (item) => item.card_type,
      },
      { key: "createdBy", sortable: true },
      { key: "created_at", sortable: true },
    ];

    if (sortColumn) {
      const colDef = columns.find((col) => col.key === sortColumn);

      result.sort((a, b) => {
        const aValue = colDef?.sortAccessor
          ? colDef.sortAccessor(a)
          : a[sortColumn]?.toString().toLowerCase() || "";
        const bValue = colDef?.sortAccessor
          ? colDef.sortAccessor(b)
          : b[sortColumn]?.toString().toLowerCase() || "";

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    }

    return result;
  }, [allIssuers, searchTerm, sortColumn, sortDirection, statusFilter]);

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
    setcardType("Pos");
    setCurrentPage(1);
  };

  const handlecardTypeChange = (e) => {
    setcardType(e.target.value);
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

  const availableEnvironments = useMemo(() => {
    const environments = [];
    if (user?.prod === 1) environments.push({ value: "1", label: "Prod" });
    if (user?.qa === 1) environments.push({ value: "2", label: "QA" });
    return environments;
  }, [user]);

  const tableColumns = useMemo(
    () => [
      {
        key: "issuer_unique_id",
        label: "Issuer ID",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/test-card-issuer/edit/${item.issuer_id}?environment=${item.environment}`}
          >
            {item.issuer_unique_id}
          </Link>
        ),
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/test-card-issuer/edit/${item.issuer_id}?environment=${item.environment}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              textTransform: "capitalize",
            }}
          >
            {item.status}
          </Link>
        ),
      },
      {
        key: "iisc",
        label: "IISC",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/test-card-issuer/edit/${item.issuer_id}?environment=${item.environment}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {item.iisc}
          </Link>
        ),
      },
      {
        key: "issuer_name",
        label: "Issuer Name",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/test-card-issuer/edit/${item.issuer_id}?environment=${item.environment}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {item.issuer_name}
          </Link>
        ),
      },
      {
        key: "card_type",
        label: "Card Type",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/test-card-issuer/edit/${item.issuer_id}?environment=${item.environment}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {item.card_type}
          </Link>
        ),
      },
      {
        key: "createdBy",
        label: "Created By",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/test-card-issuer/edit/${item.issuer_id}?environment=${item.environment}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {item.createdBy}
          </Link>
        ),
      },
      {
        key: "created_at",
        label: "Date Created",
        sortable: true,
        renderCell: (item) => (
          <Link
            to={`/dashboard/test-card-issuer/edit/${item.issuer_id}?environment=${item.environment}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {item.created_at ? formatDate(item.created_at) : "-"}
          </Link>
        ),
      },
    ],
    []
  );

  const statuses = [
    { label: "Draft", key: "draft", count: statusCounts.Draft },
    { label: "Active", key: "active", count: statusCounts.Active },
    { label: "Inactive", key: "inactive", count: statusCounts.Inactive },
  ];

  return (
    <>
      {userRole === 1 && (
        <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2">
          <div className="container-fluid">
            <div className="d-lg-flex align-items-center justify-content-between w-100">
              <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3 me-3">
                <span className="me-3 font">Environment</span>
                {availableEnvironments.some((env) => env.value === "1") && (
                  <div className="form-check me-3 d-flex gap-2 align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="environment"
                      value={"1"}
                      checked={environment === "1"}
                      onChange={handleEnvironmentChange}
                      id="flexRadioDefaultProd"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="flexRadioDefaultProd"
                    >
                      Prod
                    </label>
                  </div>
                )}
                {availableEnvironments.some((env) => env.value === "2") && (
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
                    <label
                      className="form-check-label"
                      htmlFor="flexRadioDefault2"
                    >
                      QA
                    </label>
                  </div>
                )}
              </div>

              <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3 me-3">
                <span className="me-3 font">Card Type</span>
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="cardType"
                    value={"Pos"}
                    checked={
                      cardType === "Pos" ||
                      environment === "2" ||
                      environment === "3"
                    }
                    onChange={handlecardTypeChange}
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
                    checked={
                      cardType === "Ecomm" &&
                      environment !== "2" &&
                      environment !== "3"
                    }
                    onChange={handlecardTypeChange}
                    id="cardType2"
                    disabled={environment === "2" || environment === "3"}
                  />
                  <label className="form-check-label" htmlFor="cardType2">
                    Ecomm
                  </label>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
                <a
                  className="btn save-btn"
                  onClick={() =>
                    navigate(
                      `/dashboard/bin-list?environment=${environment}&terminalType=${cardType}`
                    )
                  }
                >
                  Test Card BIN
                </a>
                <button
                  className="btn save-btn"
                  onClick={() =>
                    navigate(
                      `/dashboard/test-card-issuer/add?environment=${environment}&terminalType=${cardType}`
                    )
                  }
                >
                  Add Test Card Issuer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section>
        <div className="notification">
          <div className="container-fluid">
            <ul className="list-unstyled text-center d-flex stepform flex-wrap justify-content-lg-between justify-content-center gap-4 mb-lg-5 col-lg-6 mx-auto">
              {statuses.map((status) => (
                <li
                  key={status.key}
                  className="d-flex justify-content-center flex-column text-center gap-2"
                  onClick={() => handleStatusFilter(status.key)}
                  style={{ cursor: "pointer" }}
                >
                  <span
                    className={`card-custom-shadow-1 totavalue ${statusFilter === status.key ? "active-value" : ""}`}
                  >
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
                <span
                  className={`card-custom-shadow-1 totavalue ${statusFilter === "All" ? "active-value" : ""}`}
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
              {/* REMOVED WHITESPACE BETWEEN TABLE/TR TAGS */}
              <table className="table">
                <thead>
                  <tr>
                    {tableColumns.map((column) => (
                      <th
                        key={column.key}
                        className={`table-header ${column.sortable ? "sortable" : ""}`}
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
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.issuer_id} className="table-row">
                        {tableColumns.map((column) => (
                          <td
                            key={`${item.issuer_id}-${column.key}`}
                            className="text-capitalize"
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
                        No Issuer found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
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
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
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
}

export default IssuerList;
