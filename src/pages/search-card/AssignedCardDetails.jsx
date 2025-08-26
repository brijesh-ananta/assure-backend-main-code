import PropTypes from "prop-types";
import "./AssignedCardDetails.css";
import Multiselect from "multiselect-react-dropdown";
import { countryCodes } from "../test-card-request/files/TestInfo";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import apiService from "../../services";

function parseTestInfoData(data) {
  try {
    return typeof data === "string" ? JSON.parse(data) : data || {};
  } catch (e) {
    console.error(e);
    return {};
  }
}

const toFixed = (number) => {
  return (+number).toFixed(2);
};

const AssignedCardDetails = ({ card = {}, fetchData, environment }) => {
  const testInfoData = parseTestInfoData(card.testInfoData);
  const [countryOptions, setCountryOptions] = useState([]);
  const [mccOptions, setMccOptions] = useState([]);
  console.log("card", card);
  const initialValues = {
    assignedTo: card.userName || "",
    email: card.userEmail || "",
    totalAllowedUsage: card.totalUsage || 0,
    lastUseDate: card.LastUseDate ? card.LastUseDate.substring(0, 10) : "",
    cardUsed: card?.card_used,
    remainingUsage: card?.remaining_usage || 0,
    offlineDays: card.offlineDays || 0,
    offlineUsage: card.offlineUsage || card?.onlineUsages || 0,
    onlineUsages: testInfoData.onlineUsages || 0,
    releaseCard: "no",
    totalLimit:
      toFixed(
        testInfoData.totalTransactionLimit || card?.totalTransactionLimit
      ) || 0,
    transactionLimit:
      toFixed(
        testInfoData.individualTransactionLimit ||
          card?.individualTransactionLimit
      ) || 0,
    amountUsed: +card.amount_used || 0,
    remainingBalance: card.remaining_balance || 0,
    mccCodesAll: !!testInfoData.mccCodesAll,
    disableCountryCodes: !!testInfoData.countryCodesAll,
    cardStatus: card.cardStatus || "active",

    mccCodes: [],
    countryCodes: [],
  };

  const validationSchema = Yup.object().shape({
    totalAllowedUsage: Yup.number()
      .required("Total allowed usage is required")
      .min(0, "Total allowed usage must be at least 0")
      .integer("Total allowed usage must be an integer"),

    lastUseDate: Yup.date().required("Last use date is required"),

    offlineDays: Yup.number()
      .required("Offline days is required")
      .min(0, "Offline days must be at least 0")
      .integer("Offline days must be an integer"),

    offlineUsage: Yup.number()
      .required("Offline usage is required")
      .min(0, "Offline usage must be at least 0")
      .integer("Offline usage must be an integer"),

    totalLimit: Yup.number()
      .required("Total limit is required")
      .min(0, "Total limit must be at least 0")
      .integer("Total limit must be an integer"),

    transactionLimit: Yup.number()
      .required("Transaction limit is required")
      .min(0, "Transaction limit must be at least 0")
      .integer("Transaction limit must be an integer"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      if (!card?.userCardId) return;

      try {
        const payload = {
          ...values,
          userCardId: card?.userCardId,
          totalUsage: values?.totalAllowedUsage,
          lastUseDate: values?.lastUseDate,
          offlineDays: values?.offlineDays,
          offlineUsage: values?.offlineUsage,
          totalTransactionLimit: values?.totalLimit,
          individualTransactionLimit: values?.transactionLimit,
          countryCodes: values?.countryCodes,
          mccCodesAll: values?.mccCodesAll,
          disableCountryCodes: values?.disableCountryCodes,
          allCountries: values?.disableCountryCodes,
        };
        const res = await apiService.card.updateCardData(payload);

        if (res) {
          toast.success("Card details updated successfully!");
          fetchData();
        }
      } catch (error) {
        console.error(error);
      }
    },
    validateOnChange: false,
    validateOnBlur: true,
  });

  useEffect(() => {
    const matchedCountries = (testInfoData?.countryCodes || [])
      .map((val) => {
        return countryOptions.find((opt) => opt.country_name === val);
      })
      .filter(Boolean);

    const matchedMccCodes = (testInfoData?.mccCodes || [])
      .map((val) => {
        return mccOptions.find((opt) => opt.mcc_code === val);
      })
      .filter(Boolean);

    formik.setValues({
      ...formik.values,
      countryCodes: testInfoData.countryCodesAll ? [] : matchedCountries,
      disableCountryCodes: !!testInfoData.countryCodesAll,
      mccCodes: testInfoData.mccCodesAll ? [] : matchedMccCodes,
      mccCodesAll: !!testInfoData.mccCodesAll,
    });
  }, [countryOptions, mccOptions]);

  useEffect(() => {
    if (testInfoData?.countryCodes?.length) {
      const data =
        countryCodes?.filter((options) =>
          testInfoData?.countryCodes?.includes(options.value)
        ) || [];

      formik.setValues({
        ...formik.values,
        countryCodes: data,
      });
    }
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      const [countries, mccs] = await Promise.all([
        apiService.countries.get({ env: environment }),
        apiService.mccCode.get({ env: environment }),
      ]);

      setCountryOptions(countries?.data || []);
      setMccOptions(mccs?.data || []);
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (formik.errors && formik.submitCount > 0) {
      Object.values(formik.errors).forEach((msg) => {
        if (typeof msg === "string") toast.error(msg);
      });
    }
  }, [formik.errors, formik.submitCount]);

  const handleDisableCountryCodes = (e) => {
    formik.setFieldValue("disableCountryCodes", e.target.checked);
  };

  const handleMccCodesAll = (e) => {
    formik.setFieldValue("mccCodesAll", e.target.checked);
  };

  const handleReleaseCard = async () => {
    if (!card?.userCardId) return;

    if (formik.values.releaseCard === "yes") {
      await apiService.cardProfile.releaseCard(card?.userCardId, {
        testerId: card?.userId,
      });
      window.location.reload();
      return;
    }
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <p className="text-4 font mt-4 text-center">Assigned Card Details</p>

        <div className="assigned-card-wrapper form-field-wrapper">
          <div className="assigned-card-wrapper-child">
            <div className="row">
              <div className="col-6 row align-items-center">
                <label className="col-4 font text-right">Assigned to</label>
                <div className="col-5">
                  <input
                    type="text"
                    className="form-control formcontrol font"
                    name="assignedTo"
                    value={formik.values.assignedTo}
                    disabled
                  />
                </div>
              </div>
              <div className="col-6 row align-items-center">
                <label className="col-4 font text-right">Email</label>
                <div className="col-7">
                  <input
                    type="email"
                    className="form-control formcontrol font"
                    name="email"
                    value={formik.values.email}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-6 row">
                <label className="col-4 ps-0 font text-right text-nowrap">
                  Total Allowed Usage #
                </label>
                <div className="col-5">
                  <input
                    className="form-control formcontrol"
                    type="number"
                    name="totalAllowedUsage"
                    value={formik.values.totalAllowedUsage}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
              <div className="col-6 row align-items-center">
                <label className="col-4 font text-right">Last Use Date</label>
                <div className="col-5">
                  <input
                    className="form-control formcontrol p-0 ps-1"
                    type="date"
                    name="lastUseDate"
                    value={formik.values.lastUseDate}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-6 row">
                <label className="col-4 font text-right">Card Used #</label>
                <div className="col-5">
                  <span className="ms-2">{formik.values.cardUsed}</span>
                </div>
              </div>
              <div className=" col-6 row">
                <label className="col-4 no-wrap font text-right">
                  Remaining Usage #
                </label>
                <span className="highlighted col-2 p-1 ms-3 rounded-1 d-flex align-items-center justify-content-center">
                  {formik.values.remainingUsage}
                </span>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-6 row align-items-center">
                <label className="col-4 font text-right">Offline Days</label>
                <div className="col-5">
                  <input
                    className="form-control formcontrol"
                    type="number"
                    name="offlineDays"
                    value={formik.values.offlineDays}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
              <div className="col-6 row align-items-center">
                <label className="col-4 font text-right">Offline Usage</label>
                <div className="col-3">
                  <input
                    type="number"
                    className="form-control formcontrol"
                    name="offlineUsage"
                    value={formik.values.offlineUsage}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-6 row align-items-center">
                <label className="col-4 font text-right">Total Limit</label>
                <div className="col-5">
                  <input
                    type="number"
                    className="form-control formcontrol"
                    name="totalLimit"
                    value={formik.values.totalLimit}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="row align-items-center col-6">
                <label className="col-4 font text-right">
                  Transaction Limit
                </label>
                <div className="col-5">
                  <input
                    type="number"
                    className="form-control formcontrol"
                    name="transactionLimit"
                    value={formik.values.transactionLimit}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="row col-6">
                <label className="col-4 font text-right">Amount Used</label>
                <span className="col-5 font">
                  {formik.values.amountUsed || 0}
                </span>
              </div>
              <div className="row col-6">
                <label className="col-4 font text-right">
                  Remaining Balance
                </label>
                <span className="p-1 highlighted col-3 p-1 rounded-1 d-flex align-items-center justify-content-center">
                  {formik.values.remainingBalance}
                </span>
              </div>
            </div>

            {card?.cardType == "Ecomm" ? (
              <> </>
            ) : (
              <>
                {Object.keys(testInfoData)?.length ? (
                  <div className="row mt-3 gap-5 align-items-center">
                    <span className="col-2 text-right font pe-3">
                      MCC Codes
                    </span>
                    <div className="col-9 d-flex">
                      <div className="d-lg-flex formcard">
                        <div className="form-check me-4 d-flex gap-1 p-0 align-items-center">
                          <input
                            type="checkbox"
                            className="form-check-input custom-check-box"
                            name="mccCodesAll"
                            id="mccCodesAll"
                            checked={formik.values.mccCodesAll}
                            onChange={handleMccCodesAll}
                          />
                          <label
                            className="form-check-label ms-3"
                            htmlFor="mccCodesAll"
                          >
                            All
                          </label>
                        </div>
                      </div>

                      <div className="d-lg-flex gap-2">
                        <Multiselect
                          options={mccOptions}
                          selectedValues={
                            formik.values.mccCodesAll
                              ? []
                              : formik.values.mccCodes?.slice(0, 5)
                          }
                          onSelect={(selected) =>
                            formik.setFieldValue("mccCodes", selected)
                          }
                          onRemove={(selected) =>
                            formik.setFieldValue("mccCodes", selected)
                          }
                          displayValue="mcc_code"
                          disable={formik.values.mccCodesAll}
                          selectionLimit={5}
                          key={testInfoData.mccCodes}
                          placeholder={"All codes selected"}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {/* Country Codes */}
                {Object.keys(testInfoData)?.length ? (
                  <div className="row mt-3 gap-4 align-items-center">
                    <span className="col-2 font text-right pe-3">
                      Country Codes
                    </span>
                    <div className="col-9 d-flex align-items-center">
                      <div className="d-lg-flex formcard">
                        <div className="form-check me-3 d-flex gap-2 align-items-center">
                          <input
                            type="checkbox"
                            className="form-check-input custom-check-box"
                            name="disableCountryCodes"
                            id="disableCountryCodes"
                            checked={formik.values.disableCountryCodes}
                            onChange={handleDisableCountryCodes}
                          />
                          <label
                            className="form-check-label ms-3"
                            htmlFor="disableCountryCodes"
                          >
                            All
                          </label>
                        </div>
                      </div>
                      <div className="d-lg-flex gap-4">
                        <Multiselect
                          options={countryOptions}
                          selectedValues={
                            formik.values.disableCountryCodes
                              ? []
                              : formik.values.countryCodes?.slice(0, 5)
                          }
                          displayValue="country_name"
                          onSelect={(_) =>
                            formik.setFieldValue("countryCodes", _)
                          }
                          onRemove={(_) =>
                            formik.setFieldValue("countryCodes", _)
                          }
                          disable={formik.values.disableCountryCodes}
                          selectionLimit={5}
                          placeholder="All codes selected"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        </div>
        {/* Card Status Radio */}
        <div
          className="mt-4"
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <div className="formcard card-options" style={{ width: "70%" }}>
            <div className="section">
              <span className="label red-label" style={{ marginRight: "1rem" }}>
                Release Card
              </span>
              <label className="radio-group" style={{ marginRight: "2rem" }}>
                <input
                  type="radio"
                  name="releaseCard"
                  value="yes"
                  checked={formik.values.releaseCard === "yes"}
                  onChange={formik.handleChange}
                  className="custom-check-box form-check-input m-0"
                />
                <span className="font ms-4">Yes</span>
              </label>
              <label className="radio-group">
                <input
                  type="radio"
                  name="releaseCard"
                  value="no"
                  checked={formik.values.releaseCard === "no"}
                  onChange={formik.handleChange}
                  className="custom-check-box form-check-input m-0"
                />
                <span className="font ms-4">No</span>
              </label>
            </div>
          </div>
        </div>
        {/* Buttons */}
        <div className="d-flex justify-content-end gap-4 mt-3 container">
          <Link
            to={"/dashboard/search-card"}
            type="button"
            className="btn cancel-btn"
          >
            Cancel
          </Link>
          {formik.values.releaseCard === "yes" ? (
            <button
              type="button"
              onClick={() => handleReleaseCard()}
              className="btn save-btn"
            >
              Save
            </button>
          ) : (
            <button type="submit" className="btn save-btn">
              Save
            </button>
          )}
        </div>
      </form>
    </>
  );
};

AssignedCardDetails.propTypes = {
  card: PropTypes.any,
  fetchData: PropTypes.any,
  environment: PropTypes.string,
};

export default AssignedCardDetails;
