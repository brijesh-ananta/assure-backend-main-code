import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../utils/AuthContext";
import Steps from "./Steps";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import RequestorInfo from "./files/RequestorInfo";
import TestInfo from "./files/TestInfo";
import TerminalInfo from "./files/TerminalInfo";
import ShippingCard from "./files/ShippingCard";
import VerticalSidebar from "./VerticalSidebar";
import TesterDetails from "./files/TesterDetails";
import VerticalRightSidebar from "./VerticalRightSidebar";
import CardAssignmentV2 from "./files/CardAssignment-v2";
import StopFulFillment from "./files/StopFulFillment";
import TestCase from "./files/TestCase";
import { environmentMapping } from "../../utils/constent";

function TCrequest() {
  const [searchParams] = useSearchParams();
  const currentStep = searchParams.get("step") || null;

  const [activeStep, setActiveStep] = useState(1);
  const { user } = useAuth();
  const location = useLocation();
  const [environment, setEnvironment] = useState(
    location.state?.environment || ""
  );
  const [terminalType, setTerminalType] = useState(
    location.state?.terminalType || ""
  );
  const { cardRequestId } = useParams();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const [requestInfoData, setRequestInfoData] = useState([]);
  const [isPhysicalCard, setIsPhysicalCard] = useState("no");
  const [isTestInfoAvailable, setIsTestInfoAvailable] = useState(false);
  const [isTerminalInfoAvailable, setIsTerminalInfoAvailable] = useState(false);
  const [isShippingInfoAvailable, setIsShippingInfoAvailable] = useState(false);
  const [isShipmentAvailable, setIsShipmentAvailable] = useState(false);
  const [requestNumberId, setRequestNumberId] = useState("");
  const [snStatusVerify, setSnStatusVerify] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [isTestCaseAvailable, setIsTestCaseAvailable] = useState(false);

  useEffect(() => {
    if (currentStep && typeof +currentStep === "number") {
      setActiveStep(+currentStep);
    }
  }, [currentStep]);

  const fetchData = useCallback(
    async (load = false) => {
      if (load) {
        setLoading(true);
      }
      try {
        const response = await axiosToken.get(
          `/card-requests/${cardRequestId}`
        );
        setEnvironment(response?.data?.environment);
        setTerminalType(response?.data?.terminalType);

        setRequestInfoData(response.data);
        setRequestNumberId(response.data.requestid);

        setIsTestInfoAvailable(response.data.reqInfo != null);

        setIsTerminalInfoAvailable(
          response.data.testInfo != null &&
            terminalType != "Ecomm" &&
            environment != 3
        );

        // Enable Shipping Info if Terminal Info exists
        setIsShippingInfoAvailable(
          response.data.termInfo != null || response.data.shipDetails != null
        );

        // Other availability checks
        setIsShipmentAvailable(response.data.shipmentInfo != null);

        if (
          response.data.status === "shipped" ||
          response.data.status === "assign_card"
        ) {
          if (terminalType === "Pos") {
            setIsShipmentAvailable(true);
          }
        }
        const shipDetails = JSON.parse(response.data.shipDetails || "{}");
        if (terminalType === "Ecomm" || shipDetails.shipTo === "mobile") {
          setIsShipmentAvailable(false);
        }

        // Check userCardId availability for TestCase tab
        const userCardInfo = JSON.parse(response.data.userCardInfo || "{}");
        setIsTestCaseAvailable(!!userCardInfo.user_card_id);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    },
    [cardRequestId, environment, terminalType]
  );

  useEffect(() => {
    if (cardRequestId) {
      fetchData(true);
    } else {
      setLoading(false);
    }
  }, [cardRequestId, fetchData, terminalType]);

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleSMEStepChange = (step) => {
    setActiveStep(step);
  };

  const handleShipmentAvailability = (isAvailable) => {
    setIsShipmentAvailable(isAvailable);
  };

  const handleSaveAndNext = async (step) => {
    await fetchData();
    setTimeout(() => {
      setActiveStep(step);
    }, 100);
  };

  useEffect(() => {
    const testerDetails =
      (requestInfoData?.testerDetails &&
        JSON.parse(requestInfoData?.testerDetails || {})) ||
      "";
    setIsPhysicalCard(testerDetails?.physicalCard || "yes");
  }, [requestInfoData?.testerDetails]);

  const isCompleted = useMemo(
    () => requestInfoData.status == "completed",
    [requestInfoData.status]
  );

  const isSubmitted = useMemo(
    () => requestInfoData.status == "submitted",
    [requestInfoData.status]
  );

  const afterSubmitStatus = useMemo(
    () => ["approved", "assign_card", "shipped", "completed"],
    []
  );

  const canEdit = useMemo(
    () =>
      afterSubmitStatus.includes(requestInfoData.status) ||
      (requestInfoData?.createdBy &&
        requestInfoData?.createdBy != user.user_id),
    [
      afterSubmitStatus,
      requestInfoData?.createdBy,
      requestInfoData.status,
      user.user_id,
    ]
  );

  const isRequester = useMemo(() => user.role === 2, [user.role]);

  useEffect(() => {
    if (cardRequestId) {
      params.set("recordId", cardRequestId);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [cardRequestId]);

  if (loading) {
    return "";
  }

  return (
    <>
      <div className="notification mangeissuer mb-4 py-lg-3 py-2 aqua-border-b bg-white">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <div className="d-lg-flex formcard header-gradient-color p-2 rounded-1">
              <span className="me-3 font">TC Request ID :</span>
              <label className=" text-danger fw-bold">
                {requestNumberId || "NEW"}
              </label>
            </div>
            <div className="d-lg-flex formcard header-gradient-color p-2 rounded-1">
              <span className="me-3 font">Environment : </span>
              <label className=" text-danger fw-bold text-uppercase">
                {environmentMapping[environment] || environment}
              </label>
            </div>
            <div className="d-lg-flex formcard header-gradient-color p-2 rounded-1">
              <span className="me-3 font">Terminal Type : </span>
              <label className="text-danger fw-bold text-uppercase">
                {terminalType || ""}
              </label>
            </div>
          </div>
        </div>
      </div>

      <Steps
        requestId={cardRequestId}
        environment={environment}
        terminalType={terminalType}
        requestInfoData={requestInfoData}
        isShipmentAvailable={isShipmentAvailable}
        isCompleted={isCompleted}
        isPhysicalCard={isPhysicalCard}
      />

      <div className="d-flex gap-2 mt-4">
        <VerticalSidebar
          activeStep={activeStep}
          handleStepChange={handleStepChange}
          requestInfoData={requestInfoData}
          terminalType={terminalType}
          environment={environment}
          isTestInfoAvailable={isTestInfoAvailable}
          isTerminalInfoAvailable={isTerminalInfoAvailable}
          isShippingInfoAvailable={isShippingInfoAvailable}
          isPhysicalCard={isPhysicalCard}
        />
        <section className="w-100">
          <div className="notification pb-6 overflow-hidden p-0 accordin-stepform">
            {/* Requestor Information */}
            {activeStep === 1 && (
              <RequestorInfo
                requestInfoData={requestInfoData}
                reqInfo={requestInfoData.reqInfo}
                cardRequestId={cardRequestId}
                terminalType={terminalType}
                environment={environment}
                userData={user}
                handleSaveAndNext={handleSaveAndNext}
                isCompleted={isCompleted}
                fetchData={fetchData}
                snStatusVerify={snStatusVerify}
                isSubmitted={isSubmitted}
                setSnStatusVerify={setSnStatusVerify}
                canEdit={canEdit}
                afterSubmitStatus={afterSubmitStatus}
                isRequester={isRequester}
              />
            )}
            {/* Test Information */}
            {activeStep === 2 && (
              <TestInfo
                requestInfoData={requestInfoData}
                terminalType={terminalType}
                cardRequestId={cardRequestId}
                environment={environment}
                handleSaveAndNext={handleSaveAndNext}
                fetchData={fetchData}
                canEdit={canEdit}
                isCompleted={isCompleted}
                isSubmitted={isSubmitted}
                isRequester={isRequester}
              />
            )}
            {/* Terminal Details */}
            {activeStep === 3 && (
              <TerminalInfo
                requestInfoData={requestInfoData}
                cardRequestId={cardRequestId}
                canEdit={canEdit}
                environment={environment}
                handleSaveAndNext={handleSaveAndNext}
                fetchData={fetchData}
                isRequester={isRequester}
              />
            )}
            {/* Tester details */}
            {activeStep === 4 && (
              <TesterDetails
                requestInfoData={requestInfoData}
                cardRequestId={cardRequestId}
                terminalType={terminalType}
                environment={environment}
                setIsPhysicalCard={setIsPhysicalCard}
                handleSaveAndNext={handleSaveAndNext}
                isCompleted={isCompleted}
                fetchData={fetchData}
                isPhysicalCard={isPhysicalCard}
                canEdit={canEdit}
                isSubmitted={isSubmitted}
                isRequester={isRequester}
                afterSubmitStatus={afterSubmitStatus}
              />
            )}
            {activeStep === 5 && (
              <ShippingCard
                snStatusVerify={snStatusVerify}
                setSnStatusVerify={setSnStatusVerify}
                requestInfoData={requestInfoData}
                cardRequestId={cardRequestId}
                terminalType={terminalType}
                environment={environment}
                handleSaveAndNext={handleSaveAndNext}
                fetchData={fetchData}
                isRequester={isRequester}
                canEdit={canEdit}
                isCompleted={isCompleted}
                afterSubmitStatus={afterSubmitStatus}
              />
            )}
            {activeStep === 7 && (
              <CardAssignmentV2
                requestInfoData={requestInfoData}
                handleShipmentAvailability={handleShipmentAvailability}
                cardRequestId={cardRequestId}
                terminalType={terminalType}
                environment={environment}
                fetchData={fetchData}
                setActiveStep={setActiveStep}
                isPhysicalCard={isPhysicalCard}
                isCompleted={isCompleted}
              />
            )}
            {activeStep === 8 && (
              <ShippingCard
                requestInfoData={requestInfoData}
                cardRequestId={cardRequestId}
                terminalType={terminalType}
                canEdit={canEdit}
                handleSaveAndNext={handleSaveAndNext}
                fetchData={fetchData}
                showTrackDetails={true}
                isCompleted={isCompleted}
                afterSubmitStatus={afterSubmitStatus}
              />
            )}
            {activeStep === 9 && (
              <StopFulFillment
                requestInfoData={requestInfoData}
                handleSaveAndNext={handleSaveAndNext}
                fetchData={fetchData}
                showTrackDetails={true}
                isCompleted={isCompleted}
              />
            )}
            {activeStep === 10 && isTestCaseAvailable && (
              <TestCase
                requestInfoData={requestInfoData}
                handleSaveAndNext={handleSaveAndNext}
                fetchData={fetchData}
                showTrackDetails={true}
                isCompleted={isCompleted}
              />
            )}
            {activeStep === 10 && !isTestCaseAvailable && (
              <div className="container">
                <div className="text-center p-4">
                  <p className="text-muted">
                    Test Case functionality is not available - User Card ID is
                    required.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
        {(user.role === 1 || user.role === 2 || user.role === 3) && (
          <VerticalRightSidebar
            activeStep={activeStep}
            handleStepChange={handleSMEStepChange}
            requestInfoData={requestInfoData}
            terminalType={terminalType}
            environment={environment}
            isTestInfoAvailable={isTestInfoAvailable}
            isTerminalInfoAvailable={isTerminalInfoAvailable}
            isShippingInfoAvailable={isShippingInfoAvailable}
            isPhysicalCard={isPhysicalCard}
            isTestCaseAvailable={isTestCaseAvailable}
          />
        )}
      </div>

      {/* <Footer audit={true} tableName="card_requests" recordId={cardRequestId} /> */}
    </>
  );
}

export default TCrequest;
