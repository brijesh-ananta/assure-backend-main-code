import "./AssignedCardDetails.css"; // Assuming this CSS file contains general styles
import axiosToken from "../../utils/axiosToken";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import CustomTable from "../../components/shared/table/CustomTable";
import { toMMDDYYYY } from "../maintain-card-stock/AddCard";
import CardUsageHistory from "./CardUsageHistory";
import { formatMaskedCardNumber } from "../../utils/function";
const AssignmentHistory = ({ data, open, cardType }) => {
  function formatToMMDDYY(isoDate) {
    const date = new Date(isoDate);
    const mm = String(date.getMonth() + 1); // Months are 0-indexed
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(); // Get last 2 digits

    return `${mm}/${dd}/${yy}`;
  }

  const { id } = useParams();

  const [assignmentHistory, setAssignmentHistory] = useState({
    assignments: [],
    total_used_counts: "-",
    total_used_amount: "-",
    remaining_balance: "-",
    issuer_name: "-",
  });
  const [usageHistory, setUsageHistory] = useState({
    assignments: [],
  });

  const cardDetails = data?.decryptedCardDetails;
  const initialValue = useMemo(
    () => ({
      cardNumber: cardDetails?.cardNumber || "-",
      cardLimit: cardDetails?.card_limit || "-",
      expDate: cardDetails?.expDate || "-",
      binProduct: cardDetails?.bin_product || "-",
      status: cardDetails?.status || "-",
      features: cardDetails?.special_features || "-",
    }),
    [cardDetails]
  );

  const fetchData = useCallback(async (url, setState, initialValue) => {
    try {
      const response = await axiosToken.get(url);
      const fetchedData = response.data.data;
      if (fetchedData) {
        setState(fetchedData);
      } else {
        setState(initialValue);
      }
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      setState(initialValue);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchData(`/user-cards/assigment-history/${id}`, setAssignmentHistory, {
        assignments: [],
        total_used_counts: "-",
        total_used_amount: "-",
        remaining_balance: "-",
        issuer_name: "-",
      });
      fetchData(`/user-cards/card-usage-history/${id}`, setUsageHistory, {
        assignments: [],
      });
    }
  }, [id, fetchData, setAssignmentHistory, setUsageHistory]);

  console.log(assignmentHistory.assignments);

  const assignmentTableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "assignmentTo",
          label: "Assignment To",
          width: "150px",
          sortable: true,
          renderCell: (item) =>
            item?.assignmentTo == null ? (
              " - "
            ) : (
              <Link
                to={`/dashboard/user-list-view/${item.User_id}?recordId=${item.User_id}`}
              >
                {item?.assignmentTo || "-"}
              </Link>
            ),
        },
        {
          key: "assignedStatus",
          label: "Assignment Status",
          width: "150px",
          sortable: true,
        },

        {
          key: "DateAssigned",
          label: "Date Assigned",
          width: "150px",
          sortable: true,
          renderCell: (item) =>
            item?.DateAssigned === null
              ? " -"
              : formatToMMDDYY(item?.DateAssigned) || "-",
        },
        {
          key: "DateRealsed",
          label: "Date Released",
          width: "150px",
          sortable: true,
          renderCell: (item) =>
            item?.DateReleased === null
              ? " -"
              : formatToMMDDYY(item?.DateReleased) || "-",
        },
        { key: "CardUsed", label: "Card Used", width: "150px", sortable: true },
        {
          key: "Amount_used",
          label: "Amount Used",
          width: "150px",
          sortable: true,
        },
        {
          key: "tcrId",
          label: "TCR ID",
          width: "150px",
          sortable: true,
          renderCell: (item) =>
            item?.tcrId === null ? (
              " - "
            ) : (
              <Link
                to={`/dashboard/test-card-request/requestor-info/${item.Request_id}?recordId=${item.Request_id}`}
              >
                {item?.tcrId || "-"}
              </Link>
            ),
        },
      ],
      options: {
        isServerSide: false,
        sortConfig: {
          initialSortColumn: "submittedDate",
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
          // backgroundColor: "#f8f9fa", // Removed background color
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
    <div>
      <div className="container mt-4 form-field-wrapper p-4">
        <div className="text-center mb-4">
          {open === true ? (
            <>
              <label className="font text-5 text-primary fs-5 text-decoration-underline mb-3">
                Assignment History
              </label>
            </>
          ) : (
            <>
              <label className="font text-5 text-primary fs-5 text-decoration-underline mb-3">
                Card Usage History
              </label>
            </>
          )}
        </div>
        <div className="row mb-2">
          <div className="col-md-4 d-flex">
            <strong className="me-3 w-50">Card Number</strong>
            <span className="w-50">
              {formatMaskedCardNumber(initialValue.cardNumber)}
            </span>
          </div>
          <div className="col-md-4 d-flex">
            <strong className="me-3 w-50">Exp Date</strong>
            <span className="w-50">{toMMDDYYYY(initialValue.expDate)}</span>
          </div>
          <div className="col-md-4 d-flex">
            <strong className="me-3 w-50">Status</strong>
            <span className="w-50 text-capitalize">{initialValue.status}</span>
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-4 d-flex">
            <strong className="me-3 w-50">Issuer Name</strong>
            <span className="w-50">{assignmentHistory.issuer_name}</span>
          </div>
          <div className="col-md-4 d-flex">
            <strong className="me-3 w-50">Product</strong>
            <span className="w-50">{initialValue.binProduct}</span>
          </div>
          <div className="col-md-4 d-flex">
            <strong className="me-3 w-50">Feature</strong>
            <span className="w-50 text-capitalize">
              {initialValue.features?.replaceAll("_", " ") || "-"}
            </span>
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-4 d-flex">
            <strong className="me-3 w-50">Credit Limit</strong>
            <span className="w-50">
              {initialValue.cardLimit === "-"
                ? "-"
                : `$${initialValue.cardLimit}`}
            </span>
          </div>

          {cardType !== "Ecomm" && (
            <>
              <div className="col-md-4 d-flex">
                <strong className="me-3 w-50">Total Usage #</strong>
                <span className="w-50 font">
                  {assignmentHistory.total_used_counts}
                </span>
              </div>
              <div className="col-md-4 d-flex">
                <strong className="me-3 w-50">Total Usage $</strong>
                <span className="w-50 font">
                  {assignmentHistory.total_used_amount === "-"
                    ? "-"
                    : `$${assignmentHistory.total_used_amount}`}
                </span>
              </div>
            </>
          )}
        </div>

        {cardType !== "Ecomm" && (
          <div className="row mb-2">
            <div className="col-md-8"></div>
            <div className="col-md-4 d-flex">
              <strong className="me-3 w-50 text-warning">
                Available Balance $
              </strong>
              <span className="w-50 font">
                {assignmentHistory.remaining_balance === "-"
                  ? "-"
                  : `$${assignmentHistory.remaining_balance}`}
              </span>
            </div>
          </div>
        )}

        {/* <div className="row mb-2">
    <div className="col-md-4 d-flex gap-5 align-items-center">
      <strong className="me-2 ">Card Number</strong>
      <span>{formatMaskedCardNumber(initialValue.cardNumber)}</span>
    </div>
    <div className="col-md-4 d-flex gap-5 align-items-center">
      <strong className="me-2">Exp Date</strong>
      <span>{toMMDDYYYY(initialValue.expDate)}</span>
    </div>
    <div className="col-md-4 d-flex gap-5 align-items-center">
      <strong className="me-2">Status</strong>
      <span className="text-capitalize">{initialValue.status}</span>
    </div>
  </div>

  <div className="row mb-2">
    <div className="col-md-4 d-flex gap-5 align-items-center">
      <strong className="me-2">Issuer Name</strong>
      <span>{assignmentHistory.issuer_name}</span>
    </div>
    <div className="col-md-4 d-flex gap-5 align-items-center">
      <strong className="me-2">Product</strong>
      <span>{initialValue.binProduct}</span>
    </div>
    <div className="col-md-4 d-flex gap-5 align-items-center">
      <strong className="me-2">Feature</strong>
      <span className="text-capitalize">
        {initialValue.features?.replaceAll("_", " ") || "-"}
      </span>
    </div>
  </div>

  <div className="row mb-2">
    <div className="col-md-4 d-flex gap-5 align-items-center">
      <strong className="me-2">Credit Limit</strong>
      <span>
        {initialValue.cardLimit === "-" ? "-" : `$${initialValue.cardLimit}`}
      </span>
    </div>

    {cardType !== "Ecomm" && (
      <>
        <div className="col-md-4 d-flex gap-5 align-items-center">
          <strong className="me-2">Total  Usage #</strong>
          <span className="font">{assignmentHistory.total_used_counts}</span>
        </div>
        <div className="col-md-4 d-flex">
          <strong className="me-2">Total  Usage $</strong>
          <span className="font">
            {assignmentHistory.total_used_amount === "-"
              ? "-"
              : `${assignmentHistory.total_used_amount}`}
          </span>
        </div>
      </>
    )}
  </div>

  {cardType !== "Ecomm" && (
    <div className="row mb-2">
      <div className="col-md-8"></div>
      <div className="col-md-4 d-flex gap-5 align-items-center">
        <strong className="me-2 text-warning">Available Balance $</strong>
        <span className="font">
          {assignmentHistory.remaining_balance === "-"
            ? "-"
            : `$${assignmentHistory.remaining_balance}`}
        </span>
      </div>
    </div>
  )} */}
      </div>

      <div className="mb-3  mt-4  p-5">
        {open ? (
          <CustomTable
            options={assignmentTableConfig.options}
            styles={assignmentTableConfig.styles}
            data={assignmentHistory.assignments}
            columns={assignmentTableConfig.columns}
            expandable={assignmentTableConfig.options.expandable}
            emptyState={
              <div className="text-center p-5 font fa-1x">
                No assignment data found.
              </div>
            }
          />
        ) : (
          <CardUsageHistory />
        )}
      </div>
    </div>
  );
};

export default AssignmentHistory;
