import { useState, useMemo, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CustomTable from "../../components/shared/table/CustomTable";
import "./SearchCard.css";
import apiService from "../../services";
import { parseISO, isBefore, endOfDay } from "date-fns";
import Select from "react-dropdown-select";
import { decryptAesGcm } from "../../utils/encryptDecrypt";

const SearchCard = () => {
  const [environment, setEnvironment] = useState("1");
  const [cardType, setCardType] = useState("Pos");
  const [rowData, setRowData] = useState([]);
  const [status, setStatus] = useState("all");

  const [testerName, setTesterName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [issuers, setIssuers] = useState([]);
  const [loading, setloading] = useState(false);

  const navigate = useNavigate();

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
  };

  const handlecardTypeChange = (e) => {
    setCardType(e.target.value);
  };

  const renderInput = (placeholder, value, onChange) => (
    <div className="input-wrapper">
      <input
        type="text"
        className="form-control formcontrol"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <Search size={18} className="input-icon" />
    </div>
  );

  const fetchIssuers = useCallback(async () => {
    try {
      const resp = await apiService.issuers.getByEnv(environment, "", cardType);
      setIssuers(resp);
    } catch (error) {
      console.error(error);
    }
  }, [cardType, environment]);

  useEffect(() => {
    if (environment) {
      fetchIssuers();
    }
  }, [fetchIssuers, environment]);

  const transformedIssuer = useMemo(
    () =>
      issuers?.map((partner) => ({
        label: partner?.issuer_name || "",
        value: partner?.id || "",
        ...partner,
      })),
    [issuers]
  );

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "cardNumber",
          label: "Card Number",
          width: "150px",
          sortable: true,
          sortAccessor: (item) => item.decryptedCardDetails?.cardNumber || "",
          renderCell: (item) => (
            <Link to={`/dashboard/update-card/${item?.id}`}>
              {item.decryptedCardDetails?.cardNumber
                ? item.decryptedCardDetails.cardNumber.replace(
                    /^(\d{6})(\d+)(\d{6})$/,
                    "$1XXXX$3"
                  )
                : "N/A"}
            </Link>
          ),
        },
        {
          key: "cardStatus",
          label: "Status",
          sortable: true,
          width: "120px",
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              {item?.cardStatus}
            </span>
          ),
        },
        {
          key: "cardType",
          label: "Card Type",
          width: "120px",
          sortable: true,
        },
        {
          key: "status",
          label: "Assignment Status",
          sortable: true,
          width: "120px",
        },
        {
          key: "binProduct",
          label: "Product",
          width: "120px",
          sortable: true,
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              {item?.binProduct}
            </span>
          ),
        },
        {
          key: "feature",
          label: "Feature",
          width: "120px",
          sortable: true,
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              {item?.feature?.replaceAll("_", " ") || "-"}
            </span>
          ),
        },
        ...(cardType === "Pos"
          ? [
              {
                key: "otb",
                label: "OTB",
                width: "120px",
                sortable: true,
                renderCell: (item) => (
                  <span style={{ textTransform: "capitalize" }}>
                    ${item?.otb || "-"}
                  </span>
                ),
              },
            ]
          : []),
        {
          key: "region",
          label: "Region",
          width: "120px",
          hide: true,
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              {item?.region || "-"}
            </span>
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
    [cardType]
  );

  const fetchCards = useCallback(async () => {
    setloading(true);
    try {
      const params = {
        environment,
        cardType,
        testerName,
        email,
        issuerName,
      };
      const resp = await apiService.card.get(params);

      const cardsData = resp || [];
      const userCiperText = localStorage.getItem("ciperText");

      const decryptedCards = await Promise.all(
        cardsData.map(async (card) => {
          if (card.cardDetails) {
            try {
              const decryptedObj = await decryptAesGcm({
                cipherText: card.cardDetails,
                authTagB64: card.authTag,
                ivKey: card.ivKey,
                userKey: userCiperText,
              });

              return { ...card, decryptedCardDetails: decryptedObj };
            } catch (error) {
              console.error(
                "Error decrypting card details for card",
                card.id,
                error
              );
              return card;
            }
          }
          return card;
        })
      );

      let finalCards = decryptedCards;
      if (cardNumber && cardNumber.trim() !== "") {
        finalCards = decryptedCards.filter(
          (card) =>
            card.decryptedCardDetails &&
            card.decryptedCardDetails.cardNumber &&
            card.decryptedCardDetails.cardNumber.includes(cardNumber.trim())
        );
      }

      if (status === "expired") {
        const today = endOfDay(new Date());
        finalCards = finalCards.filter((card) => {
          const expDate =
            card.decryptedCardDetails &&
            card.decryptedCardDetails.expDate &&
            card.decryptedCardDetails.expDate.length >= 10
              ? parseISO(card.decryptedCardDetails.expDate.substring(0, 10))
              : null;
          return expDate && isBefore(expDate, today);
        });
      }
      setRowData(finalCards);
    } catch (error) {
      console.error(error);
    }
    setloading(false);
  }, [
    environment,
    cardType,
    testerName,
    email,
    issuerName,
    cardNumber,
    status,
  ]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleRowClick = useCallback(
    (row) => {
      navigate(`/dashboard/update-card/${row?.id}`);
    },
    [navigate]
  );

  return (
    <>
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
              <label>Tester Name</label>
              {renderInput("Enter tester name", testerName, (e) =>
                setTesterName(e.target.value)
              )}
            </div>
            <div className="form-group-search-card">
              <label>Email</label>
              {renderInput("Enter tester email", email, (e) =>
                setEmail(e.target.value)
              )}
            </div>
            <button
              onClick={() => {
                setStatus(status === "all" ? "expired" : "all");
              }}
              className="btn save-btn"
            >
              {status == "all" ? "Expired" : "All"} Cards
            </button>
          </div>

          <div className="form-grid-row">
            <div className="form-group-search-card">
              <label>Card Number</label>
              {renderInput("Enter card number", cardNumber, (e) =>
                setCardNumber(e.target.value)
              )}
            </div>
            <div className="form-group-search-card">
              <label>Issuer Name</label>
              <Select
                options={transformedIssuer}
                labelField="label"
                valueField="value"
                className="form-control formcontrol"
                style={{ padding: "0.5rem", minWidth: "274px" }}
                searchable
                multi={false}
                placeholder="Select Issuer"
                onChange={(e) => {
                  const data = e?.length ? e[0] : {};
                  setIssuerName(data?.issuer_name || "");
                }}
              />
              {/* {renderInput("Enter Issuer Name", issuerName, (e) =>
                setIssuerName(e.target.value)
              )} */}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-lg-5 mb-3 table-responsive">
        <CustomTable
          options={tableConfig.options}
          styles={tableConfig.styles}
          data={rowData}
          onRowClick={handleRowClick}
          columns={tableConfig.columns}
          expandable={tableConfig.options.expandable}
          emptyState={
            <div className="text-center p-5 font fa-1x">
              {loading ? "Loading ... " : "No Card found."}
            </div>
          }
        />
      </div>
    </>
  );
};

export default SearchCard;
