/* eslint-disable react/prop-types */
import { useState } from "react";
import axiosToken from "../../../utils/axiosToken";
import { toast } from "react-toastify";
import { ChevronRight, ChevronDown, CheckCircle, MinusCircle } from "lucide-react";

function TestCase({ requestInfoData, fetchData }) {
  const [expandedTesters, setExpandedTesters] = useState({});
  const [auditTrail, setAuditTrail] = useState([]);

  // Mock data - replace with actual API data
  const [testers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@company.com",
      testCases: [
        {
          testId: "TC001",
          description: "Login functionality test",
          testerStatus: "Complete",
          supportStatus: "Pending Validation"
        },
        {
          testId: "TC002",
          description: "Payment processing test",
          testerStatus: "Pending Testing",
          supportStatus: "Pending Validation"
        }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.com",
      testCases: [
        {
          testId: "TC003",
          description: "User registration test",
          testerStatus: "Complete",
          supportStatus: "Passed"
        }
      ]
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice.johnson@company.com",
      testCases: [
        {
          testId: "TC004",
          description: "Password reset test",
          testerStatus: "Pending Testing",
          supportStatus: "Pending Validation"
        }
      ]
    },
    {
      id: 4,
      name: "Bob Brown",
      email: "bob.brown@company.com",
      testCases: [
        {
          testId: "TC005",
          description: "API response time test",
          testerStatus: "Pending Testing",
          supportStatus: "Pending Validation"
        }
      ]
    }
  ]);

  const supportStatuses = [
    "Pending Validation",
    "Passed",
    "Failed",
    "N/A",
    "Retest"
  ];

  const toggleTester = (testerId) => {
    setExpandedTesters(prev => ({
      ...prev,
      [testerId]: !prev[testerId]
    }));
  };

  const handleSupportStatusChange = async (testerId, testId, newStatus) => {
    try {
      // API call would go here
      // await axiosToken.put(`/test-cases/${testId}`, { supportStatus: newStatus });

      const auditEntry = {
        timestamp: new Date().toLocaleString(),
        action: `Support status changed to ${newStatus} for ${testId}`,
        user: "Current User"
      };
      setAuditTrail(prev => [auditEntry, ...prev]);

      toast.success("Status updated successfully");
      // fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getTesterIcon = (status) => {
    return status === "Complete" ? <CheckCircle /> : <MinusCircle />;
  };

  return (
    <div className="container">
      <p className="blue-heading text-center">Test Case Management</p>

      <div className="request-form form-field-wrapper">
        {testers.map(tester => (
          <div key={tester.id} className="mb-3">
            <div
              className="d-flex gap-3 align-items-center p-2 border rounded cursor-pointer"
              onClick={() => toggleTester(tester.id)}
              style={{ cursor: 'pointer' }}
            >
              <span className="me-2">{expandedTesters[tester.id] ? <ChevronDown /> : <ChevronRight />}</span>
              <div className="d-flex gap-3 flex-grow-1">
                <div className="form-control-plaintext fw-bold text-primary underline">Tester <span className="">{tester.id}</span></div>
                <div className="form-control-plaintext d-flex gap-2 align-items-center"><span className="fw-bold">Name</span> <span className="border rounded-3 font-weight border-muted px-3 py-2">{tester.name}</span></div>
                <div className="form-control-plaintext d-flex gap-2 align-items-center"><span className="fw-bold">Email</span> <span className="border rounded-3 font-weight border-muted px-3 py-2">{tester.email}</span></div>
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
                {tester.testCases.map(testCase => (
                  <div key={testCase.testId} className="row mb-3 align-items-center">
                    <div className="col-md-2">
                      <a href="#" className="text-primary fw-bold">
                        {testCase.testId}
                      </a>
                    </div>
                    <div className="col-md-4">
                      {testCase.description}
                    </div>
                    <div className="col-md-2 text-center">
                      <span className={`badge ${testCase.testerStatus === 'Complete' ? 'text-success' : 'text-muted'}`}>
                        {getTesterIcon(testCase.testerStatus)}
                      </span>
                    </div>
                    <div className="col-md-3">
                      {testCase.supportStatus}
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