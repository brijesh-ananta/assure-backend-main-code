import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  dateToMMDDYYYY,
  mmddyyyyToDate,
  dateToMMYYYY,
  mmyyyyToDate,
} from "../maintain-card-stock/AddCard";
import apiService from "../../services";
import * as Yup from "yup";
import axiosToken from "../../utils/axiosToken";
import { toYYYYMMDD } from "../../utils/date";
import { decryptAesGcm } from "../../utils/encryptDecrypt";
import { formatMaskedCardNumber } from "../../utils/function";

const validationSchema = Yup.object().shape({
  cardNumber: Yup.string().required("Card number is required"),
  seqNumber: Yup.string()
    .required("Seq# is required")
    .matches(/^\d+$/, "Must be a number"),
  validThru: Yup.string().required("Valid Thru date is required"),
  cvv: Yup.string().required("CVV is required"),
});

export function getFeatureLabel(input = "") {
  const map = {
    transit: "Transit",
    online_pin: "Online Pin",
    transit_online_pin: "Transit and Online Pin",
    generic: "Generic",
    signature_preferred: "Signature Preferred",
    pin_preferred: "PIN Preferred",
  };

  const normalizedKey = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

  return map[normalizedKey] || input;
}

const AssignCardManually = () => {
  const { requestId, testerId } = useParams();
  const navigate = useNavigate();

  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [cardDetails, setCardDetails] = useState(null);
  const [tester, setTester] = useState(null);
  const [requestCardFeature, setRequestCardFeature] = useState(null);
  const [systemDataRows, setSystemDataRows] = useState({});
  const [globalSystemData, setGlobalSystemData] = useState([]);
  const [environment, setEnvironment] = useState(1);
  const [endDate, setendDate] = useState(null);

  //    useEffect(() => {
  //     if (shippingDetails.length > 0) {
  //       const updatedRows = {};

  //       for (let i = 0; i < shippingDetails.length; i++) {
  //         const card = shippingDetails[i];

  //         const uniqueId = card?.id;

  //         const offlineDaysValue =
  //           card?.card?.offlineDays ||
  //           systemDataRows[uniqueId]?.offline_days ||
  //           globalSystemData?.offline_days ||
  //           "";
  //         const offlineUsageValue =
  //           card?.card?.onlineUsages ||
  //           systemDataRows[uniqueId]?.offline_usage ||
  //           globalSystemData?.offline_usage ||
  //           "";
  //         const totalUsageValue =
  //           card?.card?.totalUsage ||
  //           systemDataRows[uniqueId]?.total_usage ||
  //           globalSystemData?.total_usage ||
  //           "";
  //         const lastUseDateValue =
  //           card?.card?.LastUseDate ||
  //           systemDataRows[uniqueId]?.last_use_date ||
  //           globalSystemData?.last_use_date ||
  //           "";

  //         updatedRows[uniqueId] = {
  //           offline_days: offlineDaysValue,
  //           offline_usage: offlineUsageValue,
  //           total_usage: totalUsageValue,
  //           last_use_date: lastUseDateValue,
  //         };
  //       }

  //       setSystemDataRows(updatedRows);
  //     }
  //   }, [shippingDetails, globalSystemData]);

  const handleFinalSubmit = async (values) => {
    setFetching(true);
    try {
      const payload = {
        cardNumber: values.cardNumber,
        seq: values.seqNumber,
        cvv: values.cvv,
        validThru: values.validThru,
      };

      const resp = await apiService.card.searchCard(payload);
      if (resp?.ciperText) {
        const userCiperText = localStorage.getItem("ciperText");

        const data = await decryptAesGcm({
          authTagB64: resp?.authTag,
          cipherText: resp?.ciperText,
          ivKey: resp?.iv,
          userKey: userCiperText,
        });

        setCardDetails({
          decryptedData: data,
        });

        toast.success(resp.message);
      }
    } catch {
      setFetching(false);
    }
    setFetching(false);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      cardNumber: "",
      seqNumber: "",
      validThru: "",
      cvv: "",
    },
    validationSchema,
    onSubmit: handleFinalSubmit,
  });

  const fetchRequest = useCallback(async () => {
    if (!requestId) return;

    try {
      const data = await apiService.requests.getById(requestId);
      const testinfo = JSON.parse(data?.testInfo) || {};

      setEnvironment(data?.environment || 1);
      setendDate(testinfo?.endDate || null);

      const parsedTesterDetails = JSON.parse(data?.testerDetails);
      const testers = parsedTesterDetails?.testers || [];

      const testerExists = testers.some(
        (tester) => tester.userId.toString() === testerId
      );

      if (!testerExists) {
        navigate(`/dashboard/test-card-request/requestor-info/${requestId}`);
      }

      const tester = testers.find((t) => t.userId.toString() === testerId);
      setTester(tester);

      setRequestCardFeature(parsedTesterDetails?.specialFeature || ""); // store for later use
    } catch (error) {
      console.error(error);
      navigate(`/dashboard/test-card-request/requestor-info/${requestId}`);
    }
  }, [navigate, requestId, testerId]);

  const handleInputChange = (field, value) => {
    setSystemDataRows((prevRows) => {
      const newRows = {
        ...prevRows,
        [field]: value,
      };
      return newRows;
    });
  };

  useEffect(() => {
    if (requestId) {
      fetchRequest();
    }
  }, [fetchRequest, requestId]);

  // Store original values
  const requestFeatureLabel = requestCardFeature || "-";
  const cardFeatureLabel = cardDetails?.decryptedData?.special_features || "-";

  // Transform values for comparison
  const requestFeatureKey = getFeatureLabel(requestFeatureLabel);
  const cardFeatureKey = getFeatureLabel(cardFeatureLabel);

  // Check mismatch
  const isMismatch = requestFeatureKey !== cardFeatureKey;

  const handleCardAssign = async () => {
    try {
      const { offline_days, offline_usage, total_usage, last_use_date } =
        systemDataRows;

      if (
        !offline_days?.trim() ||
        !offline_usage?.trim() ||
        !total_usage?.trim() ||
        !last_use_date?.trim()
      ) {
        toast.error("Please complete all required fields before proceeding.");
        return;
      }

      if (+total_usage > cardDetails?.otb) {
        toast.error("Total usage cannot exceed the available OTB limit.");
        return;
      }

      const cardPayload = {
        request_id: requestId,
        cardID: cardDetails?.cardId || cardDetails?.decryptedData?.cardId,
        offlineDays: offline_days || null,
        onlineUsages: offline_usage || null,
        totalUsage: total_usage || null,
        LastUseDate: toYYYYMMDD(last_use_date) || null,
        testname: tester.name,
        testemail: tester.email,
        userId: tester.userId || testerId,
      };

      const response = await axiosToken.post(`/user-cards`, cardPayload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Cards successfully assigned!");

        await navigate(
          `/dashboard/test-card-request/requestor-info/${requestId}`
        );
      } else {
        toast.error("Failed to assign cards.");
      }
    } catch (error) {
      console.error("Error assigning card:", error);
      toast.error("An error occurred while assigning the cards.");
    }
  };
  useEffect(() => {
    async function fetchSystemDetault() {
      if (environment) {
        try {
          const response = await axiosToken.get(
            `/system-defaults?environment=${environment}`
          );
          if (response.data && response.data.length > 0) {
            setGlobalSystemData(response.data[0]);
          }
        } catch (error) {
          console.error("Error fetching system defaults:", error);
        }
      }
    }
    fetchSystemDetault();
  }, [environment]);
  console.log(cardDetails);
  console.log(systemDataRows);

  return (
    <>
      <div className="add-card-wrapper">
        {!cardDetails?.decryptedData && (
          <form
            onSubmit={formik.handleSubmit}
            className="card-form form-field-wrapper"
          >
            <div className="row labeled-row">
              <div className="form-group-add-card">
                <label className="font" style={{ width: "8rem" }}>
                  Card Number
                </label>
                <div className="d-flex flex-column w-80">
                  <div className="input-wrapper">
                    <input
                      name="cardNumber"
                      className="form-control formcontrol"
                      type={showCardNumber ? "text" : "password"}
                      placeholder="9999 99XX XXXX XX99 9999"
                      inputMode="numeric"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        formik.setFieldValue("cardNumber", value);
                      }}
                      value={formatMaskedCardNumber(
                        formik.values.cardNumber,
                        "full"
                      )}
                    />
                    <span onClick={() => setShowCardNumber(!showCardNumber)}>
                      {showCardNumber ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </span>
                  </div>
                  {formik.touched.cardNumber && formik.errors.cardNumber && (
                    <div className="text-danger mt-2">
                      {formik.errors.cardNumber}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group-add-card">
                <label
                  className="font text-right"
                  style={{ width: "8rem", paddingRight: "2rem" }}
                >
                  Seq#
                </label>

                <div className="d-flex flex-column">
                  <input
                    className="form-control formcontrol small-input-100 "
                    name="seqNumber"
                    placeholder="123"
                    inputMode="numeric"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      formik.setFieldValue("seqNumber", value);
                    }}
                    value={formik.values.seqNumber}
                  />

                  {formik.touched.seqNumber && formik.errors.seqNumber && (
                    <div className="text-danger mt-2">
                      {formik.errors.seqNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="row labeled-row">
              <div className="form-group-add-card align-items-center">
                <label className="font" style={{ width: "8rem" }}>
                  Valid Thru
                </label>
                <div className="d-flex flex-column ">
                  <DatePicker
                    selected={mmyyyyToDate(formik.values.validThru)}
                    onChange={(date) => {
                      const str = dateToMMYYYY(date);
                      formik.setFieldValue("validThru", str);
                    }}
                    dateFormat="MM-yyyy"
                    placeholderText="MM-YYYY"
                    className="form-control formcontrol"
                    name="validThru"
                    showMonthYearPicker
                  />
                  {formik.touched.validThru && formik.errors.validThru && (
                    <div className="text-danger mt-2">
                      {formik.errors.validThru}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group-add-card">
                <label
                  className="font text-right"
                  style={{ width: "8rem", paddingRight: "3rem" }}
                >
                  CVV
                </label>
                <div className="d-flex flex-column">
                  <div className="input-wrapper small-input-100">
                    <input
                      name="cvv"
                      className="form-control formcontrol"
                      type={showCVV ? "text" : "password"}
                      placeholder="XXX"
                      inputMode="numeric"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        formik.setFieldValue("cvv", value);
                      }}
                      value={formik.values.cvv}
                    />
                    <span onClick={() => setShowCVV(!showCVV)}>
                      {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                  {formik.touched.cvv && formik.errors.cvv && (
                    <div className="text-danger mt-2">{formik.errors.cvv}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3">
              <Link
                to={`/dashboard/test-card-request/requestor-info/${requestId}`}
                className="btn cancel-btn"
              >
                Cancel
              </Link>

              <button
                disabled={fetching}
                type="submit"
                className="btn save-btn"
              >
                Add Card
              </button>
            </div>
          </form>
        )}

        <div className="container-fluid">
          {cardDetails?.decryptedData && (
            <div className="row mt-4">
              <div className="col-12 row">
                <div className="col-4 d-flex gap-2 row">
                  <p className="font col-5 text-right">Issuer Name:</p>{" "}
                  <div className="col-5">{cardDetails.issuerName || "N/A"}</div>
                </div>
                <div className="col-4 d-flex gap-2 row">
                  <p className="font col-5 text-right">Product:</p>{" "}
                  <div className="col-4">
                    {cardDetails.decryptedData.bin_product}
                  </div>
                </div>
                <div className="col-3 d-flex gap-2 row">
                  <p className="font col-5 text-right">BIN:</p>
                  <div className="col-4">{cardDetails.decryptedData.bin}</div>
                </div>
              </div>

              <div className="col-12 row">
                <div className="col-4 d-flex gap-2 row">
                  <p className="font text-right col-5 no-wrap">Card Number</p>{" "}
                  <div className="col-4">
                    {cardDetails.decryptedData.cardNumber}
                  </div>
                </div>
                <div className="col-4 d-flex gap-2 row">
                  <p className="font text-right col-5">Seq#</p>
                  <div className="col-4">
                    {cardDetails.decryptedData.sequence_number}
                  </div>
                </div>
                <div className="col-3 d-flex gap-2 row">
                  <p className="font text-right col-5">OTB</p>
                  <div className="col-5">
                    {cardDetails.decryptedData.OTB || cardDetails?.otb || 0}
                  </div>
                </div>
              </div>

              <div className="col-12 row">
                <div className="col-4 row d-flex gap-2">
                  <p className="text-right col-5 font">Valid Thru</p>{" "}
                  <div className="col-4">
                    {cardDetails.decryptedData.expDate ||
                      cardDetails?.decryptedData?.exp_date}
                  </div>
                </div>
                <div className="col-4 row d-flex gap-2">
                  <p className="text-right col-5 font">CVV</p>
                  <div className="col-4">{cardDetails.decryptedData.cvv}</div>
                </div>
                <div className="col-3 row d-flex gap-2">
                  <p className="text-right col-5 font">PIN</p>{" "}
                  <div className="col-4">{cardDetails.decryptedData.pin}</div>
                </div>
              </div>

              <div className="col-12 row">
                <div className="col-4 row d-flex gap-2">
                  <p className="font col-5 no-wrap p-0 text-right">
                    Name on Card
                  </p>
                  <div className="col-5">
                    {cardDetails.decryptedData.cardholder_name}
                  </div>
                </div>
                <div className="col-4 row d-flex gap-2"></div>
                <div className="col-3 row d-flex gap-2">
                  <p className="font col-5 text-right">EXP Date</p>{" "}
                  <div className="col-5 p-">
                    {cardDetails.decryptedData.expDate ||
                      cardDetails?.decryptedData?.exp_date}
                  </div>
                </div>
              </div>

              <div className="col-12 row">
                <div className="col-4 row d-flex gap-2">
                  <p className="font col-5 text-right">Card Feature</p>{" "}
                  <div className="col-5">{cardFeatureKey}</div>
                </div>
                <div className="col-4"></div>
                <div className="col-3 row d-flex gap-2">
                  <p className="font col-5 text-right">Card Status</p>{" "}
                  <div className="col-4 p-0">
                    {cardDetails.decryptedData.status}
                  </div>
                </div>
              </div>

              <div className="col-12 row">
                <div className="col-4 row d-flex gap-2 position-relative">
                  <p className="font col-7 text-right">Request Card Feature</p>
                  <div className="col-4 no-wrap d-flex flex-column gap-2 ">
                    {requestFeatureKey || "-"}
                  </div>
                  {isMismatch && (
                    <p
                      className="no-wrap p-3 text-danger position-absolute font"
                      style={{
                        border: "2px dotted black font",
                        width: "max-content",
                        right: "-20%",
                        bottom: "-5rem",
                      }}
                    >
                      Card feature does not match with Request.
                    </p>
                  )}
                </div>
              </div>

              <div className="col-12  mt-5 row">
                <div className="d-flex col-2 align-items-center gap-1">
                  <label className="font">Offline Days</label>
                  <input
                    name="offline_days"
                    type="text"
                    onChange={(e) =>
                      handleInputChange("offline_days", e.target.value)
                    }
                    value={globalSystemData?.offline_days || ""}
                    className="form-control formcontrol small-input"
                  />
                </div>
                <div className="d-flex col-2 align-items-center gap-1">
                  <label className="font">Offline Usage</label>
                  <input
                    name="offline_usage"
                    placeholder="5"
                    type="text"
                    onChange={(e) =>
                      handleInputChange("offline_usage", e.target.value)
                    }
                    value={globalSystemData?.offline_usage || ""}
                    className="form-control formcontrol small-input"
                  />
                </div>
                <div className="d-flex col-2 align-items-center gap-1">
                  <label className="font">Total Usage</label>
                  <input
                    name="total_usage"
                    placeholder="10"
                    type="text"
                    onChange={(e) =>
                      handleInputChange("total_usage", e.target.value)
                    }
                    value={globalSystemData?.total_usage || ""}
                    className="form-control formcontrol small-input"
                  />
                </div>
                <div className="d-flex col-2 align-items-center gap-1">
                  <label className="font">Last Use Date</label>
                  <DatePicker
                    selected={systemDataRows?.last_use_date || ""}
                    onChange={(date) => {
                      const formatted = dateToMMDDYYYY(date); // MM-DD-YYYY format
                      handleInputChange("last_use_date", formatted);
                    }}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="form-control formcontrol"
                    value={endDate}
                  />
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end mt-5">
                <Link
                  className="btn cancel-btn"
                  to={`/dashboard/test-card-request/requestor-info/${requestId}`}
                >
                  Cancel
                </Link>
                <button
                  onClick={() => handleCardAssign()}
                  className="btn save-btn"
                  type="button"
                  disabled={isMismatch}
                >
                  Select Card
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

export default AssignCardManually;
