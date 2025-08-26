import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import AddTestBundle from "./AddTestBundle";
import { Link } from "react-router-dom";

function ManageCards() {
  const [headerTitle, setHeaderTitle] = useState("Maintain Card Stock"); // Default title
  const [environment, setEnvironment] = useState("1"); // Default to Prod ("1")
  const { user } = useAuth(); // user now contains profile info
  const userRole = user?.role; // assuming role is stored in user object
  const [statusFilter, setStatusFilter] = useState("All");
  const [issuers, setIssuers] = useState([]);

  const handleEnvironmentChange = (e) => {
    const newEnv = e.target.value;
    setEnvironment(newEnv);
  };

  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        const response = await axiosToken.get(
          `/issuers?environment=${environment}&status=${statusFilter}`
        );
        setIssuers(response.data);
      } catch (error) {
        console.error("Error fetching issuers:", error);
      }
    };
    fetchIssuers();
  }, [environment, statusFilter]);

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      {/* Main Content */}
      <section>
        <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-2">
          <div className="container">
            <div className="d-lg-flex align-items-center justify-content-center">
              <span className="me-lg-5 font">Environment</span>

              <div className="d-lg-flex formcard">
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
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault1"
                  >
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
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault2"
                  >
                    QA
                  </label>
                </div>
                <div className="form-check d-flex gap-2 align-items-center">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="environment"
                    value={"3"}
                    checked={environment === "3"}
                    onChange={handleEnvironmentChange}
                    id="flexRadioDefault3"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexRadioDefault3"
                  >
                    Cert
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="notification">
          <div className="container-fluid">
            <div className="table-responsive wmain">
              {/* for env prod */}
              {environment === "1" && (
                <table className="table table-bordered">
                  <thead className="table-theme">
                    <tr>
                      <th className="w500" scope="col"></th>
                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th
                        className="bggray text-center"
                        scope="col"
                        colSpan="4"
                      >
                        <span className="tabletext">POS Test Cards</span>
                      </th>
                      <th className="w10"></th>
                      <th
                        className="bggray text-center"
                        scope="col"
                        colSpan="4"
                      >
                        <span className="tabletext">Ecomm Test Cards</span>
                      </th>
                    </tr>
                    <tr>
                      <th className="w500" scope="col">
                        Issuer Name
                      </th>
                      <th scope="col">BIN</th>
                      <th scope="col">Product</th>
                      <th className="bggray" scope="col">
                        Available
                      </th>
                      <th className="bggray" scope="col">
                        Assigned
                      </th>
                      <th className="bggray" scope="col">
                        Total
                      </th>
                      <th scope="col" className="bggray"></th>
                      <th className="w10"></th>
                      <th className="bggray" scope="col">
                        Available
                      </th>
                      <th className="bggray" scope="col">
                        Assigned
                      </th>
                      <th className="bggray" scope="col">
                        Total
                      </th>
                      <th scope="col" className="bggray"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuers && issuers.length > 0 ? (
                      issuers.map((issuer) => (
                        <tr key={issuer.id}>
                          <td>{issuer.issuer_name}</td>
                          <td>{issuer.bin}</td>
                          <td>{issuer.binProduct}</td>
                          <td className="bggray">
                            <span className="addgreen">
                              {issuer.posCount - issuer.posAssignedCount}
                            </span>
                          </td>
                          <td className="bggray">{issuer.posAssignedCount || "0"}</td>
                          <td className="bggray">{issuer.posCount}</td>
                          <td className="bggray">
                            <div>
                              {issuer.status === "active" ? (
                                <Link
                                  className="btn-add py-2 ms-auto ws100"
                                  to="/dashboard/cards/add-card"
                                  state={{ issuer, environment, type: "Pos" }}
                                >
                                  Add Card
                                </Link>
                              ) : (
                                <span
                                  className="btn-add btn-add-disabled py-2 ms-auto ws100"
                                  title="Issuer is not active"
                                >
                                  Add Card
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="w10"></td>
                          <td className="bggray">
                            <span className="addgreen">
                              {issuer.ecommCount - issuer.ecommAssignedCount}
                            </span>
                          </td>
                          <td className="bggray">{issuer.ecommAssignedCount || "0"}</td>
                          <td className="bggray">{issuer.ecommCount}</td>
                          <td className="bggray">
                            <div>
                              {issuer.status === "active" ? (
                                <Link
                                  className="btn-add py-2 ms-auto ws100"
                                  to="/dashboard/cards/add-card"
                                  state={{ issuer, environment, type: "Ecomm" }}
                                >
                                  Add Card
                                </Link>
                              ) : (
                                <span
                                  className="btn-add btn-add-disabled py-2 ms-auto ws100"
                                  title="Issuer is not active"
                                >
                                  Add Card
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center">
                          No issuers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* for env qa */}
              {environment === "2" && (
                <table className="table table-bordered">
                  <thead className="table-theme">
                    <tr>
                      <th className="w500" scope="col"></th>
                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th
                        className="bggray text-center"
                        scope="col"
                        colSpan="4"
                      >
                        <span className="tabletext">POS Test Cards</span>
                      </th>
                    </tr>
                    <tr>
                      <th className="w500" scope="col">
                        Issuer Name
                      </th>
                      <th scope="col">BIN</th>
                      <th scope="col">Product</th>
                      <th className="bggray" scope="col">
                        Available
                      </th>
                      <th className="bggray" scope="col">
                        Assigned
                      </th>
                      <th className="bggray" scope="col">
                        Total
                      </th>
                      <th scope="col" className="bggray"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuers && issuers.length > 0 ? (
                      issuers.map((issuer) => (
                        <tr key={issuer.id}>
                          <td>{issuer.issuer_name}</td>
                          <td>{issuer.bin}</td>
                          <td>{issuer.binProduct}</td>
                          <td className="bggray">
                            <span className="addgreen">
                              {issuer.posCount - issuer.posAssignedCount}
                            </span>
                          </td>
                          <td className="bggray">{issuer.posAssignedCount || "0"}</td>
                          <td className="bggray">{issuer.posCount}</td>
                          <td className="bggray">
                            <div>
                              {issuer.status === "active" ? (
                                <Link
                                  className="btn-add py-2 ms-auto ws100"
                                  to="/dashboard/cards/add-card"
                                  state={{ issuer, environment, type: "Pos" }}
                                >
                                  Add Card
                                </Link>
                              ) : (
                                <span
                                  className="btn-add btn-add-disabled py-2 ms-auto ws100"
                                  title="Issuer is not active"
                                >
                                  Add Card
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No issuers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* test environment */}
              {environment === "3" && <AddTestBundle />}
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default ManageCards;