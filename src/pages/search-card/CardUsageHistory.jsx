import "./AssignedCardDetails.css"; // Assuming this CSS file contains general styles
import axiosToken from "../../utils/axiosToken";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import CustomTable from "../../components/shared/table/CustomTable";

import { convertUTCToESTTime, formatDateMMDDYY } from "../../utils/date";

const CardUsageHistory = () => {
  const { id } = useParams();

  const [usageHistory, setUsageHistory] = useState({
    assignments: [],
  });

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
      fetchData(`/user-cards/card-usage-history/${id}`, setUsageHistory, {
        assignments: [],
      });
    }
  }, [id, fetchData, setUsageHistory]);
  console.log(usageHistory);

  const usageTableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "Transaction_Date",
          label: "Transaction Date",
          width: "150px",
          sortable: true,
          renderCell: (item) =>
            item?.Transaction_Date === null
              ? " -"
              : formatDateMMDDYY(item?.Transaction_Date) || "-",
        },
        {
          key: "Transaction_Date",
          label: "Txn Time",
          width: "150px",
          sortable: true,
          renderCell: (item) =>
            item?.Transaction_Date === null
              ? " -"
              : convertUTCToESTTime(item?.Transaction_Date) || "-",
        },
        {
          key: "Txn_Amount",
          label: "Transaction Amount",
          width: "150px",
          sortable: true,
          renderCell: (item) => item?.Txn_Amount || "-",
        },
        {
          key: "User",
          label: "User",
          width: "150px",
          sortable: true,
          renderCell: (item) =>
            item?.User === null ? (
              " - "
            ) : (
              <Link
                to={`/dashboard/user-list-view/${item.User_id}?recordId=${item.User_id}`}
              >
                {item?.User || "-"}
              </Link>
            ),
        },
        {
          key: "Merchant_Name",
          label: "Merchant Name",
          width: "150px",
          sortable: true,
          renderCell: (item) => item?.Merchant_Name || "-",
        },
        {
          key: "Merchant_location",
          label: "Merchant Location",
          width: "150px",
          sortable: true,
          renderCell: (item) => item?.Merchant_location || "-",
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
      <CustomTable
        options={usageTableConfig.options}
        styles={usageTableConfig.styles}
        data={usageHistory.assignments}
        columns={usageTableConfig.columns}
        expandable={usageTableConfig.options.expandable}
        emptyState={
          <div className="text-center p-5 font fa-1x">No usage data found.</div>
        }
      />
    </div>
  );
};

export default CardUsageHistory;
