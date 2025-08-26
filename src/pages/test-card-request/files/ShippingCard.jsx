/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useMemo } from "react";
import axiosToken from "../../../utils/axiosToken";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../utils/AuthContext";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";
import { toYYYYMMDD } from "../../../utils/date";

function ShippingCard({
  requestInfoData,
  fetchData,
  showTrackDetails = false,
  isCompleted,
  canEdit,
}) {
  const [loading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const reload = searchParams.get("reload") || null;

  const [isChecked, setIsChecked] = useState(
    requestInfoData.status === "submitted"
  );
  const [reqInfo, setReqInfo] = useState({});
  const [numTesters, setNumTesters] = useState(0);
  const [partnerId, setPartnerId] = useState("");
  const [shipTo, setShipTo] = useState("one");
  const [testerDetails, setTesterDetails] = useState([]);
  const [multipleAddress, setMultipleAddress] = useState([]);
  const [trackingNumberCount, setTrackingNumberCount] = useState(0);
  const [trackingUsageMap, setTrackingUsageMap] = useState({});

  const [addressDetails, setAddressDetails] = useState([
    {
      id: 1,
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      country: "",
    },
  ]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user.role;

  useEffect(() => {
    if (reload) {
      searchParams.delete("reload");
      navigate({ search: searchParams.toString() }, { replace: true });

      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (requestInfoData?.shipDetails) {
      try {
        const parsedShipDetails =
          requestInfoData.shipDetails &&
          JSON.parse(requestInfoData.shipDetails);

        if (
          parsedShipDetails?.addressDetails?.length ||
          parsedShipDetails.shipTo === "one"
        ) {
          setAddressDetails(parsedShipDetails?.addressDetails);
        } else {
          const updatedAddresses = parsedShipDetails?.updatedTesters?.map(
            (tester) => tester.shippingAddress
          );
          setAddressDetails(updatedAddresses);
        }

        if (parsedShipDetails?.updatedTesters) {
          setTesterDetails(parsedShipDetails?.updatedTesters);
          setMultipleAddress(
            parsedShipDetails?.updatedTesters?.map((tester) => tester)
          );
        }

        setShipTo(parsedShipDetails?.shipTo || "one");
      } catch (error) {
        console.error("Error parsing shipDetails:", error);
      }
    }
  }, [requestInfoData]);

  const isRequester = useMemo(() => user.role === 2, [user.role]);

  useEffect(() => {
    const testerDetails =
      (requestInfoData?.testerDetails &&
        JSON.parse(requestInfoData?.testerDetails)) ||
      "";

    if (testerDetails) {
      setPartnerId(testerDetails?.partner_id);
      setNumTesters(testerDetails?.testers?.length || 0);
    }
  }, [addressDetails, requestInfoData]);

  useEffect(() => {
    const info = requestInfoData?.reqInfo;

    if (info) {
      const parsedData = (info && JSON.parse(info || "{}")) || "";
      setReqInfo(parsedData || {});
    }
  }, [requestInfoData?.reqInfo]);

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...addressDetails];
    if (!updatedAddresses[index]) {
      updatedAddresses[index] = {
        id: index + 1,
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        country: "",
      };
    }
    updatedAddresses[index][field] = value;
    setAddressDetails(updatedAddresses);

    if (field === "trackingNumber") {
      fetchTrackingUsage();
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // set to midnight to avoid timezone issues
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    return oneWeekAgo.toISOString().split("T")[0];
  };

  const handleCancel = () => {
    navigate("/dashboard/request-history");
  };

  const validateFields = useMemo(() => {
    const parsedTestInfo =
      requestInfoData.testInfo && JSON.parse(requestInfoData.testInfo);
    const testerDetails =
      requestInfoData.testerDetails &&
      JSON.parse(requestInfoData.testerDetails);
    const shipDetails =
      requestInfoData.shipDetails && JSON.parse(requestInfoData.shipDetails);

    const isTestInfoValid =
      parsedTestInfo && Object.keys(parsedTestInfo)?.length > 0;
    const isTesterDetailsValid =
      testerDetails && testerDetails?.testers?.length > 0;
    const isShippingDetailsValid =
      shipDetails !== null && shipDetails !== undefined;

    if (isTestInfoValid && isTesterDetailsValid && isShippingDetailsValid) {
      return true;
    } else {
      return false;
    }
  }, [
    requestInfoData.shipDetails,
    requestInfoData.testInfo,
    requestInfoData.testerDetails,
  ]);

  const validateForm = () => {
    if (shipTo === "one") {
      const address = addressDetails[0];

      if (
        !address.firstName ||
        !address.lastName ||
        !address.address ||
        !address.city ||
        !address.state ||
        !address.country ||
        !address.zipCode
      ) {
        toast.error(
          "Please fill in all address fields for the selected address."
        );
        return false;
      }
    }

    if (shipTo === "multiple") {
      const missingAddresses = testerDetails.filter(
        (tester) => Object.keys(tester.shippingAddress).length === 0
      );

      if (missingAddresses.length > 0) {
        toast.error("Please add addresses for all testers before submitting.");
        return false;
      }
    }

    return true;
  };

  const handleSave = async (e, modify = false, tester) => {
    e && e?.preventDefault();
    if (saveLoading) return;

    if (shipTo === "multiple") {
      const missingAddresses = testerDetails?.filter(
        (tester) => Object.keys(tester.shippingAddress).length === 0
      );

      if (missingAddresses.length > 0 && !modify) {
        toast.error("Please add addresses for all testers before submitting.");
        setSaveLoading(false);
        return;
      }
    }

    if (!validateForm()) {
      setSaveLoading(false);
      return;
    }

    const submitData = {
      testerDetails: testerDetails.map((tester) => ({
        testerId: tester.testerId,
        shippingAddress: tester.shippingAddress,
      })),
      addressDetails: shipTo === "one" ? [addressDetails[0]] : multipleAddress,
      numTesters,
      shipTo,
    };

    try {
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        {
          submitData,
          column: "shipDetails",
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Shipping information saved successfully");

        if (modify) {
          navigate(
            `/dashboard/update-user/${tester.testerId}?testingPartner=${partnerId}&from=/dashboard/test-card-request/requestor-info/${requestInfoData.id}?step=5`
          );
        } else {
          await fetchData();
        }
      }
    } catch (error) {
      console.error("Error saving shipping info:", error);
      toast.error("An error occurred while saving the shipping information.");
      setSaveLoading(false);
    }
  };

  const areShippingDetailsFilled = () => {
    if (shipTo === "one") {
      const address = addressDetails[0];
      if (!address.shippingDate || !address.trackingNumber) {
        return false;
      }
    }

    if (shipTo === "multiple") {
      const missingDetails = testerDetails.filter(
        (tester) =>
          !tester.shippingAddress.shippingDate ||
          !tester.shippingAddress.trackingNumber
      );

      if (missingDetails?.length > 0) {
        return false;
      }
    }

    // Return true if all the required details are filled
    return true;
  };

  const handleSaveShippingDetails = async () => {
    if (saveLoading) return;

    setSaveLoading(true);

    const submitData = {
      testerDetails: testerDetails.map((tester) => ({
        testerId: tester.testerId,
        shippingAddress: tester.shippingAddress,
      })),
      addressDetails: shipTo === "one" ? addressDetails : multipleAddress,
      numTesters: testerDetails.length,
      shipTo,
    };

    if (shipTo === "one") {
      const address = addressDetails[0];
      if (address.shippingDate && address.trackingNumber) {
        submitData.status = "shipped";
      }
    }

    if (shipTo === "multiple") {
      submitData.testerDetails.forEach((tester) => {
        const address = tester.shippingAddress;
        if (address.shippingDate && address.trackingNumber) {
          address.status = "shipped";
        }
      });
    }

    try {
      const payload = {
        submitData,
        column: "addressDetails",
        status: requestInfoData.status || "approved",
        updateDetail: true,
      };

      if (areShippingDetailsFilled()) {
        payload.status = "completed";
      }

      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Shipping information saved successfully");

        if (payload.status === "completed") {
          navigate("/dashboard/test-card-fulfilment");
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error saving shipping info:", error);
      toast.error("An error occurred while saving the shipping information.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmitTCRequest = async () => {
    if (!isChecked) {
      toast.error("Please verify all the details");
      return;
    }

    if (reqInfo.status !== "approved") {
      toast.error("Please update the status");
      return;
    }

    if (!validateFields) {
      toast.error("Please full fill all the details");
      return;
    }

    try {
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        {
          column: "status",
          submitData: {
            status: "submitted",
          },
          status: "submitted",
        }
      );

      if (response.status === 200 || response.status === 201) {
        await fetchData();
        toast.success("Tc request submitted");
        navigate("/dashboard/request-history");
      }
    } catch (error) {
      console.error("Error:-", error);
      toast.error("An error occurred while submitting.");
      setSaveLoading(false);
    }
  };

  const handleCheckedDetailsChange = (e) => {
    setIsChecked(e.target.value === "yes");
  };

  const getShipmentDetails = useCallback(
    (details, tester) => {
      return (
        <div className="w-auto">
          <span className="fw-bold">Address</span>
          <br />
          {details.address && `${details.address},`}{" "}
          {details.name && `${details.name},`}{" "}
          {details?.city && `${details?.city},`} <br />{" "}
          {details?.state && `${details?.state},`}{" "}
          {details?.country && `${details?.country},`}{" "}
          {details?.postalCode || ""}
          <br />
          {!canEdit &&
            requestInfoData.status != "submitted" &&
            userRole == 2 && (
              <button
                onClick={() => {
                  handleSave(null, true, tester);
                }}
                className="btn save-btn mt-2 min-w-100 max-w-100"
                type="button"
              >
                Modify
              </button>
            )}
        </div>
      );
    },
    [canEdit, handleSave]
  );

  const isApproved = useMemo(
    () => requestInfoData.status === "submitted",
    [requestInfoData.status]
  );

  const disableSubmit = useMemo(() => {
    const statuses = ["submitted", "approved", "assign_card", "shipped"];
    return statuses.includes(requestInfoData.status);
  }, [requestInfoData.status]);

  const handleTesterAddressChange = (index, field, value) => {
    setTesterDetails((prev) =>
      prev.map((tester, i) => {
        if (i === index) {
          return {
            ...tester,
            shippingAddress: {
              ...tester.shippingAddress,
              [field]: value,
            },
          };
        }
        return tester;
      })
    );

    setMultipleAddress((prev) =>
      prev.map((addr, i) => {
        if (i === index) {
          return {
            ...testerDetails[index].shippingAddress,
            [field]: value,
          };
        }
        return addr;
      })
    );

    if (field === "trackingNumber") {
      fetchTrackingUsage();
    }
  };

  const fetchTrackingUsage = async () => {
    try {
      if (shipTo === "one") {
        const trackingNumber =
          addressDetails?.[0]?.trackingNumber?.trim() ||
          addressDetails?.[0]?.tracking_number?.trim();

        if (trackingNumber?.length >= 3) {
          const { data } = await axiosToken.post(
            "/card-requests/check-tracking-number",
            {
              shipTo: "single",
              trackingNumber,
            }
          );
          setTrackingNumberCount(data?.total);
        } else {
          setTrackingNumberCount(0);
          setTrackingUsageMap({});
        }
      }

      if (shipTo === "multiple") {
        const trackingNumbers = testerDetails
          .map(
            (t) =>
              t?.shippingAddress?.trackingNumber?.trim() ||
              t?.shippingAddress?.tracking_number
          )
          .filter((val) => val && val.length >= 3);

        if (trackingNumbers.length === 0) return setTrackingUsageMap({});

        const { data } = await axiosToken.post(
          "/card-requests/check-tracking-number",
          {
            shipTo: "multiple",
            trackingNumbers,
          }
        );

        const map = {};
        data?.results?.forEach(({ trackingNumber, count }) => {
          map[trackingNumber] = count;
        });

        setTrackingUsageMap(map);
      }
    } catch (error) {
      console.error("Error fetching tracking count:", error);
      setTrackingUsageMap({});
    }
  };

  useEffect(() => {
    fetchTrackingUsage();
  }, [addressDetails, testerDetails, shipTo]);

  return (
    <>
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
      <div className="container-fluid">
        <p className="blue-heading text-center">Shipping Details</p>
        <form className="request-form form-field-wrapper">
          <div className="row mb-4 w-100 align-items-center">
            <span className="me-3 font col-3 text-right">Ship to</span>
            <div className="d-lg-flex formcard col-5">
              {["one", "multiple"].map((option) => (
                <div
                  key={option}
                  className="form-check me-3 d-flex gap-2 align-items-center"
                >
                  <input
                    className="form-check-input"
                    type="radio"
                    name="shipTo"
                    value={option}
                    checked={shipTo === option}
                    onChange={(e) => setShipTo(e.target.value)}
                    disabled={canEdit || disableSubmit || userRole != 2}
                  />
                  <label className="form-check-label">
                    {option === "one"
                      ? "One Address"
                      : option === "multiple"
                      ? "Multiple Addresses (Per User Profile)"
                      : "Mobile Card Only"}
                  </label>
                </div>
              ))}
            </div>

            <div className="col-3 d-flex align-items-center gap-3">
              <input
                name="requestorName"
                placeholder="0"
                type="text"
                className="form-control formcontrol custom-input-w-100"
                value={numTesters}
                disabled
              />

              <span>Quantity</span>
            </div>
          </div>

          {shipTo === "one" && (
            <div className="d-flex flex-column gap-3 m-auto w-60">
              <div className="row">
                <div className="col-6">
                  <label className="font">First Name</label>
                  <input
                    disabled={isApproved || !isRequester || canEdit}
                    placeholder="First Name"
                    type="text"
                    name="firstName"
                    value={addressDetails[0]?.firstName || ""}
                    onChange={(e) =>
                      handleAddressChange(0, "firstName", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>

                <div className="col-6">
                  <label className="font">Last Name</label>
                  <input
                    disabled={isApproved || !isRequester || canEdit}
                    placeholder="Last Name"
                    type="text"
                    name="lastName"
                    value={addressDetails[0]?.lastName || ""}
                    onChange={(e) =>
                      handleAddressChange(0, "lastName", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="font">Address</label>
                  <input
                    disabled={isApproved || !isRequester || canEdit}
                    placeholder="Unit/Building and Street Name"
                    type="text"
                    name="address"
                    value={addressDetails[0]?.address || ""}
                    onChange={(e) =>
                      handleAddressChange(0, "address", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>

                <div className="col-6">
                  <label className="font">City</label>
                  <input
                    disabled={isApproved || !isRequester || canEdit}
                    placeholder="City"
                    type="text"
                    name="city"
                    value={addressDetails[0]?.city || ""}
                    onChange={(e) =>
                      handleAddressChange(0, "city", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>
              </div>

              <div className="d-flex gap-5">
                <div className="">
                  <label className="font">State</label>
                  <input
                    disabled={isApproved || !isRequester || canEdit}
                    placeholder="State"
                    type="text"
                    name="state"
                    value={addressDetails[0]?.state || ""}
                    onChange={(e) =>
                      handleAddressChange(0, "state", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>

                <div className="">
                  <label className="font">Country</label>
                  <input
                    disabled={isApproved || !isRequester || canEdit}
                    placeholder="Country"
                    type="text"
                    name="country"
                    value={addressDetails[0]?.country || ""}
                    onChange={(e) =>
                      handleAddressChange(0, "country", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>

                <div className="">
                  <label className="font">Zip Code</label>
                  <input
                    disabled={isApproved || !isRequester || canEdit}
                    placeholder="Zip Code"
                    type="text"
                    name="zipCode"
                    value={addressDetails[0]?.zipCode || ""}
                    onChange={(e) =>
                      handleAddressChange(0, "zipCode", e.target.value)
                    }
                    className="form-control formcontrol"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {shipTo === "multiple" && (
            <div className="mt-4">
              <div className="accordion border-0" id={`testerAccordion`}>
                {testerDetails?.map((tester, index) => (
                  <div key={index} className="accordion-item mt-4 w-80 m-auto">
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className="accordion-button ps-5"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="true"
                        aria-controls={`collapse${index}`}
                      >
                        <div className="d-flex align-items-center w-100">
                          {tester?.shippingAddress?.isShipped ? (
                            <div className="check-circle me-2">
                              <i className="fas fa-check"></i>
                            </div>
                          ) : (
                            userRole == 1 && (
                              <div className="check-circle check-circle-grey me-2">
                                <X />
                              </div>
                            )
                          )}
                          <span className="tester-link">
                            Tester_{index + 1}
                          </span>
                          <div className="ms-4 flex-grow-1 row">
                            <div className="col-md-6">
                              <span className="font">{tester.name}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </h2>

                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading${index}`}
                      data-bs-parent={`#testerAccordion`}
                    >
                      <div className="accordion-body">
                        <div className="w-100 me-5 pe-5 d-flex align-items-end justify-content-end">
                          <div className="d-flex flex-column">
                            {Object.keys(tester.shippingAddress)?.length > 0
                              ? getShipmentDetails(
                                  tester.shippingAddress,
                                  tester
                                )
                              : !isApproved && (
                                  <Link
                                    to={`/dashboard/update-user/${tester.testerId}?testingPartner=${partnerId}&from=/dashboard/test-card-request/requestor-info/${requestInfoData.id}?step=5`}
                                  >
                                    Add Address
                                  </Link>
                                )}
                          </div>
                        </div>

                        {showTrackDetails && shipTo == "multiple" && (
                          <div className="d-flex flex-column align-items-center gap-3 mt-5 w-100 form-field-wrapper">
                            <div className="row w-100 justify-content-end me-5">
                              <div className="col-4 d-flex flex-column">
                                <label className="font">Shipping Date</label>
                                <DatePicker
                                  placeholder="Shipping Date"
                                  minDate={getMinDate()}
                                  name="shipping_date"
                                  className="form-control formcontrol mt-2 pe-1 h-50"
                                  required
                                  disabled={
                                    isCompleted ||
                                    tester?.shippingAddress?.isShipped
                                  }
                                  selected={
                                    tester.shippingAddress?.shippingDate ||
                                    tester.shippingAddress?.shipping_date ||
                                    ""
                                  }
                                  dateFormat="MM-dd-yyyy"
                                  placeholderText="MM-DD-YYYY"
                                  onChange={(date) => {
                                    const str = toYYYYMMDD(date);
                                    handleTesterAddressChange(
                                      index,
                                      "shippingDate",
                                      str
                                    );
                                  }}
                                />
                              </div>
                              <div className="col-3">
                                <label className="font">Tracking Number</label>
                                <input
                                  placeholder="Tracking Number"
                                  type="text"
                                  name="tracking_number"
                                  className="form-control formcontrol mt-2 h-50"
                                  required
                                  value={
                                    tester.shippingAddress?.trackingNumber ||
                                    tester.shippingAddress?.tracking_number ||
                                    ""
                                  }
                                  disabled={
                                    isCompleted ||
                                    tester?.shippingAddress?.isShipped
                                  }
                                  onChange={(e) =>
                                    handleTesterAddressChange(
                                      index,
                                      "trackingNumber",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="col-3 d-flex align-items-center justify-content-center">
                                <label className="font">
                                  {(() => {
                                    const rawTracking =
                                      tester?.shippingAddress?.trackingNumber ??
                                      tester?.shippingAddress
                                        ?.tracking_number ??
                                      tester?.shippingAddress?.[
                                        "tracking)number"
                                      ] ??
                                      "";

                                    const trackingNumber = rawTracking?.trim();
                                    const usageCount = trackingNumber
                                      ? trackingUsageMap?.[trackingNumber] ?? 0
                                      : 0;

                                    return trackingNumber && usageCount > 0 ? (<>
                                   
                                      <label className="font">
                                        Usage#{usageCount}
                                      </label>
                                    
                                      </>
                                    ) : null;
                                  })()}
                                </label>
                              </div>
                              <div className="col-1 mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      !tester.shippingAddress?.shippingDate ||
                                      !tester.shippingAddress?.trackingNumber ||
                                      tester.shippingAddress?.trackingNumber
                                        ?.length < 4
                                    ) {
                                      toast.error(
                                        "Please full fill all the shipping details"
                                      );
                                      return;
                                    }
                                    handleSaveShippingDetails();
                                  }}
                                  disabled={
                                    isCompleted ||
                                    tester?.shippingAddress?.isShipped
                                  }
                                  className="btn save-btn save-next-btn mt-4 border-0 max-w-100"
                                >
                                  {loading ? "Saving..." : <div>Save</div>}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(requestInfoData.status === "draft" ||
            requestInfoData.status == "returned" ||
            requestInfoData.status == undefined) &&
            userRole == 2 && (
              <div className="button-group align-content-center justify-content-end mt-5 me-5">
                <button
                  type="button"
                  className="btn cancel-btn"
                  onClick={handleCancel}
                  disabled={loading || canEdit}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  type="button"
                  className="btn save-btn"
                  disabled={isCompleted || canEdit}
                >
                  <span>Save</span>
                </button>
              </div>
            )}
        </form>

        {user.role == 2 && (
          <div className="request-form aqua-border-t mt-4 d-flex align-items-center justify-content-center flex-column py-4 gap-4">
            <div className="row">
              <label htmlFor="" className="col-8">
                I have checked the request&apos;s details
              </label>
              <div className="formcard col-4 d-flex gap-3">
                <div className="form-check d-flex gap-1 align-items-center">
                  <input
                    name="requestForSelf"
                    id="details-checked-yes"
                    className="form-check-input"
                    type="radio"
                    value="yes"
                    checked={isChecked === true}
                    onChange={handleCheckedDetailsChange}
                    disabled={
                      disableSubmit || loading || canEdit
                      // ||
                      // !isChecked ||
                      // reqInfo?.status !== "approved" ||
                      // !validateFields ||
                      // disableSubmit
                    }
                  />
                  <label
                    className="form-check-label ms-3"
                    htmlFor="details-checked-yes"
                  >
                    Yes
                  </label>
                </div>
                <div className="form-check me-3 d-flex gap-1 align-items-center">
                  <input
                    name="requestForSelf"
                    id="details-checked-no"
                    className="form-check-input"
                    type="radio"
                    value="no"
                    checked={isChecked === false}
                    onChange={handleCheckedDetailsChange}
                    disabled={disableSubmit || loading || canEdit}
                  />
                  <label
                    className="form-check-label ms-3"
                    htmlFor="details-checked-no"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2" style={{ marginRight: "-50%" }}>
              <button
                className="btn cancel-btn"
                onClick={() => {
                  navigate("/dashboard/request-history");
                }}
                disabled={
                  loading ||
                  !isChecked ||
                  reqInfo?.status !== "approved" ||
                  !validateFields ||
                  disableSubmit ||
                  canEdit
                }
              >
                Save Draft
              </button>
              <button
                className="btn save-btn save-next-btn"
                onClick={() => handleSubmitTCRequest()}
                disabled={
                  loading ||
                  !isChecked ||
                  reqInfo?.status !== "approved" ||
                  !validateFields ||
                  disableSubmit ||
                  canEdit
                }
              >
                Submit TC Request
              </button>
            </div>
          </div>
        )}

        {showTrackDetails && shipTo == "one" && (
          <div className="d-flex flex-column align-items-center gap-3 mt-5 w-100 form-field-wrapper">
            <div className="row w-90">
              <div className="col-4 d-flex flex-column">
                <label className="font">Shipping Date</label>
                <DatePicker
                  placeholder="Shipping Date"
                  minDate={getMinDate()}
                  name="shipping_date"
                  className="form-control formcontrol mt-2 pe-1 h-50"
                  required
                  selected={
                    addressDetails[0]?.shippingDate ||
                    addressDetails[0]?.shipping_date ||
                    ""
                  }
                  dateFormat="MM-dd-yyyy"
                  placeholderText="MM-DD-YYYY"
                  onChange={(date) => {
                    const str = toYYYYMMDD(date);
                    handleAddressChange(0, "shippingDate", str);
                    }}
                    disabled={isCompleted || addressDetails[0]?.isShipped}
                  />
                  </div>
                  <div className="col-3">
                  <label className="font">Tracking Number</label>
                  <input
                    placeholder="Tracking Number"
                    type="text"
                    name="tracking_number"
                    className="form-control formcontrol mt-2 h-50"
                    required
                    
                    value={
                    addressDetails[0]?.trackingNumber ||
                    addressDetails[0]?.tracking_number ||
                    ""
                    }
                    onChange={(e) =>
                    handleAddressChange(0, "trackingNumber", e.target.value)
                    }
                    disabled={isCompleted || addressDetails[0]?.isShipped}
                  />
                  </div>
                  <div className="col-2 d-flex flex-column align-items-center justify-content-center">
                  <label className="font mb-2">Usage#</label>
                  <span className="text-danger font">{trackingNumberCount}</span>
                  </div>
                  <div className="col-3">
                  <button
                    onClick={() => {
                    if (
                      !addressDetails[0]?.shippingDate ||
                      !addressDetails[0]?.trackingNumber ||
                      addressDetails[0]?.trackingNumber?.length < 4
                    ) {
                      toast.error("Please full fill all the shipping details");
                      return;
                    }
                    handleSaveShippingDetails();
                  }}
                  disabled={isCompleted || addressDetails[0]?.isShipped}
                  className="btn save-btn save-next-btn w-100 mt-4 border-0"
                >
                  {loading ? "Saving..." : <div>Save</div>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ShippingCard;
