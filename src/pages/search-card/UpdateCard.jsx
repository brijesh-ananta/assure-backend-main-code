import { useState, useEffect, useMemo } from "react";
import SideButtons from "../../common/SideButtons/SideButtons";
import AssignedCardDetails from "./AssignedCardDetails";
import "./UpdateCard.css";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../services";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import DatePicker from "react-datepicker";
import { dateToMMDDYYYY, mmddyyyyToDate } from "../maintain-card-stock/AddCard";
import PosCard from "../../components/cards/pos/PosCard";
import EcommCard from "../../components/cards/ecomm/EcommCard";
import { decryptAesGcm } from "../../utils/encryptDecrypt";
import AssignmentHistory from "./AssignmentHistory";
import CardUsageHistory from "./CardUsageHistory";
import { toYYYYMMDD } from "../../utils/date";

const status = ["unassigned", "deleted", "blocked"];

const UpdateCard = () => {
  const [environment, setEnvironment] = useState("All");
  const [cardType, setcardType] = useState("Pos");
  const [leftSideButton, setLeftSideButton] = useState("Card Details");
  const [cardDetails, setCardDetails] = useState({});
  const [cardProfile, setCardProfile] = useState({});

  const [refreshKey, setRefreshKey] = useState(0);

  const [showCVV, setShowCVV] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardStatus, setCardStatus] = useState("active");
  const [isDeleted, setIsDeleted] = useState("0");
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const { id } = useParams();

  const [formData, setFormData] = useState({
    seqNumber: "",
    validThru: "",
    expDate: "",
    cvv: "",
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    pinNumber: "",
  });

  // parse "MM-DD-YYYY" or "MM/DD/YYYY" or "YYYY-MM-DD" or ISO -> Date or null
  // parse "MMYY" (e.g. "0429"), "MM-YY", full ISO (YYYY-MM-DD) or MM-DD-YYYY -> Date or null
  const mmYYToDate = (s) => {
    console.log("321", s);
    if (!s) return null;
    const str = String(s).trim();

    // full ISO or YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}T/.test(str) || /^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const d = new Date(str);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    // MM-DD-YYYY or MM/DD/YYYY
    if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(str)) {
      return mmddyyyyToDate(str);
    }

    // MM-YYYY or MM/YYYY (4-digit year)
    const m4 = str.match(/^(\d{2})[-\/](\d{4})$/);
    if (m4) {
      const month = parseInt(m4[1], 10) - 1;
      const year = parseInt(m4[2], 10);
      const d = new Date(year, month, 1);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    // MMYY or MM-YY or MM/YY (2-digit year)
    const m = str.match(/^(\d{2})[-\/]?(\d{2})$/);
    if (m) {
      const month = parseInt(m[1], 10) - 1;
      let year = parseInt(m[2], 10);
      year += year < 100 ? 2000 : 0; // 2-digit year -> 20xx
      const d = new Date(year, month, 1);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    return null;
  };

  // Format Date -> "MMYY" (for DB)
  const dateToMMYY = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}${yy}`; // e.g. "0429"
  };

  const leftSideButtons = useMemo(
    () => [
      {
        label: "Card Details",
        onClick: () => {
          setLeftSideButton("Card Details");
        },
      },
      {
        label: "Assigned Card Controls",
        onClick: () => {
          setLeftSideButton("Assigned Card Controls");
        },
        disabled: status.includes(cardDetails.status),
      },
    ],
    [cardDetails.status]
  );

  const rightSideButtons = useMemo(
    () => [
      {
        label: "Assignment History",
        onClick: () => {
          setLeftSideButton("Assignment History");
        },
      },
      {
        label: "Card Usage History",
        onClick: () => {
          setLeftSideButton("Card Usage History");
        },
        disabled: cardType === "Ecomm",
      },
    ],
    [cardDetails.status]
  );

  const handleEnvironmentChange = (e) => {
    setEnvironment(e.target.value);
  };

  const handlecardTypeChange = (e) => {
    setcardType(e.target.value);
  };

  const fetchCard = async () => {
    try {
      const card = await apiService.card.getById(id);

      setCardProfile(card?.cardProfile || {});
      if (card.cardDetails) {
        try {
          const userCiperText = localStorage.getItem("ciperText");

          const decryptedObj = await decryptAesGcm({
            cipherText: card.cardDetails,
            authTagB64: card.authTag,
            ivKey: card.ivKey,
            userKey: userCiperText,
          });

          const data = { ...card, decryptedCardDetails: decryptedObj };

          setFormData({
            ...decryptedObj,
            address:
              decryptedObj?.address ||
              `${decryptedObj?.building_number || ""} ${
                decryptedObj?.street_name || ""
              }`,
            postalCode: decryptedObj?.postalCode || decryptedObj?.postal_code,
            pinNumber: decryptedObj?.pinNumber || decryptedObj.pin,
          });

          setEnvironment(data?.environment || "1");
          setcardType(data?.cardType);

          setCardStatus(data.cardStatus);
          setIsDeleted(data?.isDeleted);

          setCardDetails(data || {});
          setRefreshKey((k) => k + 1);
        } catch (error) {
          console.error(
            "Error decrypting card details for card",
            card.id,
            error
          );
          return card;
        }
      }
    } catch (error) {
      console.error(error``);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCard();
    }
  }, [id]);

  console.log(cardType);

  useEffect(() => {
    if (id) {
      params.set("recordId", id);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [id]);

  const maskCVV = (cvv) => {
    return cvv ? "XXX" : "";
  };

  const handleUpdateCard = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const payload = {
        cardId: cardDetails.id,
        cardStatus: cardStatus,
        isDeleted: isDeleted,
        cardType,
        ...(cardType === "Pos" && {
          pinNumber: formData.pinNumber,
        }),
        ...(cardType === "Ecomm" && {
          seqNumber: formData?.seqNumber || "",
          cvv: formData?.cvv || "",
          validThru: formData?.validThru || "",
          expDate: formData?.expDate || "",
          name: formData?.name || "",
          address: formData.address || "",
          city: formData.city || "",
          state: formData?.state || "",
          country: formData?.country || "",
          postalCode: formData?.postalCode || "",
        }),
      };

      const resp = await apiService.card.updateStatus(payload);

      if (resp) {
        setTimeout(() => {
          setLoading(false);
          toast.success(resp?.message || "Card status updated successfully");
          window.location.reload();
        }, 500);
      }

      fetchCard();
    } catch (error) {
      console.error("Error updating card:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formData.pinNumber < 0 || formData.pinNumber === "") {
      toast.error("PIN number cannot be negative or empty.");
      return false;
    }
    if (formData.seqNumber < 0 || formData.seqNumber === "") {
      toast.error("Sequence number cannot be negative or empty.");
      return false;
    }
    if (formData.postalCode < 0 || formData.postalCode === "") {
      toast.error("Postal code cannot be negative or empty.");
      return false;
    }
    if (cardStatus.toString().length == 0) {
      toast.error("Please select card status");
      return false;
    }
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => toast.error(error));
      return false;
    }

    return true;
  };

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
                  disabled
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
                  disabled
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
                  disabled
                  checked={cardType == "Pos"}
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
                  checked={cardType == "Ecomm"}
                  disabled
                />
                <label className="form-check-label" htmlFor="cardType2">
                  Ecomm
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SideButtons
        activeLabel={leftSideButton}
        placement="left"
        buttons={leftSideButtons}
      />

      <SideButtons
        placement="right"
        buttons={rightSideButtons}
        activeLabel={leftSideButton}
      />
      {leftSideButton === "Card Details" ? (
        <>
          <div
            style={{
              width: "100%",
              padding: "1.5rem 0px",
              textAlign: "center",
              color: "#1d80c8",
              textDecoration: "underline",
              fontSize: "1.3rem",
              fontWeight: 600,
            }}
          >
            Card Details
          </div>
          <div className="update-card-wrapper ">
            <div className="card-container form-field-wrapper align-items-center">
              <div className="d-flex gap-5">
                <div className="assign-card-wrapper w-50">
                  {cardType == "Pos" ? (
                    <PosCard data={cardDetails} />
                  ) : (
                    <EcommCard data={cardDetails} />
                  )}
                </div>
                <div className="row w-50">
                  <div className="row h-auto">
                    <label className="col-4 text-right">Issuer Name</label>
                    <span className="col font">{cardDetails?.issuerName}</span>
                  </div>
                  <div className="row h-auto">
                    <label className="col-4  text-right">Product</label>
                    <span className="font col-5">
                      {cardDetails?.binProduct}
                    </span>
                  </div>
                  {cardType === "Pos" && (
                    <div className="row h-auto">
                      <label className="col-4  text-right">Feature</label>
                      <span className="font col-5 text-capitalize">
                        {cardDetails?.feature?.replaceAll("_", " ") || "N/A"}
                      </span>
                    </div>
                  )}
                  <div className="row ">
                    <label className="col-4 text-right">Status</label>
                    <span
                      className="font col-5"
                      style={{ textTransform: "capitalize" }}
                    >
                      {cardDetails?.status}
                    </span>
                  </div>
                  <div className="row">
                    <label className="col-4 text-right">Exp. Date</label>
                    <span className="font col-5">
                      {cardDetails?.decryptedCardDetails?.expDate}
                    </span>
                  </div>
                  {cardType === "Pos" && (
                    <div className="row align-items-center">
                      <label className="col-4 font text-right">PIN</label>
                      <span className="font col-5">
                        <input
                          className="form-control formcontrol small-input-100"
                          value={formData?.pinNumber}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              pinNumber: e.target.value,
                            });
                          }}
                        />
                      </span>
                    </div>
                  )}
                  {cardDetails?.otb && cardDetails.cardType === "Pos" ? (
                    <>
                      <div className="row mt-3">
                        <label className="col-4 text-right">OTB</label>
                        <span className="font col-3  otb">
                          {cardDetails?.otb || "N/A"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <> </>
                  )}
                </div>
              </div>

              {environment === "1" && cardType === "Ecomm" && (
                <>
                  <div className="row hidden-inputs">
                    <div className="col-4 row align-items-center">
                      <label className="col-5 text-right">Seq#</label>
                      <span className="col-5">
                        <input
                          className="form-control formcontrol small-input-100"
                          value={formData?.seqNumber}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              seqNumber: e.target.value,
                            });
                          }}
                        />
                      </span>
                    </div>
                    <div className="col-4 align-items-center d-flex gap-3 add-card-wrapper">
                      <label>CVV</label>
                      <div className="input-wrapper small-input-100">
                        <input
                          name="cvv"
                          className="form-control formcontrol"
                          type={showCVV ? "text" : "password"}
                          placeholder="XXX"
                          inputMode="numeric"
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setFormData({
                              ...formData,
                              cvv: value,
                            });
                          }}
                          value={showCVV ? formData?.cvv : maskCVV("XXX")}
                        />
                        <span onClick={() => setShowCVV(!showCVV)}>
                          {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                        </span>
                      </div>
                    </div>
                    <div className="col-4 d-flex gap-3 align-items-center">
                      <label>Valid Thru </label>
                      {/* <p>{JSON.stringify(cardDetails)}</p> */}
                      <span className="">
                        <DatePicker
                          selected={mmYYToDate(
                            formData.validThru ||
                              cardDetails?.decryptedCardDetails?.validThru ||
                              cardDetails?.Valid_Thru ||
                              cardDetails?.decryptedCardDetails?.Valid_Thru ||
                              cardDetails?.decryptedCardDetails?.expDate ||
                              cardDetails?.decryptedCardDetails?.exp_date ||
                              ""
                          )}
                          onChange={(date) => {
                            if (!date) return;

                            // MMYY for DB storage
                            const mmYY = dateToMMYY(date);

                            // Last day of that month
                            const lastDayOfMonth = new Date(
                              date.getFullYear(),
                              date.getMonth() + 1,
                              0
                            );
                            const expDateStr = dateToMMDDYYYY(lastDayOfMonth);

                            // Update both values at once
                            setFormData((prev) => ({
                              ...prev,
                              validThru: mmYY,
                              expDate: expDateStr,
                            }));

                            console.log("validThru (MMYY):", mmYY);
                            console.log("expDate (MM-DD-YYYY):", expDateStr);
                          }}
                          dateFormat="MM-yyyy"
                          placeholderText="MM-YYYY"
                          className="form-control formcontrol"
                          name="validThru"
                          showMonthYearPicker
                          minDate={new Date()}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="row w-100">
                    <label className="col-2 no-wrap font text-right">
                      Name on Card
                    </label>
                    <div className="col-6">
                      <input
                        name="Name_on_card"
                        placeholder="Name on card"
                        className="form-control formcontrol"
                        disabled={cardType != "Ecomm"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          });
                        }}
                        value={formData.name}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="row">
                <label className="col-2 font text-right">Address</label>
                <div className="col-10 row">
                  <div className="w-100 row">
                    <div className="col-6">
                      <input
                        name="address"
                        placeholder="Unit/Building and Street Name"
                        className="form-control formcontrol"
                        disabled={cardType != "Ecomm"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            address: e.target.value,
                          });
                        }}
                        value={
                          formData?.address ||
                          cardDetails?.decryptedCardDetails?.address ||
                          `${
                            cardDetails?.decryptedCardDetails
                              ?.building_number || ""
                          } ${
                            cardDetails?.decryptedCardDetails?.street_name || ""
                          }`
                        }
                      />
                    </div>
                    <div className="col-6">
                      <input
                        name="city"
                        placeholder="City"
                        className="form-control formcontrol w-100"
                        disabled={cardType != "Ecomm"}
                        value={formData?.city || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            city: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-100 row mt-4">
                    <div className="col-4">
                      <input
                        name="state"
                        placeholder="State"
                        className="form-control formcontrol"
                        disabled={cardType != "Ecomm"}
                        value={formData?.state || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            state: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="col-4">
                      <input
                        name="country"
                        placeholder="Country"
                        className="form-control formcontrol"
                        disabled={cardType != "Ecomm"}
                        value={formData?.country || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            country: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="col-4">
                      <input
                        name="postalCode"
                        placeholder="Postal Code"
                        className="form-control formcontrol"
                        disabled={cardType != "Ecomm"}
                        value={formData?.postalCode || ""}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-options-wrapper">
                <div className="card-options">
                  <div className="section">
                    <span className="label red-label">Card Status</span>
                    <label className="d-flex align-items-center gap-3 justify-content-center">
                      <input
                        className="form-check-input p-2 mt-0"
                        type="radio"
                        name="cardStatus"
                        value="blocked"
                        checked={cardStatus === "blocked"}
                        onChange={(e) => setCardStatus(e.target.value)}
                        required={cardStatus.length === 0}
                      />
                      <span className="font mb-0">Block</span>
                    </label>
                    <label className="ms-3 d-flex align-items-center gap-3 justify-content-center">
                      <input
                        type="radio"
                        name="cardStatus"
                        value="active"
                        className="form-check-input p-2 mt-0"
                        checked={cardStatus === "active"}
                        onChange={(e) => setCardStatus(e.target.value)}
                        required={cardStatus.length === 0}
                      />
                      <span className="font mb-0">Active</span>
                    </label>
                  </div>

                  <div className="section">
                    <span className="label red-label">Delete Card</span>
                    <label className="d-flex align-items-center gap-3 justify-content-center">
                      <input
                        className="form-check-input p-2 mt-0"
                        type="radio"
                        name="deleteCard"
                        value="1"
                        checked={isDeleted == "1"}
                        onChange={(e) => setIsDeleted(e.target.value)}
                      />
                      <span className="font mb-0">Yes</span>
                    </label>
                    <label className="ms-3 d-flex align-items-center gap-3 justify-content-center">
                      <input
                        type="radio"
                        name="deleteCard"
                        value="0"
                        className="form-check-input p-2 mt-0"
                        checked={isDeleted == "0"}
                        onChange={(e) => setIsDeleted(e.target.value)}
                      />
                      <span className="font mb-0">No</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="button-group justify-content-end d-flex w-100">
                <button
                  onClick={() => {
                    navigate("/dashboard/search-card");
                  }}
                  disabled={loading}
                  className="btn cancel-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateCard()}
                  type="button"
                  className="btn save-btn"
                  disabled={loading}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      ) : leftSideButton === "Assigned Card Controls" ? (
        <>
          <AssignedCardDetails
            key={refreshKey}
            card={cardDetails}
            fetchData={fetchCard}
            environment={environment}
            cardProfile={cardProfile}
          />
        </>
      ) : leftSideButton === "Assignment History" ? (
        <>
          <AssignmentHistory
            data={cardDetails}
            open={true}
            cardType={cardType}
          />
        </>
      ) : (
        <>
          <AssignmentHistory
            data={cardDetails}
            open={false}
            cardType={cardType}
          />
        </>
      )}
    </>
  );
};

export default UpdateCard;
