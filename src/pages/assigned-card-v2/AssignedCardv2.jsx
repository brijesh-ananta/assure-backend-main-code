import { useState, useMemo } from "react";
import CustomTable from "../../components/shared/table/CustomTable";
import "./assignedcardv2.css";
import { useNavigate } from "react-router-dom";
import SideButtons from "../../common/SideButtons/SideButtons";

const AssignedCardv2 = () => {
  const [environment, setEnvironment] = useState("1");
  const [cardType, setCardType] = useState("Pos");
  const navigate = useNavigate();

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
  };

  const handlecardTypeChange = (e) => {
    setCardType(e.target.value);
  };

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "card_number",
          label: "Card Number",
          width: "150px",
        },
        {
          key: "card_type",
          label: "Card Type",
          width: "150px",
        },
        {
          key: "assignment_status",
          label: "Assignment Status",
          width: "150px",
        },
        {
          key: "date_assigned",
          label: "Date Assigned",
          width: "150px",
        },
        {
          key: "date_released",
          label: "Date Released",
          width: "150px",
        },
        {
          key: "card_used",
          label: "Card Used",
          width: "150px",
        },
        {
          key: "amount_used",
          label: "Amount Used",
          width: "150px",
        },
        {
          key: "tcr_id",
          label: "TCR ID",
          width: "150px",
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

  const handleClickSideButtons = (label) => {
    if (label === "Login History") {
      navigate("/dashboard/login-history-v2");
    } else if (label === "User Profile") {
      navigate("/dashboard/view-user-v2");
    }
  };

  return (
    <>
      <SideButtons
        placement="left"
        activeLabel="Assigned Cards"
        buttons={[
          {
            label: "User Profile",
            onClick: () => handleClickSideButtons("User Profile"),
          },
          {
            label: "Login History",
            onClick: () => handleClickSideButtons("Login History"),
          },
          {
            label: "Assigned Cards",
            onClick: () => handleClickSideButtons("Assigned Cards"),
          },
        ]}
      />
      <div className="assigned-card-conatiner">
        <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
          <div className="container-fluid">
            <div className="d-lg-flex align-items-center justify-content-evenly w-100">
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
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault1"
                  >
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
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault2"
                  >
                    QA
                  </label>
                </div>
              </div>

              <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
                <span className="me-3 font">Card Type</span>
                <div className="form-check me-3 d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="cardType"
                    value={"Pos"}
                    onChange={handlecardTypeChange}
                    id="cardType1"
                    checked={cardType === "Pos"}
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
                    onChange={handlecardTypeChange}
                    id="cardType2"
                    checked={cardType === "Ecomm"}
                  />
                  <label className="form-check-label" htmlFor="cardType2">
                    Ecomm
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="search-card-wrapper form-field-wrapper">
          <div className="form-grid-search-card">
            <div className="form-grid-row">
              <div className="form-group-search-card">
                <label>Tester Partner</label>
                <p>Testing Partner Name</p>
              </div>
            </div>

            <div className="form-grid-row">
              <div className="form-group-search-card">
                <label>Tester Email</label>
                <p>Email Address</p>
              </div>
              <div className="form-group-search-card">
                <label>POS Card Usage #</label>
                <p>999</p>
              </div>
            </div>

            <div className="form-grid-row">
              <div className="form-group-search-card">
                <label>Tester Name</label>
                <p>First_name Last_name</p>
              </div>
              <div className="form-group-search-card">
                <label>POS Card Usage</label>
                <p>9999.99</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-lg-5 mb-3 table-responsive">
          <CustomTable
            options={tableConfig.options}
            styles={tableConfig.styles}
            data={assignedCardsData}
            columns={tableConfig.columns}
            expandable={tableConfig.options.expandable}
            emptyState={
              <div className="text-center p-5 font fa-1x">No Card found.</div>
            }
          />
        </div>
      </div>
    </>
  );
};

export default AssignedCardv2;

const assignedCardsData = [
  {
    card_number: "**** **** **** 1234",
    card_type: "Virtual",
    assignment_status: "Assigned",
    date_assigned: "2025-06-10",
    date_released: "2025-06-18",
    card_used: true,
    amount_used: "$250.00",
    tcr_id: "TCR-001",
  },
  {
    card_number: "**** **** **** 5678",
    card_type: "Physical",
    assignment_status: "Released",
    date_assigned: "2025-05-20",
    date_released: "2025-06-15",
    card_used: false,
    amount_used: "$0.00",
    tcr_id: "TCR-002",
  },
  {
    card_number: "**** **** **** 9012",
    card_type: "Virtual",
    assignment_status: "Assigned",
    date_assigned: "2025-06-01",
    date_released: null,
    card_used: true,
    amount_used: "$120.50",
    tcr_id: "TCR-003",
  },
  {
    card_number: "**** **** **** 3456",
    card_type: "Physical",
    assignment_status: "Released",
    date_assigned: "2025-04-10",
    date_released: "2025-05-01",
    card_used: true,
    amount_used: "$75.00",
    tcr_id: "TCR-004",
  },
  {
    card_number: "**** **** **** 7890",
    card_type: "Virtual",
    assignment_status: "Assigned",
    date_assigned: "2025-06-15",
    date_released: null,
    card_used: false,
    amount_used: "$0.00",
    tcr_id: "TCR-005",
  },
];
