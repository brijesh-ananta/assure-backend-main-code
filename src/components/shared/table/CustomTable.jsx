import PropTypes from "prop-types";
import { useState, useEffect, Fragment } from "react"; // Import Fragment
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./style.css";

const CustomTable = ({
  data = [],
  columns = [],
  totalItems,
  onStateChange,
  isServerSide = false,
  initialPage = 1,
  initialEntriesPerPage = 10,
  initialSortColumn = "",
  initialSortDirection = "asc",
  customIcons = {},
  wrapperClass = "table-wrapper",
  tableClass = "",
  headerClass = "",
  rowClass = "",
  searchPlaceholder = "Search text",
  expandable,
  emptyState,
  onRowClick,
  showSearch = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(initialEntriesPerPage);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [filteredData, setFilteredData] = useState(data);
  // eslint-disable-next-line no-unused-vars
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const isExpandable = expandable?.enabled;
  const expandedRows = expandable?.expandedRows || {};
  const onToggle = expandable?.onToggle || (() => {});

  const icons = {
    sortAsc: ChevronUp,
    sortDesc: ChevronDown,
    sortDefault: ChevronDown,
    firstPage: ChevronsLeft,
    lastPage: ChevronsRight,
    prevPage: ChevronLeft,
    nextPage: ChevronRight,
    ...customIcons,
  };

  useEffect(() => {
    if (!isServerSide) {
      let result = [...data];

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

      setFilteredData(result);
    }
  }, [
    searchTerm,
    sortColumn,
    sortDirection,
    isServerSide,
    entriesPerPage,
    currentPage,
    data,
    columns,
  ]);

  useEffect(() => {
    if (isServerSide && onStateChange) {
      onStateChange({
        searchTerm,
        entriesPerPage,
        currentPage,
        sortColumn,
        sortDirection,
      });
    }
  }, [
    searchTerm,
    sortColumn,
    sortDirection,
    isServerSide,
    entriesPerPage,
    currentPage,
    onStateChange,
  ]);

  // Add debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSort = (column) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column.key);
      setSortDirection("asc");
    }
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

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = isServerSide
    ? data
    : filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(
    (isServerSide ? totalItems : filteredData?.length) / entriesPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const firstPage = () => setCurrentPage(1);
  const lastPage = () => setCurrentPage(totalPages);

  return (
    <div className={`container-fluid p-4 table-wrapper ${wrapperClass}`}>
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
        {showSearch && (
          <div className="col-md-6 d-flex justify-content-end align-items-center">
            <span className="me-2 font">Search</span>
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "250px" }}
            />
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className={`table ${tableClass}`}>
          <thead>
            <tr>
              {isExpandable && (
                <th style={{ width: "40px" }} /> // Space for expand/collapse icon
              )}
              {columns.map(
                (column, index) =>
                  !column.hide && (
                    <th
                      key={`${column.key}-${index}`} // Corrected: Using column.key for stability
                      className={`${headerClass} ${
                        column.sortable ? "sortable" : ""
                      }`}
                      onClick={() => column.sortable && handleSort(column)}
                      style={{
                        cursor: column.sortable ? "pointer" : "default",
                        width: column.width || "auto",
                        minWidth: column.minWidth || "100px",
                        ...column.style,
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
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => {
              const isExpanded = expandedRows[item.id]; // Use your unique row identifier

              return (
                <Fragment key={`items-${index}`}>
                  {" "}
                  {/* Corrected: Added Fragment with unique key */}
                  <tr
                    className={rowClass}
                    onClick={() => onRowClick && onRowClick(item)}
                    style={{ cursor: onRowClick ? "pointer" : "default" }}
                  >
                    {isExpandable && (
                      <td>
                        <button
                          onClick={() => onToggle(item.id)}
                          className="btn btn-link p-0"
                        >
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </td>
                    )}
                    {columns.map(
                      (column) =>
                        !column.hide && (
                          <td
                            key={column.key} // Corrected: Using column.key for cell key
                            style={{
                              width: column.width || "auto",
                              minWidth: column.minWidth || "100px",
                              ...column.cellStyle,
                            }}
                            className="text-capitalize"
                          >
                            {column.renderCell
                              ? column.renderCell(item, expandable || {})
                              : item[column.key]}
                          </td>
                        )
                    )}
                  </tr>
                  {isExpanded && (
                    <tr key={`${item.issuer_id}-expanded`}>
                      {" "}
                      {/* Corrected: Unique key for expanded row */}
                      <td colSpan={columns.length + (isExpandable ? 1 : 0)}>
                        {" "}
                        {/* Added 1 to colspan if expandable */}
                        {expandable.renderContent(item)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {currentItems.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (isExpandable ? 1 : 0)}
                  className="font p-4 text-center"
                >
                  {emptyState}
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
            {Math.min(
              indexOfLastItem,
              isServerSide ? totalItems : filteredData?.length
            )}{" "}
            of {isServerSide ? totalItems : filteredData?.length} entries
          </p>
        </div>
        <div className="col-md-6">
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-end">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button type="button" className="page-link" onClick={firstPage}>
                  <icons.firstPage className="w-4 h-4" />
                </button>
              </li>
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button type="button" className="page-link" onClick={prevPage}>
                  <icons.prevPage className="w-4 h-4" />
                </button>
              </li>
              {(() => {
                const pageButtons = [];
                const maxButtons = 5; // Show max 5 page buttons at a time
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
                      <li key="start-ellipsis" className="page-item disabled">
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
                      <li key="end-ellipsis" className="page-item disabled">
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
                <button type="button" className="page-link" onClick={nextPage}>
                  <icons.nextPage className="w-4 h-4" />
                </button>
              </li>
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button type="button" className="page-link" onClick={lastPage}>
                  <icons.lastPage className="w-4 h-4" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

CustomTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  totalItems: PropTypes.number,
  onStateChange: PropTypes.func,
  isServerSide: PropTypes.bool,
  onRowClick: PropTypes.func, // new

  initialPage: PropTypes.number,
  initialEntriesPerPage: PropTypes.number,
  initialSortColumn: PropTypes.string,
  initialSortDirection: PropTypes.oneOf(["asc", "desc"]),
  customIcons: PropTypes.object,
  wrapperClass: PropTypes.string,
  tableClass: PropTypes.string,
  headerClass: PropTypes.string,
  rowClass: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  expandable: PropTypes.any,
  emptyState: PropTypes.any,
  showSearch: PropTypes.bool,
};

export default CustomTable;
