/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import axiosToken from "../../../utils/axiosToken";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";
import RequestStatusMap from "./RequestStatusMap";
import { convertUTCtoEST } from "../../../utils/date";

function RequestorInfo({
  requestInfoData,
  terminalType,
  environment,
  userData,
  handleSaveAndNext,
  fetchData,
  snStatusVerify,
  setSnStatusVerify,
  isCompleted,
  canEdit,
  isRequester,
  afterSubmitStatus,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();
  const [requestInfo, setRequestInfoData] = useState({
    environment: environment,
    terminalType: terminalType,
    requestStatus: "",
    snRequest: "",
    status: "",
    requestForSelf: "yes",
    email: "",
    requestorName: "",
    partnerName: "",
    partnerContact: "",
    partnerContactEmail: "",
    isChecked: false,
  });

  const [start, setStart] = useState(requestInfoData.id ? true : false);
  const [totalSnReq, setTotalSnReq] = useState(0);
  const [totalEmailReq, setTotalEmailReq] = useState(0);
  const [tcsmeComment, setTcsmeComment] = useState(
    requestInfoData?.tcsmeComments || ""
  );
  const { user } = useAuth();

  useEffect(() => {
    if (requestInfoData) {
      setTcsmeComment(requestInfoData?.tcsmeComments || "");
    }

    if (requestInfoData?.reqInfo) {
      const parsedReqInfo = JSON.parse(requestInfoData.reqInfo);

      setSnStatusVerify(requestInfoData?.snStatusVerify === "1");
      setRequestInfoData((prevData) => ({
        ...prevData,
        ...parsedReqInfo,
      }));
    }
  }, [requestInfoData]);

  useEffect(() => {
    if (
      (!requestInfo.email || !requestInfo.requestorName) &&
      userData &&
      requestInfo.requestForSelf == "yes"
    ) {
      setRequestInfoData((prevData) => ({
        ...prevData,
        email: userData?.email || "",
        requestorName: userData?.firstName + " " + userData?.lastName || "",
      }));
    }
  }, [requestInfo, userData]);

  const issnStatusVerified = useMemo(
    () =>
      requestInfoData.snStatusVerify == 1 &&
      requestInfoData?.status === "submitted",
    [requestInfoData.snStatusVerify, requestInfoData?.status]
  );

  const handleSnStatusChange = async (
    status = requestInfoData.status || "draft"
  ) => {
    if (!requestInfoData.id) return;

    if (status === "returned" && !tcsmeComment) {
      toast.error("TC comment is empty");
      return;
    }

    if (status === "approved" && !snStatusVerify) {
      toast.error("Please verify sn status in Request information");
      return;
    }

    try {
      const testerDetails =
        requestInfoData?.testerDetails &&
        JSON.parse(requestInfoData?.testerDetails);

      const submitData = {
        column: "tcsmeComments",
        submitData: tcsmeComment,
        status: status,
        snStatusVerify: snStatusVerify && status === "approved" ? "1" : "0",
        environment: environment,
      };

      if (
        environment == 3 &&
        testerDetails?.physicalCard == "no" &&
        testerDetails?.mediaCard == "yes"
      ) {
        submitData.status = "completed";
      }

      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        submitData
      );

      if (response.status === 200 || response.status === 201) {
        await fetchData(true);
        toast.success(response?.data?.message || "Done");

        if (
          environment == 3 &&
          testerDetails?.physicalCard == "no" &&
          testerDetails?.mediaCard == "yes"
        ) {
          navigate("/dashboard/request-history");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e, goNext = false) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      const submitData = {
        environment: environment,
        terminalType: terminalType,
        requestStatus: requestInfo.requestStatus || "",
        snRequest: requestInfo.snRequest || "",
        status: requestInfo.status || "draft",
        requestForSelf: requestInfo.requestForSelf || "yes",
        email: requestInfo.email || "",
        requestorName: requestInfo.requestorName || "",
        partnerName: requestInfo.partnerName || "",
        partnerContact: requestInfo.partnerContact || "",
        partnerContactEmail: requestInfo.partnerContactEmail || "",
      };

      const newData = {
        terminalType: terminalType,
        environment: environment,
        column: "reqInfo",
        submitData: submitData,
        status: "draft",
      };

      let response;
      if (requestInfoData?.id) {
        response = await axiosToken.put(
          `/card-requests/${requestInfoData.id}`,
          newData
        );
      } else {
        response = await axiosToken.post(`/card-requests`, newData);
      }

      if (response.status === 200 || response.status === 201) {
        setLoading(false);
        toast.success("Request saved successfully");
        navigate(
          `/dashboard/test-card-request/${
            response.data.cardRequestId || requestInfoData.id
          }${goNext ? "?step=2" : ""}`,
          {
            state: { environment, terminalType },
          }
        );

        if (goNext) {
          setTimeout(() => {
            handleSaveAndNext(2);
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("An error occurred while saving the request.");
      setLoading(false);
    }
  };

  const handleRequestForSelfChange = (e) => {
    const value = e.target.value;
    if (value === "yes") {
      setRequestInfoData({
        ...requestInfo,
        requestForSelf: "yes",
        email: userData?.email || "",
        requestorName: userData?.firstName + " " + userData?.lastName || "",
      });
    } else {
      setRequestInfoData({
        ...requestInfo,
        requestForSelf: "no",
        email: "",
        requestorName: "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked = false } = e.target;

    if (name === "snStatusVerify") {
      setSnStatusVerify(checked);
      return;
    }

    setRequestInfoData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    navigate("/dashboard/request-history");
  };

  const validateForm = () => {
    if (!requestInfo.requestForSelf) {
      toast.error("Please select whether this request is for yourself.");
      return false;
    }

    if (requestInfo.requestForSelf === "yes" && !requestInfo.email) {
      toast.error("Please enter a valid email.");
      return false;
    }

    if (!requestInfo.email && !/\S+@\S+\.\S+/.test(requestInfo.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!requestInfo.requestorName) {
      toast.error("Please enter the requestor's name.");
      return false;
    }

    if (!requestInfo.snRequest) {
      toast.error("Please enter the SN Request number.");
      return false;
    }

    if (!requestInfo.status) {
      toast.error("Please select a status.");
      return false;
    }

    if (!["approved", "draft"].includes(requestInfo.status)) {
      toast.error("Invalid status selected.");
      return false;
    }

    // if (requestInfo.requestForSelf === "no") {
    //   if (!requestInfo.partnerName) {
    //     toast.error("Please enter the partner name.");
    //     return false;
    //   }

    //   if (!requestInfo.partnerContact) {
    //     toast.error("Please enter the partner contact.");
    //     return false;
    //   }

    //   if (!requestInfo.partnerContactEmail) {
    //     toast.error("Please enter the partner contact email.");
    //     return false;
    //   }

    //   if (
    //     requestInfo.partnerContactEmail &&
    //     !/\S+@\S+\.\S+/.test(requestInfo.partnerContactEmail)
    //   ) {
    //     toast.error("Please enter a valid partner contact email address.");
    //     return false;
    //   }
    // }

    return true;
  };

  const fetchSNRequest = useCallback(async () => {
    try {
      const resp = await axiosToken.get(
        `card-requests/snNumber/${requestInfo.snRequest}`
      );
      if (resp.data) {
        setTotalSnReq(resp.data.total);
      }
    } catch (error) {
      console.error(error);
    }
  }, [requestInfo.snRequest]);

  const fetchEmailRequests = useCallback(async () => {
    try {
      let email = "";

      if (canEdit || requestInfoData.status === "submitted") {
        const reqInfo =
          requestInfoData?.reqInfo && JSON.parse(requestInfoData.reqInfo);
        email = reqInfo.email || userData?.email;
      } else {
        email = requestInfo.email;
      }

      const resp = await axiosToken.get(
        `card-requests/email-requests/${email}`
      );
      if (resp.data) {
        setTotalEmailReq(resp.data.total);
      }
    } catch (error) {
      console.error(error);
    }
  }, [requestInfo.email]);

  useEffect(() => {
    if (requestInfo.snRequest && requestInfo.snRequest.length > 2) {
      setTimeout(() => {
        fetchSNRequest();
      }, 300);
    }
  }, [fetchSNRequest, requestInfo.snRequest]);

  useEffect(() => {
    if (requestInfo.email && requestInfo.email.length > 2) {
      setTimeout(() => {
        fetchEmailRequests();
      }, 300);
    }
  }, [fetchEmailRequests, requestInfo.email]);

  return (
    <div className="container-fluid">
      <>
        {!requestInfoData.id && !start ? (
          <RequestStatusMap
            setStart={setStart}
            requestInfoData={requestInfoData}
            environment={environment}
            terminalType={terminalType}
          />
        ) : (
          <>
            <p className="blue-heading text-center text-capitalize">
              Requestor information
            </p>
            <form onSubmit={handleSave} className="request-form">
              <div className="form-content-wrapper w-80 m-auto">
                <div className="form-field-wrapper d-flex flex-column center">
                  <div className="d-lg-flex justify-content-lg-between justify-content-lg-start justify-content-center align-items-center stepform mb-lg-4 mb-3">
                    <span className="d-block font">
                      Service Now Request Status
                    </span>
                    {requestInfoData.status != "draft" &&
                      requestInfoData.status != "returned" &&
                      requestInfoData.status != undefined &&
                      userRole === 1 && (
                        <div className="form-check custom-check-box d-flex align-items-center justify-content-center gap-2 formcard">
                          <label
                            className="form-check-label"
                            htmlFor="snStatusVerify"
                          >
                            SN Status verified
                          </label>
                          <input
                            className="form-check-input m-0"
                            style={{
                              padding: "10px !important",
                              borderRadius: "80px !important",
                            }}
                            disabled={
                              issnStatusVerified ||
                              afterSubmitStatus.includes(requestInfoData.status)
                            }
                            type="checkbox"
                            value={1}
                            checked={snStatusVerify || isCompleted}
                            onChange={(e) => handleInputChange(e)}
                            name="snStatusVerify"
                            id="snStatusVerify"
                          />
                        </div>
                      )}
                  </div>
                  <div className="mb-lg-4 ms-5 mb-2 pb-4 d-flex justify-content-between gap-5">
                    <div className="d-flex flex-column gap-3">
                      <div className="row align-items-center">
                        <label className="col text-right">SN Request #</label>
                        <input
                          name="snRequest"
                          placeholder="Enter SN ticket number"
                          type="text"
                          className="col form-control formcontrol min-w-200"
                          value={requestInfo.snRequest}
                          onChange={(e) => handleInputChange(e)}
                          disabled={
                            (requestInfoData.status != "draft" &&
                              requestInfoData.status != "returned" &&
                              requestInfoData.status != undefined) ||
                            !isRequester ||
                            canEdit
                          }
                        />
                      </div>
                      <div className="row">
                        <span className="col-5 text-right">Status</span>
                        <div className="col-6 d-flex formcard gap-5">
                          <div className="form-check me-3 d-flex gap-3 align-items-center">
                            <input
                              name="status"
                              className="form-check-input"
                              id="statusApproved"
                              type="radio"
                              value="approved"
                              checked={requestInfo.status === "approved"}
                              onChange={(e) => handleInputChange(e)}
                              disabled={
                                (requestInfoData.status != "draft" &&
                                  requestInfoData.status != "returned" &&
                                  requestInfoData.status != undefined) ||
                                !isRequester ||
                                canEdit
                              }
                            />
                            <label
                              className="form-check-label "
                              htmlFor="statusApproved"
                            >
                              Approved
                            </label>
                          </div>
                          <div className="form-check me-3 d-flex gap-3 align-items-center">
                            <input
                              name="status"
                              id="statusDraft"
                              className="form-check-input"
                              type="radio"
                              value="draft"
                              checked={requestInfo.status === "draft"}
                              onChange={(e) =>
                                setRequestInfoData({
                                  ...requestInfo,
                                  status: e.target.value,
                                })
                              }
                              disabled={
                                (requestInfoData.status != "draft" &&
                                  requestInfoData.status != "returned" &&
                                  requestInfoData.status != undefined) ||
                                !isRequester ||
                                canEdit
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="statusDraft"
                            >
                              DRAFT
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="me-5 ps-5">
                      <div className="d-flex gap-2 align-align-items-center justify-content-center">
                        <span>Requests &nbsp; #</span>{" "}
                        <i
                          title="Total requests for this SN request"
                          className="fas gray fa-exclamation-circle h6 m-0 d-flex align-items-center"
                        ></i>
                      </div>

                      <div className="text-center w-100">{totalSnReq || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Requestor Details */}
                <div className="form-field-wrapper d-flex flex-column ">
                  <div className="d-lg-flex justify-content-lg-between justify-content-lg-start justify-content-center align-items-center stepform mb-lg-4 mb-3">
                    <span className="d-block font">Requestor details</span>
                  </div>
                  <div className="mb-lg-4 mb-2 pb-4 d-flex justify-content-between gap-5">
                    <div className="pb-4 mb-lg-4 mb-2 ms-lg-5 d-flex flex-column gap-3">
                      <div className="row">
                        <span className="col-5 text-right">
                          Request for self
                        </span>
                        <div className="formcard col-5 d-flex gap-5">
                          <div className="form-check d-flex gap-3 align-items-center">
                            <input
                              name="requestForSelf"
                              id="requestForSelfYes"
                              className="form-check-input"
                              type="radio"
                              value="yes"
                              checked={requestInfo.requestForSelf === "yes"}
                              onChange={handleRequestForSelfChange}
                              disabled={
                                (requestInfoData.status != "draft" &&
                                  requestInfoData.status != "returned" &&
                                  requestInfoData.status != undefined) ||
                                !isRequester ||
                                canEdit
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="requestForSelfYes"
                            >
                              Yes
                            </label>
                          </div>
                          <div className="form-check me-3 d-flex gap-3 align-items-center">
                            <input
                              name="requestForSelf"
                              id="requestForSelfNo"
                              className="form-check-input"
                              type="radio"
                              value="no"
                              checked={requestInfo.requestForSelf === "no"}
                              onChange={handleRequestForSelfChange}
                              disabled={
                                (requestInfoData.status != "draft" &&
                                  requestInfoData.status != "returned" &&
                                  requestInfoData.status != undefined) ||
                                !isRequester ||
                                canEdit
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="requestForSelfNo"
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="row align-items-center">
                        <label className=" col-5 text-right">Email:</label>
                        <div className="position-relative col-7">
                          <input
                            name="email"
                            placeholder="Enter requestor email address"
                            type="email"
                            className="form-control formcontrol w-250-p"
                            value={requestInfo.email}
                            onChange={handleInputChange}
                            disabled={
                              requestInfo.requestForSelf === "yes" ||
                              (requestInfoData.status != "draft" &&
                                requestInfoData.status != "returned" &&
                                requestInfoData.status != undefined) ||
                              !isRequester ||
                              canEdit
                            }
                          />
                        </div>
                      </div>
                      <div className="row align-items-center">
                        <label className="col-5 text-right">
                          Requestor Name
                        </label>
                        <div className="col-7">
                          <input
                            name="requestorName"
                            placeholder="Enter Requestor name"
                            type="text"
                            className="form-control formcontrol col-7 w-250-p"
                            value={requestInfo.requestorName}
                            onChange={handleInputChange}
                            disabled={
                              requestInfo.requestForSelf === "yes" ||
                              (requestInfoData.status != "draft" &&
                                requestInfoData.status != "returned" &&
                                requestInfoData.status != undefined) ||
                              !isRequester ||
                              canEdit
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="me-5 ps-5">
                      <div className="d-flex gap-2 align-align-items-center justify-content-center">
                        <span className="">Requests &nbsp; #</span>{" "}
                        <i
                          title={`Total requests from ${requestInfo.email}`}
                          className="fas gray fa-exclamation-circle h6 m-0 d-flex align-items-center"
                        ></i>
                      </div>

                      <div className="text-center w-100">
                        {totalEmailReq || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {userRole == 2 && requestInfoData?.status == "returned" && (
                <div className="font max-w-250-p container mb-5 d-flex align-items-center">
                  {tcsmeComment || "-"}
                </div>
              )}

              <div className="btn-section col-12 d-flex justify-content-end">
                {userRole == 2 &&
                  (requestInfoData.status === "draft" ||
                    requestInfoData.status == "returned" ||
                    requestInfoData.status == undefined) && (
                    <div className="button-group me-5">
                      <button
                        type="button"
                        className="btn cancel-btn"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async (e) => {
                          try {
                            e.preventDefault();
                            await handleSave(e, true);
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        type="button"
                        className="btn save-btn save-next-btn"
                        disabled={loading || canEdit}
                      >
                        <span>Save & Next</span>
                      </button>
                      <button
                        onClick={handleSave}
                        type="button"
                        className="btn save-btn"
                        disabled={canEdit}
                      >
                        <span>Save</span>
                      </button>
                    </div>
                  )}
              </div>
            </form>

            {user.role == 1 && requestInfoData.status != "draft" && (
              <div className="request-form aqua-border-t mt-4 d-flex align-items-center justify-content-center flex-column py-4 gap-4">
                <div className="d-flex gap-4 align-items-center justify-content-center w-80">
                  <label htmlFor="" className="no-wrap">
                    TC SME Comment
                  </label>
                  <input
                    name="requestorName"
                    placeholder="Comment is mandatory for rejection"
                    type="text"
                    value={tcsmeComment}
                    className="form-control formcontrol p-2"
                    disabled={
                      issnStatusVerified ||
                      afterSubmitStatus.includes(requestInfoData.status) ||
                      requestInfoData.status === "returned"
                    }
                    onChange={(e) => setTcsmeComment(e.target.value)}
                  />
                </div>

                <div className="d-flex gap-2" style={{ marginRight: "-50%" }}>
                  <button
                    onClick={() => handleSnStatusChange("returned")}
                    className="btn cancel-btn"
                    disabled={
                      afterSubmitStatus.includes(requestInfoData.status) ||
                      requestInfoData.status === "returned"
                    }
                  >
                    {requestInfoData.status === "returned"
                      ? "Returned"
                      : "Reject"}
                  </button>
                  <button
                    className="btn save-btn save-next-btn"
                    onClick={() => handleSnStatusChange("approved")}
                    disabled={
                      loading ||
                      issnStatusVerified ||
                      requestInfoData?.status == "approved" ||
                      requestInfoData?.status == "returned" ||
                      afterSubmitStatus.includes(requestInfoData.status)
                    }
                  >
                    Approve TC Request
                  </button>
                </div>
              </div>
            )}

            {requestInfoData?.comments &&
              requestInfoData.comments.length > 0 && (
                <div className="container">
                  <div className="font mb-2">SME Comment/s</div>
                  {requestInfoData.comments.map((comment, index) => {
                    console.log(comment.created_at);

                    return (
                      <div
                        className="font"
                        key={comment?.request_comment_id || index}
                      >
                        {index + 1}. {convertUTCtoEST(comment.created_at)} (
                        {comment?.user_name}) -{" "}
                        <span className="text-capitalize">
                          {comment?.status}
                        </span>
                        {" , "}
                        Comment: &quot;{comment?.comment}&quot;
                      </div>
                    );
                  })}
                </div>
              )}
          </>
        )}
      </>

      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

export default RequestorInfo;
