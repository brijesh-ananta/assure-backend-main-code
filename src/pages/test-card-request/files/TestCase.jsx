/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axiosToken from "../../../utils/axiosToken";
import { toast } from "react-toastify";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  MinusCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";

function TestCase({ requestInfoData, fetchData }) {
  const [expandedTesters, setExpandedTesters] = useState({});
  const [auditTrail, setAuditTrail] = useState([]);
  const [testers, setTesters] = useState([]);
  const { cardRequestId } = useParams();

  useEffect(() => {
    const fetchCardRequestData = async () => {
      try {
        const response = await axiosToken.get(
          `/card-requests/${cardRequestId}`
        );
        console.log("Card Request API Response:", response.data);

        const userCardInfo = JSON.parse(response.data.userCardInfo || "{}");
        const userCardId = userCardInfo.user_card_id;

        if (userCardId) {
          const testCasesResponse = await axiosToken.get(
            `/test-cases-user-mapping/user-card/${userCardId}`
          );
          console.log("Test Cases API Response:", testCasesResponse.data);

          const groupedTesters = testCasesResponse.data.data.reduce(
            (acc, testCase) => {
              const existingTester = acc.find(
                (t) => t.id === testCase.tester_id
              );
              if (existingTester) {
                existingTester.testCases.push({
                  mappingId: testCase.id,
                  testId: testCase.test_cases_unique_id,
                  description: testCase.short_description,
                  testingSteps: testCase.testing_steps,
                  testerStatus:
                    testCase.status === "pending"
                      ? "Pending Testing"
                      : "Complete",
                  supportStatus: testCase.support_status,
                });
              } else {
                acc.push({
                  id: testCase.tester_id,
                  name: testCase.tester_name,
                  email: testCase.tester_email,
                  testCases: [
                    {
                      mappingId: testCase.id,
                      testId: testCase.test_cases_unique_id,
                      description: testCase.short_description,
                      testingSteps: testCase.testing_steps,
                      testerStatus:
                        testCase.status === "pending"
                          ? "Pending Testing"
                          : "Complete",
                      supportStatus: testCase.support_status,
                    },
                  ],
                });
              }
              return acc;
            },
            []
          );

          setTesters(groupedTesters);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (cardRequestId) {
      fetchCardRequestData();
    }
  }, [cardRequestId]);

  const supportStatuses = [
    { label: "Pending Validation", value: "pending_validation" },
    { label: "Retest", value: "retest" },
    { label: "Passed", value: "passed" },
    { label: "Failed Complete", value: "failed_complete" },
    { label: "NA", value: "na" },
  ];

  const getIconsToShow = (tester) => {
    const allTestsComplete = tester.testCases.every(
      (tc) => tc.testerStatus === "Complete"
    );
    const allSupportComplete = tester.testCases.every(
      (tc) =>
        tc.supportStatus === "passed" ||
        tc.supportStatus === "failed_complete" ||
        tc.supportStatus === "na"
    );

    return {
      showYellow: allTestsComplete,
      showGreen: allSupportComplete,
      showIcons: allTestsComplete || allSupportComplete,
    };
  };

  const toggleTester = (testerId) => {
    setExpandedTesters((prev) => ({
      ...prev,
      [testerId]: !prev[testerId],
    }));
  };

  const handleSupportStatusChange = async (testerId, testId, newStatus, mappingId) => {
    try {
      // Make PUT API call to update admin status using mapping ID
      await axiosToken.put(`/test-cases-user-mapping/admin-update/${mappingId}`, {
        support_status: newStatus
      });

      // Update local state
      setTesters((prev) =>
        prev.map((tester) =>
          tester.id === testerId
            ? {
                ...tester,
                testCases: tester.testCases.map((tc) =>
                  tc.testId === testId
                    ? { ...tc, supportStatus: newStatus }
                    : tc
                ),
              }
            : tester
        )
      );

      const auditEntry = {
        timestamp: new Date().toLocaleString(),
        action: `Support status changed to ${newStatus} for ${testId}`,
        user: "Current User",
      };
      setAuditTrail((prev) => [auditEntry, ...prev]);

      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating support status:", error);
      toast.error("Failed to update status");
    }
  };

  const getTesterIcon = (status) => {
    return status === "Complete" ? <CheckCircle /> : <MinusCircle />;
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="blue-heading text-center mb-0">Test Case Management</p>
        <div className="d-flex gap-3 align-items-center">
          <div className="d-flex align-items-center gap-1">
            <CheckCircle size={16} className="text-warning" />
            <small>Tester Complete</small>
          </div>
          <div className="d-flex align-items-center gap-1">
            <CheckCircle size={16} className="text-success" />
            <small>All Complete</small>
          </div>
        </div>
      </div>

      <div className="request-form form-field-wrapper">
        {testers.map((tester) => (
          <div key={tester.id} className="mb-3">
            <div
              className="d-flex gap-3 align-items-center p-2 border rounded cursor-pointer"
              onClick={() => toggleTester(tester.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="d-flex gap-1" style={{ width: "45px" }}>
                {(() => {
                  const { showYellow, showGreen, showIcons } =
                    getIconsToShow(tester);
                  if (!showIcons) return null;
                  return (
                    <>
                      {showYellow && (
                        <CheckCircle size={20} className="text-warning" />
                      )}
                      {showGreen && (
                        <CheckCircle size={20} className="text-success" />
                      )}
                    </>
                  );
                })()}
              </div>
              <span className="me-2">
                {expandedTesters[tester.id] ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </span>
              <div className="d-flex gap-3 flex-grow-1">
                <div className="form-control-plaintext fw-bold text-primary underline">
                  Tester <span className="">{tester.id}</span>
                </div>
                <div className="form-control-plaintext d-flex gap-2 align-items-center">
                  <span className="fw-bold">Name</span>{" "}
                  <span className="border rounded-3 font-weight border-muted px-3 py-2">
                    {tester.name}
                  </span>
                </div>
                <div className="form-control-plaintext d-flex gap-2 align-items-center">
                  <span className="fw-bold">Email</span>{" "}
                  <span className="border rounded-3 font-weight border-muted px-3 py-2">
                    {tester.email}
                  </span>
                </div>
              </div>
            </div>

            {expandedTesters[tester.id] && (
              <div className="border border-top-0 p-3">
                <div className="row mb-2 fw-bold text-muted">
                  <div className="col-md-2">Test ID</div>
                  <div className="col-md-4">Description</div>
                  <div className="col-md-2 text-center">Tester Update</div>
                  <div className="col-md-3">Support Update</div>
                </div>
                {tester.testCases.map((testCase) => (
                  <div
                    key={testCase.testId}
                    className="row mb-3 align-items-center"
                  >
                    <div className="col-md-2">
                      <a href="#" className="text-muted fw-bold">
                        {testCase.testId}
                      </a>
                    </div>
                    <div className="col-md-4">
                      <textarea
                        className="form-control form-control-sm"
                        value={testCase.testingSteps || testCase.description}
                        rows={2}
                        readOnly
                      />
                    </div>
                    <div className="col-md-2 text-center">
                      <span
                        className={`badge ${testCase.testerStatus === "Complete" ? "text-success" : "text-muted"}`}
                      >
                        {getTesterIcon(testCase.testerStatus)}
                      </span>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select form-select-sm"
                        value={testCase.supportStatus}
                        onChange={(e) =>
                          handleSupportStatusChange(
                            tester.id,
                            testCase.testId,
                            e.target.value,
                            testCase.mappingId
                          )
                        }
                      >
                        {supportStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestCase;
