import { useMemo } from "react";
import CustomTable from "../../../components/shared/table/CustomTable";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const ProdPosTable = ({ issuers, environment, cardType }) => {
  const navigate = useNavigate();

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "issuer_name",
          label: "Issuer Name",
          width: "120px",
          cellStyle: { fontWeight: 700 },
        },
        {
          key: "bin",
          label: "BIN",
          width: "120px",
          cellStyle: { fontWeight: 700 },
        },
        {
          key: "bin_product",
          label: "Product",
          width: "120px",
          cellStyle: { fontWeight: 700 },
        },
        {
          key: "",
          label: "Available",
          width: "120px",
          renderCell: (item) => (
            <div
              style={{
                backgroundColor: "#d7e3bf",
                color: "black",
                fontWeight: 700,
                width: "fit-content",
                padding: "5px 20px 5px 5px",
              }}
            >
              {cardType == "Pos"
                ? (item.posCount - item.posAssignedCount || 0)
                : item.ecommCount - item.ecommAssignedCount}
            </div>
          ),
        },
        {
          key: cardType == "Pos" ? "posAssignedCount" : "ecommAssignedCount",
          label: "Assigned",
          width: "120px",
          cellStyle: { fontWeight: 700 },
        },
        {
          key: cardType == "Pos" ? "posCount" : "ecommCount",
          label: "Total",
          width: "120px",
          cellStyle: { fontWeight: 700 },
        },
        {
          key: "addCard",
          label: "",
          width: "120px",
          renderCell: (item) => (
            <button
              className="btn save-btn"
              disabled={item?.bin_status === 'inactive'}
              onClick={() =>
                navigate(
                  `/dashboard/maintain-card-stock/add-card/${item?.bin_id || item?.id}?environment=${environment}&terminalType=${cardType}`
                )
              }
            >
             {item?.bin_status === 'inactive' ? "InActive": "Add Card"}
            </button>
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
    <div className="container">
      <CustomTable
        options={tableConfig.options}
        styles={tableConfig.styles}
        data={issuers || []}
        columns={tableConfig.columns}
        expandable={tableConfig.options.expandable}
        emptyState={
          <div className="text-center p-5 font fa-1x">No Issuer found.</div>
        }
      />
    </div>
  );
};

export default ProdPosTable;

ProdPosTable.propTypes = {
  issuers: PropTypes.any.isRequired,
  environment: PropTypes.any.string,
  cardType: PropTypes.any.string,
};
