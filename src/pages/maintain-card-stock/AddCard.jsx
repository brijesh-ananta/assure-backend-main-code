import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "./AddCard.css";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import apiService from "../../services";
import EnvHeader from "../../components/EnvHeader";
import {
  environmentMappingOption,
  terminalTypeMappingOption,
} from "../../utils/constent";
import { encryptData } from "../../utils/cryptoUtils";
import { getLastDayOfMonth } from "../../utils/date";
import DatePicker from "react-datepicker";
import binService from "../../services/bin";
import "react-datepicker/dist/react-datepicker.css";
import { decryptAesGcm } from "../../utils/encryptDecrypt";
import { formatMaskedCardNumber } from "../../utils/function";
// Converts Date object to MM-DD-YYYY string
export function dateToMMDDYYYY(date) {
  console.log("Date:", date);
  if (!date) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export function dateToMMYYYY(date) {
  console.log("Date:", date);
  if (!date) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  const yyyy = date.getFullYear();
  return `${mm}-${yyyy}`;
}

// Converts MM-DD-YYYY string to Date object
export function mmddyyyyToDate(str) {
  if (!str) return null;
  const [mm, dd, yyyy] = str.split("-");
  return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
}

export function mmyyyyToDate(str) {
  if (!str) return null;
  const [mm, yyyy] = str.split("-");
  return new Date(`${yyyy}-${mm}T00:00:00`);
}

export function toMMDDYYYY(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return [month, day, year].join("-");
}

function toYYYYMMDD(dateStr) {
  if (!dateStr) return "";
  const [month, day, year] = dateStr.split("-");
  return [year, month, day].join("-");
}

function toYYYYMM(dateStr) {
  if (!dateStr) return "";
  const [month, year] = dateStr.split("-");
  const shortYear = year && year.length === 4 ? year.slice(2) : year;
  return `${month}${shortYear}`;
}

const AddCard = () => {
  const encryptionKey = import.meta.env.VITE_ENCKEY;
  const { binId } = useParams();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [decryptedCardDataObj, setDecryptedCardDataObj] = useState({});
  const [showAddMore, setShowAddMore] = useState(false);
  const [importingData, setImportingData] = useState(false);
  const [, setIssuer] = useState({});
  const [importedData, setImportedData] = useState();
  const [fieldsdisabled, setfielddisabled] = useState(false);

  const navigate = useNavigate();

  // Get query params
  const [params] = useSearchParams();

  const environment = params.get("environment");
  const cardType = params.get("terminalType");

  const [importDataSuccessful, setImportDataSuccessful] = useState(false);

  const validateRequiredFields = (values, cardType) => {
    const errors = {};

    if (!values.cardNumber?.trim()) {
      errors.cardNumber = "Card number is required";
    }

    if (values.cardNumber.slice(0, values.bin.length) !== values.bin) {
      errors.cardNumber = "Card number must start with the BIN";
    }

    if (!values.seqNumber?.trim()) {
      errors.seqNumber = "Sequence number is required";
    }

    if (!values.validThru?.trim()) {
      errors.validThru = "Valid thru date is required";
    }

    if (!values.cvv?.trim()) {
      errors.cvv = "CVV is required";
    }

    if (cardType === "Ecomm" && !values.name?.trim()) {
      errors.name = "Name on card is required";
    }

    if (cardType === "Ecomm" && !values.address?.trim()) {
      errors.address = "Address is required";
    }

    if (cardType === "Ecomm" && !values.city?.trim()) {
      errors.address = "City is required";
    }

    if (cardType === "Ecomm" && !values.state?.trim()) {
      errors.address = "State is required";
    }

    if (cardType === "Ecomm" && !values.country?.trim()) {
      errors.address = "Country is required";
    }
    if (cardType === "Ecomm" && !values.postalCode?.trim()) {
      errors.address = "Postal Code is required";
    }
    return errors;
  };

  const handleFinalSubmit = async (values, handleSubmit, addMore = false) => {
    const errors = validateRequiredFields(formik.values, cardType);

    if (Object.keys(errors).length > 0) {
      // Show first error message
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    if (cardType === "Ecomm") {
      const body = {
        binId,
        environment,
        bin: formik.values.bin,
        feature: formik.values.feature,
        binProduct: formik.values.product,
        ...formik.values,
        cardType: "Ecomm",
      };
      console.log("bin--->", formik.values.bin);

      try {
        const result = await apiService.card.createCard(body);
        console.log(result);
        if (result?.success) {
          toast.success("Ecomm Card created successfully");
          if (!addMore) {
            navigate("/dashboard/maintain-card-stock");
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Error creating card");
      }
      return;
    }

    if (!importedData) {
      toast.error("Please import data first for POS cards");
      return;
    }

    const updatedCardDataObj = {
      ...decryptedCardDataObj,
      pin: formik?.values?.pin || importedData?.cardDataResponseResp?.pin,
      pinNumber: formik?.values?.pin || importedData?.cardDataResponseResp?.pin,
      cardNumber: importedData?.cardDataResponseResp?.card_number,
      expDate: importedData?.cardDataResponseResp?.exp_date,
      cardType: cardType,
    };

    const { encryptedData: finalCardDataResponse, iv: newIv } =
      await encryptData({
        encryptionKey: encryptionKey,
        data: JSON.stringify(updatedCardDataObj),
      });

    // 2. Encrypt this data
    const { encryptedData, iv: encryptedIv } = await encryptData({
      encryptionKey: encryptionKey,
      data: JSON.stringify({
        ...(importedData?.insertedDataResp || {}),
        pin: formik?.values?.pin || importedData?.cardDataResponseResp?.pin,
        pinNumber:
          formik?.values?.pin || importedData?.cardDataResponseResp?.pin,
        cardNumber: importedData?.cardDataResponseResp?.card_number,
        postalCode: importedData?.cardDataResponseResp?.postal_code,
      }),
    });

    const body = {
      binId: binId,
      environment: environment,
      cardType: cardType,
      iv: newIv,
      cardDetails: finalCardDataResponse,

      cardDataResponse: encryptedData,
      ivResponse: encryptedIv,
    };
    try {
      const result = await apiService.card.createCard(body);

      if (result?.success) {
        toast.success("Card created successfully");
        setShowAddMore(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating card");
      setShowAddMore(true);
    }
  };

  const handleAddMoreClick = async () => {
    setfielddisabled(false);
    await handleFinalSubmit(formik.values, formik.handleSubmit, true);
    resetPage();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      binId: binId || "",
      environment: environment || "",
      cardType: cardType || "",
      issuerName: "",
      product: "",
      bin: "",
      cardNumber: "",
      seqNumber: "",
      validThru: "",
      cvv: "",
      pin: "",
      name: "",
      expDate: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      features: "",
      aid: "",
      status: "",
    },
    onSubmit: handleFinalSubmit,
  });

  const resetPage = () => {
    const issuerName = formik.values.issuerName;
    const product = formik.values.product;
    const bin = formik.values.bin;

    formik.resetForm();

    setShowCardNumber(false);
    setShowCVV(false);
    setShowPIN(false);
    setDecryptedCardDataObj({});
    setShowAddMore(false);
    setImportedData();
    setImportDataSuccessful(false);

    setTimeout(() => {
      formik.setValues({
        product,
        bin,
        issuerName,
      });
    }, 200);
  };

  const handleImportData = async () => {
    const { cardNumber, seqNumber, validThru, cvv } = formik.values;

    if (
      !cardNumber?.trim() ||
      !seqNumber?.trim() ||
      !validThru?.trim() ||
      !cvv.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    setImportingData(true);

    try {
      const payload = {
        cardNumber: formik.values.cardNumber,
        expDate: toYYYYMM(formik.values.validThru),
        seq: formik.values.seqNumber,
        cvv: formik.values.cvv,
        cardType: cardType,
        binId: binId,
      };
      const result = await apiService.card.importCard(payload);

      const data = {
        ...result,
      };

      if (result) {
        const excludeKeys = ["message", "ivKey", "ivResponse"];
        const userCiperText = localStorage.getItem("ciperText");

        const keys = Object.keys(result);
        for (let i = 0; i < keys.length; i++) {
          const element = keys[i];

          if (!excludeKeys.includes(element)) {
            let ivKey = "";
            let authTag = "";

            if (element === "cardDataResponse") {
              ivKey = result.ivResponse;
            } else {
              ivKey = result.ivKey || "";
            }

            if (element === "cardDataResponse") {
              authTag = result.ivResponseAuthTag;
            } else {
              authTag = result.cardDetailAuthTag || "";
            }

            const sanitizedEncryptedData = result[element];
            const decryptedObj = await decryptAesGcm({
              cipherText: sanitizedEncryptedData,
              authTagB64: authTag,
              ivKey,
              userKey: userCiperText,
            });
            data[`${element}Resp`] = decryptedObj;
          }
        }
      }
      const card = data.cardDataResponseResp;

      if (card) {
        formik.setValues({
          ...formik.values,
          product: card.bin_product || "",
          bin: card.bin?.toString() || "",
          cardNumber: card.card_number || "",
          seqNumber: card.sequence_number?.toString() || "",
          cvv: card.cvv?.toString() || "",
          pin: card.pin || "",
          name: card.cardholder_name || "",
          // expDate: card.exp_date || "",
          address: `${card?.building_number || ""} ${card.street_name || ""}`,
          expDate: toMMDDYYYY(card.exp_date) || "",
          city: card.city || "",
          state: card.state || "",
          country: card.country || "",
          postalCode: card.postal_code || "",
          features: card.special_features || "",
          aid: "",
          status: card.status || "",
        });
        setImportedData(data);
        setfielddisabled(true);
        setDecryptedCardDataObj(card);
        setImportDataSuccessful(true);
      }
    } catch (error) {
      console.error(error);
    }
    setImportingData(false);
  };

  // useEffect(() => {
  //   if (cardType === "Ecomm" && formik.values.validThru) {
  //     const lastDay = toMMDDYYYY(getLastDayOfMonth(formik.values.validThru));
  //     if (formik.values.expDate !== lastDay) {
  //       console.log("321--->",lastDay)
  //       formik.setFieldValue("expDate", lastDay);
  //     }
  //   }
  //   // eslint-disable-next-line
  // }, [cardType, formik.values.validThru]);

  const fetchBin = useCallback(async () => {
    if (!binId || !environment) return;
    try {
      const resp = await binService.getBinById(binId);

      const bin = resp?.data || {};
      setIssuer(bin);

      formik.setValues({
        issuerName: bin.issuer_name || "",
        product: bin?.bin_product || "",
        bin: bin?.bin || "",
      });
    } catch (error) {
      console.error(error);
    }
  }, [environment, binId]);

  useEffect(() => {
    if (binId) {
      fetchBin();
    }
  }, [binId, fetchBin, environment]);
  console.log(formik.values.bin);
  const getTerminalType = useCallback(() => {
    const data = terminalTypeMappingOption.find((a) => a.value === "Ecomm");

    if (environment == "2") {
      params.set("terminalType", "Pos");
      navigate({ search: params.toString() }, { replace: true });
      data.disabled = true;
    } else {
      data.disabled = false;
    }
    return terminalTypeMappingOption;
  }, [environment, navigate, params]);

  return (
    <>
      <EnvHeader
        environmentOptions={environmentMappingOption.slice(0, 2)}
        terminalTypeOptions={getTerminalType()}
        isSubmitDisabled={false}
        showSubmit={false}
        disableHeader
      />

      <div className="add-card-wrapper">
        <form
          onSubmit={formik.handleSubmit}
          className="card-form form-field-wrapper"
        >
          <div className="row">
            <input
              value={`Issuer Name: ${formik.values.issuerName || ""}`}
              disabled
            />
            <input value={`Product: ${formik.values.product}`} disabled />
            <input value={`BIN: ${formik.values.bin}`} disabled />
          </div>

          <div className="row labeled-row">
            <div className="form-group-add-card">
              <label className="font" style={{ width: "8rem" }}>
                Card Number
              </label>
              <div className="input-wrapper">
                <input
                  name="cardNumber"
                  className="form-control formcontrol"
                  type={showCardNumber ? "text" : "password"}
                  placeholder="9999 99XX XXXX XX99 9999"
                  disabled={fieldsdisabled}
                  inputMode="numeric"
                  onChange={(e) => {
                    const input = e.target;
                    const start = input.selectionStart;
                    const rawValue = input.value.replace(/\D/g, "");
                    formik.setFieldValue("cardNumber", rawValue, false);
                    requestAnimationFrame(() => {
                      input.setSelectionRange(start, start);
                    });
                  }}
                  value={formatMaskedCardNumber(
                    formik.values.cardNumber,
                    "full"
                  )}
                />
                <span onClick={() => setShowCardNumber(!showCardNumber)}>
                  {showCardNumber ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>
            <div className="form-group-add-card">
              <label
                className="font text-right"
                style={{ width: "8rem", paddingRight: "2rem" }}
              >
                Seq#
              </label>
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
                disabled={fieldsdisabled}
              />
            </div>
          </div>

          <div className="row labeled-row">
            <div className="form-group-add-card align-items-center">
              <label className="font" style={{ width: "8rem" }}>
                Valid Thru
              </label>
              <DatePicker
                selected={mmyyyyToDate(formik.values.validThru)}
                onChange={(date) => {
                  const str = dateToMMYYYY(date);

                  formik.setFieldValue("validThru", str);
                  if (cardType === "Ecomm" && str) {
                    const lastDayOfMonth = new Date(
                      date.getFullYear(),
                      date.getMonth() + 1,
                      0
                    );

                    const expDateStr = dateToMMDDYYYY(lastDayOfMonth);
                    console.log("expdate---->", expDateStr);
                    formik.setFieldValue("expDate", expDateStr);
                  }
                }}
                dateFormat="MM-yyyy"
                placeholderText="MM-YYYY"
                className="form-control formcontrol"
                name="validThru"
                showMonthYearPicker
                minDate={new Date()}
                disabled={fieldsdisabled}
              />
            </div>

            <div className="form-group-add-card">
              <label
                className="font text-right"
                style={{ width: "8rem", paddingRight: "3rem" }}
              >
                CVV
              </label>
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
                  disabled={fieldsdisabled}
                />
                <span onClick={() => setShowCVV(!showCVV)}>
                  {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            {importDataSuccessful ? (
              <>
                <div className="form-group-add-card align-items-center">
                  <label className="font" style={{ width: "3rem" }}>
                    PIN
                  </label>
                  <div className="input-wrapper small-input-100 ">
                    <input
                      name="pin"
                      className="form-control formcontrol "
                      type={showPIN ? "text" : "password"}
                      placeholder="XXXX"
                      onChange={formik.handleChange}
                      value={formik.values.pin}
                    />
                    <span onClick={() => setShowPIN(!showPIN)}>
                      {showPIN ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>

          {importDataSuccessful || cardType == "Ecomm" ? (
            <>
              <div className="row labeled-row">
                <div className="form-group-add-card double">
                  <label className="font" style={{ width: "8rem" }}>
                    Name on Card
                  </label>
                  <input
                    name="name"
                    className="form-control formcontrol"
                    placeholder="Jane Doe"
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    style={{ minWidth: "55.5%", flex: 0, marginRight: "1rem" }}
                    disabled={cardType != "Ecomm"}
                  />
                </div>

                {/* <div className="form-group-add-card">
                  <label className="font" style={{ width: "6rem" }}>
                    Exp. Date
                  </label>
                  <DatePicker
                    selected={mmddyyyyToDate(formik.values.expDate || "")}
                    onChange={(date) => {
                      const str = dateToMMDDYYYY(date);
                      formik.setFieldValue("expDate", str);
                    }}
                    dateFormat="MM-dd-yyyy"
                    placeholderText="MM-DD-YYYY"
                    className="form-control formcontrol"
                    name="expDate"
                    disabled={cardType !== "Ecomm" || fieldsdisabled}
                  />
                </div> */}
              </div>

              <div className="row">
                <div className="form-group-add-card">
                  <label className="font" style={{ width: "8rem" }}>
                    {" "}
                    Address
                  </label>
                  <input
                    name="address"
                    className="form-control formcontrol"
                    placeholder="Address"
                    onChange={formik.handleChange}
                    value={formik.values.address}
                    style={{ minWidth: "35%", flex: 0, marginRight: "1rem" }}
                    disabled={cardType != "Ecomm" || fieldsdisabled}
                  />

                  <input
                    name="city"
                    className="form-control formcontrol"
                    placeholder="City"
                    onChange={formik.handleChange}
                    value={formik.values.city}
                    style={{ minWidth: "28.5%", flex: 0 }}
                    disabled={cardType != "Ecomm" || fieldsdisabled}
                  />
                </div>
              </div>

              <div className="row" style={{ marginLeft: "8rem" }}>
                <input
                  name="state"
                  className="form-control formcontrol"
                  placeholder="State"
                  onChange={formik.handleChange}
                  value={formik.values.state}
                  style={{ minWidth: "39.5%", flex: 0 }}
                  disabled={cardType != "Ecomm" || fieldsdisabled}
                />
                <input
                  name="country"
                  className="form-control formcontrol"
                  placeholder="Country"
                  onChange={formik.handleChange}
                  value={formik.values.country}
                  style={{ minWidth: "32.5%", flex: 0 }}
                  disabled={cardType != "Ecomm" || fieldsdisabled}
                />
                <input
                  name="postalCode"
                  className="form-control formcontrol"
                  placeholder="Postal Code"
                  onChange={formik.handleChange}
                  value={formik.values.postalCode}
                  disabled={cardType != "Ecomm" || fieldsdisabled}
                />
              </div>

              {cardType === "Pos" && (
                <div className="row">
                  <input
                    name="features"
                    className="form-control formcontrol"
                    placeholder="Special Features"
                    onChange={formik.handleChange}
                    value={formik.values.features}
                    disabled
                  />
                  {/* <input
                    name="aid"
                    className="form-control formcontrol"
                    placeholder="AID"
                    onChange={formik.handleChange}
                    value={formik.values.aid}
                    disabled
                  /> */}
                  <input
                    name="status"
                    className="form-control formcontrol"
                    placeholder="Status (Active/Block)"
                    onChange={formik.handleChange}
                    value={formik.values.status}
                    disabled
                  />
                </div>
              )}
            </>
          ) : (
            <></>
          )}

          <div className="d-flex justify-content-end gap-3">
            <Link
              to={"/dashboard/maintain-card-stock"}
              className="btn cancel-btn"
            >
              Cancel
            </Link>

            {(importDataSuccessful || cardType === "Ecomm") && !showAddMore ? (
              <>
                <button
                  type="submit"
                  className="btn save-btn"
                  disabled={showAddMore}
                >
                  Add Card
                </button>
              </>
            ) : (
              !showAddMore && (
                <button
                  type="button"
                  className="btn save-btn FONT"
                  onClick={handleImportData}
                  disabled={importingData}
                >
                  Import Data
                </button>
              )
            )}
            {showAddMore || cardType === "Ecomm" ? (
              <div className="buttons">
                <button
                  type="button"
                  className="btn save-btn z-3"
                  onClick={() => {
                    handleAddMoreClick();
                  }}
                >
                  Add more
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </form>
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

export default AddCard;
