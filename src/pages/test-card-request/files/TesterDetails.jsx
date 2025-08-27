/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import axiosToken from "../../../utils/axiosToken";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";
import Select from "react-dropdown-select";

const TesterDetails = ({
  requestInfoData,
  setIsPhysicalCard,
  environment,
  terminalType,
  handleSaveAndNext,
  fetchData,
  isCompleted,
  isPhysicalCard,
  canEdit,
  isRequester,
  isSubmitted,
  afterSubmitStatus,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const addmail = searchParams.get("addmail") || "";

  const [rows, setRows] = useState([{ id: 0, email: "", name: "", userId: 0 }]);
  const [, setCurrentQueries] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [vaultCounts, setVaultCounts] = useState(0);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [users, setUsers] = useState([]);
  const [reqInfo, setReqInfo] = useState([]);
  const [isChecked, setIsChecked] = useState(
    requestInfoData.status === "submitted"
  );
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [issuerOptions, setIssuerOptions] = useState([]);
  const [bundleList, setBundleList] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState(0);
  const [issuer, setIssuer] = useState({});

  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({
    specialFeature: "",
    product: "",
    partner_id: "",
    productBundle: "",
    domesticGlobal: "",
    issuer: "",
    mediaCard: "yes",
    physicalCard: "no",
  });

  useEffect(() => {
    if (addmail && searchResults.length) {
      const user = searchResults.find((u) => u.email == addmail);
      const exist = rows.find((u) => u.email == addmail);

      if (user && !exist) {
        setRows((prevRows) => {
          const newRows = [
            ...prevRows,
            {
              email: user?.email,
              name: user?.name || "",
              userId: user?.userId,
              id: prevRows.length,
            },
          ];
          return newRows.filter((row) => !!row.email);
        });

        setSelectedEmails(user?.email);
        setTimeout(() => {
          if (searchParams.has("addmail")) {
            searchParams.delete("addmail");
            setSearchParams(searchParams);
          }
        }, 200);
      }
    }
  }, [addmail, rows, searchParams, searchResults, setSearchParams]);

  const validateFields = useMemo(() => {
    const parsedTestInfo =
      requestInfoData.testInfo && JSON.parse(requestInfoData.testInfo);
    const testerDetails =
      requestInfoData.testerDetails &&
      JSON.parse(requestInfoData.testerDetails);

    const isTestInfoValid =
      parsedTestInfo && Object.keys(parsedTestInfo).length > 0;
    const isTesterDetailsValid =
      testerDetails && testerDetails?.testers?.length > 0;

    if (isTestInfoValid && isTesterDetailsValid) {
      return true;
    } else {
      return false;
    }
  }, [requestInfoData.testInfo, requestInfoData.testerDetails]);

  const handleCheckedDetailsChange = (e) => {
    setIsChecked(e.target.value === "yes");
  };

  const isApproved = useMemo(
    () => requestInfoData.status === "submitted" || isCompleted,
    [isCompleted, requestInfoData.status]
  );

  const handleEmailChange = (id, value) => {
    const user = users?.find((user) => user.email === value);

    setCurrentQueries((prev) => ({ ...prev, [id]: value }));
    if (user) {
      setSelectedEmails((prev) => [...prev, value]);
    }

    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id
          ? {
              ...row,
              email: value,
              name: user?.name || "",
              userId: user?.value || "",
            }
          : row
      )
    );
  };

  const availableOptions = useMemo(() => {
    const selectedFromRows = rows.map((row) => row.email).filter(Boolean);
    return searchResults.filter(
      (option) => !selectedFromRows.includes(option.email)
    );
  }, [searchResults, rows]);

  const addNewRow = (index) => {
    if (rows?.length < vaultCounts) {
      setRows((prevRows) => [
        ...prevRows,
        { id: index, email: "", name: "", userId: 0 },
      ]);
    } else {
      toast.error("No more cards available to add testers.");
    }
  };

  const isEmailValidAndUnique = useCallback(
    (email, rowId) => {
      if (!validateEmail(email)) {
        return false;
      }

      const isEmailDuplicate = rows.some(
        (row) => row.email === email && row.id !== rowId
      );

      const isEmailInUsers = users.some((user) => user.email === email);

      return isEmailInUsers && !isEmailDuplicate;
    },
    [rows, users]
  );

  const getUsers = useCallback(async () => {
    try {
      if (!formData.partner_id) return;

      const response = await axiosToken.get(
        `/users/testers/${formData.partner_id}`
      );
      if (response?.data?.length) {
        setUsers(
          response?.data?.map((res) => ({
            email: res.email,
            value: res?.user_id,
            name: res?.firstName + " " + res?.lastName,
            userId: res.user_id,
          }))
        );
        setSearchResults(
          response?.data?.map((res) => ({
            email: res.email,
            value: res?.user_id,
            name: res?.firstName + " " + res?.lastName,
            userId: res.user_id,
          }))
        );
      }
    } catch (error) {
      console.error("Error", error);
    }
  }, [formData.partner_id]);

  const fetchPartners = async () => {
    try {
      let url = "/partners?status=active";

      if (canEdit) {
        url = "/partners";
      }

      const response = await axiosToken.get(url);
      setPartners(response.data.partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };
  useEffect(() => {
    fetchPartners();
  });
  console.log(canEdit, isApproved, isRequester);

  const handleSave = async (goNext = false, skipRowCheck = false) => {
    const isFormValid = validateForm(skipRowCheck);
    if (!isFormValid) return false;

    const validRows = rows.filter(
      (row) =>
        row.email && row.name && users.some((user) => user.email === row.email)
    );

    const payload = {
      ...formData,
      availableCards: vaultCounts,
      testers: validRows.map((row) => ({
        email: row.email,
        name: row.name,
        id: row.id,
        userId: row.userId,
        status: row?.status || "pending",
      })),
    };

    try {
      setLoading(true);
      const response = await axiosToken.put(
        `/card-requests/${requestInfoData.id}`,
        {
          submitData: payload,
          column: "testerDetails",
          terminalType: terminalType,
          environment: environment,
        }
      );
      if (response.status === 200 || response.status === 201) {
        if (goNext && isPhysicalCard === "yes") {
          handleSaveAndNext(5);
        } else {
          await fetchData();
        }
        toast.success("Data saved successfully!");
        return true;
      } else {
        toast.error("Error saving data!");
        return false;
      }
    } catch (error) {
      console.error("Error saving data:", error?.response?.data);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while saving the data."
      );
      return false;
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const validateForm = (skip = false) => {
    if (environment != 3) {
      if (!formData.specialFeature && terminalType != "Ecomm") {
        toast.error("Please select a special feature.");
        return false;
      }
      if (!formData.product) {
        toast.error("Please select a product.");
        return false;
      }
      if (!formData.issuer) {
        toast.error("Please select an issuer.");
        return false;
      }
    }

    if (!formData.partner_id) {
      toast.error("Please select a Testing partner.");
      return false;
    }

    const emailCount = {};
    for (const row of rows) {
      const email = row.email?.toLowerCase();
      if (email) {
        emailCount[email] = (emailCount[email] || 0) + 1;
      }
    }

    const duplicates = Object.entries(emailCount).filter(
      ([, count]) => count > 1
    );

    if (duplicates.length > 0) {
      toast.error(
        `Duplicate email(s) found: ${duplicates
          .map(([email]) => email)
          .join(", ")}`
      );
      return false;
    }

    if (!skip) {
      const validRows = rows.filter(
        (row) =>
          row.email &&
          row.name &&
          users.some((user) => user.email === row.email)
      );

      if (validRows?.length !== rows?.length) {
        toast.error("Please ensure all rows have valid email and name.");
        return false;
      }

      if (validRows?.length === 0) {
        toast.error("Please add at least one valid tester.");
        return false;
      }
    }

    return true;
  };

  const handleCancel = () => {
    navigate("/dashboard/request-history");
  };

  const handleSubmitTCRequest = async () => {
    if (!isChecked) {
      toast.error("Please verify all the details");
      return;
    }

    const info = JSON.parse(requestInfoData?.reqInfo);

    if (info.status !== "approved") {
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
      toast.error(error.message || "An error occurred while submitting.");
    }
  };

  useEffect(() => {
    const testerDetails =
      (requestInfoData?.testerDetails &&
        JSON.parse(requestInfoData?.testerDetails || "")) ||
      {};

    if (testerDetails) {
      setFormData({
        ...formData,
        specialFeature: testerDetails.specialFeature || "",
        product: testerDetails.product || "",
        domesticGlobal: testerDetails.domesticGlobal || "",
        issuer: testerDetails.issuer || "",
        partner_id: testerDetails.partner_id || "",
        mediaCard: testerDetails.mediaCard || "yes",
        physicalCard: testerDetails.physicalCard || "no",
        productBundle: testerDetails.productBundle || "",
      });

      if (testerDetails?.testers?.length) {
        setRows((prev) =>
          prev.length === 1 && !prev[0].email ? testerDetails.testers : prev
        );
      }

      setSelectedEmails(
        testerDetails?.testers?.length
          ? testerDetails?.testers.map((tester) => tester.email)
          : []
      );
      setIsPhysicalCard(testerDetails?.physicalCard || "no");

      if (canEdit || isApproved) {
        setVaultCounts(testerDetails?.availableCards || 0);
      }
    }
  }, [requestInfoData?.testerDetails, isApproved, canEdit]);

  const fetchSingleIssuer = useCallback(
    async (id) => {
      if (!id) return;

      try {
        const response = await axiosToken.get(
          `/issuers/${formData.issuer || 0}?environment=${environment}`
        );

        if (response.data) {
          setIssuer(response?.data?.issuer || {});
        }
      } catch (error) {
        console.error(error);
      }
    },
    [environment, formData.issuer]
  );

  useEffect(() => {
    if (formData.issuer && (canEdit || isApproved)) {
      fetchSingleIssuer(formData.issuer);
    }
  }, [canEdit, fetchSingleIssuer, formData.issuer, isApproved]);

  const handleValueChange = (e) => {
    const { name, value } = e.target;

    if (name === "partner_id") {
      setUsers([]);
      setSearchResults([]);
      setSelectedEmails([]);
      refreshRows();
    }

    if (
      name === "product" ||
      name === "specialFeature" ||
      name === "domesticGlobal" ||
      name === "productBundle"
    ) {
      refreshRows();
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        issuer: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === "product") {
      setVaultCounts(0);
    }
  };

  useEffect(() => {
    if (formData?.partner_id) {
      getUsers();
    }
  }, [formData?.partner_id, getUsers, searchResults.length, user.length]);

  const deleteRow = (id, isLast) => {
    if (isLast && rows.length == 1) {
      refreshRows();
    } else {
      setRows((prevRows) => prevRows.filter((row) => row.id != id));
    }

    const userEmail = rows.find((row) => row.id == id);

    if (userEmail) {
      const mails = selectedEmails.filter((e) => e != userEmail.email);
      setSelectedEmails(mails);
    }
  };

  const fetchIssuers = useCallback(async () => {
    try {
      let status;
      const {
        domesticGlobal = "",
        product = "",
        specialFeature = "",
        issuer,
      } = formData;

      if (terminalType == "Pos" && (!specialFeature || !product)) return;
      if (environment == 1 && !product) return;
      if (
        requestInfoData.status == "draft" ||
        requestInfoData.status == undefined ||
        requestInfoData.status == "submitted" ||
        requestInfoData.status == "approved" ||
        requestInfoData.status == "returned"
      ) {
        status = "unassigned";
      } else {
        status = "assigned";
      }

      const response = await axiosToken.get(`/cards/list`, {
        params: {
          binProduct: product,
          feature: specialFeature,
          region: domesticGlobal,
          environment: environment,
          terminalType: terminalType,
          issuer: issuer || "",
          status: status,
        },
      });

      setVaultCounts(response?.data?.total || 0);
      setIssuerOptions(response?.data?.cards || []);
    } catch (error) {
      console.error("Error fetching issuers:", error);
    }
  }, [environment, formData, requestInfoData.status, terminalType]);

  useEffect(() => {
    const info = requestInfoData?.reqInfo;

    if (info) {
      const parsedData = JSON.parse(info || "{}") || "";
      setReqInfo(parsedData || {});
    }
  }, [requestInfoData?.reqInfo]);

  const validateEmail = (email) => {
    const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return EMAIL_REGEX.test(email);
  };

  const renderAddUserButton = (email) => {
    const userExists = users.some((user) => user.email === email);

    if (
      !userExists &&
      validateEmail(email) &&
      !selectedEmails.includes(email)
    ) {
      return (
        <button
          type="button"
          className="border-0 ms-2 rounded-2 font p-2"
          onClick={async () => {
            if (validateEmail(email)) {
              const userSaved = await handleSave(false, true);
              if (userSaved) {
                navigate(
                  `/dashboard/add-user?testingPartner=${
                    formData.partner_id
                  }&reqId=${requestInfoData.id}&email=${encodeURIComponent(
                    email
                  )}&from=${encodeURIComponent(
                    `/dashboard/test-card-request/requestor-info/${requestInfoData.id}?step=4&addmail`
                  )}`
                );
              }
            } else {
              toast.error("Invalid email format");
            }
          }}
        >
          Add User
        </button>
      );
    }
    return null;
  };

  useEffect(() => {
    if (environment != 3 && !canEdit && !isApproved) {
      fetchIssuers(formData);
    }
  }, [
    environment,
    fetchIssuers,
    formData.product,
    formData.specialFeature,
    terminalType,
    formData.domesticGlobal,
    formData.issuer,
    formData,
    canEdit,
    isApproved,
  ]);

  const fetchPartnerRequests = useCallback(async () => {
    try {
      const resp = await axiosToken.get(
        `card-requests/partner-requests/${formData?.partner_id}`
      );
      if (resp.data) {
        setPartnerRequests(resp.data.total);
      }
    } catch (error) {
      console.error(error);
    }
  }, [formData?.partner_id]);

  const fetchBundleList = useCallback(async () => {
    try {
      const response = await axiosToken.get(`/test-card-bundles/available`);
      const bundles = response.data;
      setBundleList(bundles);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (environment == 3) {
      fetchBundleList();
    }
  }, [environment, fetchBundleList, terminalType]);

  useEffect(() => {
    if (formData && formData.partner_id) {
      setTimeout(() => {
        fetchPartnerRequests();
      }, 100);
    } else {
      setPartnerRequests(0);
    }
  }, [fetchPartnerRequests, formData]);

  const refreshRows = () => {
    setRows([{ id: 0, email: "", name: "", userId: 0 }]);
    setSelectedEmails([]);
  };

  const handleCardChange = useCallback(
    (value) => {
      const bundle = bundleList.find((bundle) => bundle.id == value);

      if (bundle) {
        setVaultCounts(bundle.total - bundle.assigned);
      } else {
        setVaultCounts(0);
      }
    },
    [bundleList]
  );

  useEffect(() => {
    if (formData.productBundle && bundleList.length) {
      handleCardChange(formData?.productBundle);
    }
  }, [bundleList.length, formData.productBundle, handleCardChange]);

  const isProdEcomm = useMemo(
    () => environment == 1 && terminalType === "Ecomm",
    [environment, terminalType]
  );

  return (
    <>
      <div className="container-fluid w-90 form-field-wrapper">
        <p className="blue-heading text-center">Tester Details</p>
        <form className="request-form">
          <div className="d-flex gap-4">
            {environment == 3 && (
              <>
                {/* Product Bundle*/}
                <div>
                  <label className="font">Product Bundle</label>
                  <select
                    name="productBundle"
                    className="form-control formcontrol"
                    value={formData.productBundle}
                    disabled={
                      (requestInfoData.status !== "draft" &&
                        requestInfoData.status !== undefined) ||
                      !isRequester ||
                      canEdit
                    }
                    onChange={(e) => {
                      handleValueChange(e);
                      handleCardChange(e.target.value);
                    }}
                  >
                    <option value="">Select</option>
                    {bundleList?.map((option, index) => (
                      <option value={option.id} key={index}>
                        {option?.bundleName || "-"}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {environment != 3 && (
              <>
                {/* Special feature */}
                {!isProdEcomm && (
                  <div>
                    <label className="font">Card feature</label>
                    <select
                      name="specialFeature"
                      className="form-control formcontrol w-200-p"
                      value={formData.specialFeature}
                      onChange={(e) => handleValueChange(e)}
                      disabled={canEdit || isApproved || !isRequester}
                    >
                      <option value="">Select</option>
                      <option value="transit">Transit</option>
                      <option value="pin_preferred">Pin Preferred</option>
                      <option value="signature_preferred">
                        Signature Preferred
                      </option>
                      {/* <option value="online_pin">Online pin</option> */}
                      {/* <option value="transit_online_pin"> */}
                      {/* Transit online pin */}
                      {/* </option> */}
                      {/* <option value="generic">Generic</option> */}
                    </select>
                  </div>
                )}

                {/* Product */}
                <div>
                  <label className="font">Product</label>
                  <select
                    name="product"
                    className="form-control formcontrol w-200-p"
                    onChange={(e) => handleValueChange(e)}
                    value={formData.product}
                    required
                    disabled={canEdit || isApproved || !isRequester}
                  >
                    <option value="">Select</option>
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
                    <option value="US Debit">US Debit</option>
                  </select>
                </div>

                {/* Type */}
                {/* {!isProdEcomm && (
                  <div>
                    <label className="font">Domestic/Global</label>
                    <select
                      name="domesticGlobal"
                      onChange={handleValueChange}
                      className="form-control formcontrol w-200-p"
                      value={formData.domesticGlobal}
                      required
                      disabled={canEdit || isApproved}
                    >
                      <option value="">Select</option>
                      <option value="domestic">Domestic</option>
                      <option value="global">Global</option>
                    </select>
                  </div>
                )} */}

                {/* Issuer */}
                <div>
                  <label className="font">Issuer</label>
                  {!afterSubmitStatus.includes(requestInfoData.status) &&
                  !isSubmitted ? (
                    <select
                      name="issuer"
                      onChange={handleValueChange}
                      className="form-control formcontrol w-250-p"
                      value={formData.issuer}
                      required
                      disabled={canEdit || isApproved || !isRequester}
                    >
                      <option value="">Select</option>
                      {issuerOptions?.length &&
                        issuerOptions?.map((issuer) => (
                          <option key={issuer.id} value={issuer.issuerId}>
                            {issuer?.issuerName || issuer?.issuer_name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <div>{issuer?.issuer_name || ""}</div>
                  )}
                </div>
              </>
            )}

            {/* cards */}
            <div className="d-flex flex-column align-items-center justify-content-center w-200-p">
              <label className="font text-center">Available cards</label>
              <span className="text-center">{vaultCounts}</span>
            </div>
          </div>

          <div className="row mt-4 align-items-center gap-2">
            <div className="col-3">
              <label className="font">Testing partner</label>
              <select
                name="partner_id"
                className="form-control formcontrol w-200-p"
                value={formData?.partner_id}
                required
                onChange={handleValueChange}
                disabled={canEdit || isApproved || !isRequester}
              >
                <option value="">Select</option>
                {partners?.map((partner, index) => (
                  <option key={index} value={partner?.partner_id}>
                    {partner?.partner_name || "-"}{" "}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-1 font d-flex flex-column align-items-center justify-content-center mt-3">
              Requests#
              <span>{partnerRequests}</span>
            </div>
          </div>

          <div className="pt-5 row d-flex formcard">
            <div className="col-4 form-check me-3 d-flex flex-column gap-2 align-items-center justify-content-center">
              <input
                name="cardType"
                className="form-check-input"
                id="cardType"
                type="radio"
                checked={formData.mediaCard === "yes"}
                value="no"
                disabled={
                  (requestInfoData.status !== "draft" &&
                    requestInfoData.status !== "returned" &&
                    requestInfoData.status !== undefined) ||
                  isApproved ||
                  !isRequester ||
                  canEdit
                }
                defaultChecked
                onChange={() => {
                  setFormData({
                    ...formData,
                    mediaCard: "yes", // Set mediaCard to "yes"
                    physicalCard: "no", // Set physicalCard to "no"
                  });
                  setIsPhysicalCard("no");
                }}
              />
              <div
                className="form-check-label font align-content-center justify-content-center d-flex flex-column"
                htmlFor="statusApproved"
              >
                <label htmlFor="cardType" className="font form-check-label">
                  Mobile card only
                </label>
                <span className="text-center text-danger">
                  {"(No Shipment)"}
                </span>
              </div>
            </div>

            <div className="col-4 form-check me-3 d-flex flex-column gap-2 align-items-center justify-content-center">
              <input
                name="cardType"
                className="form-check-input"
                id="physicalCard"
                type="radio"
                value="yes"
                checked={formData.physicalCard === "yes"}
                disabled={
                  (requestInfoData.status !== "draft" &&
                    requestInfoData.status !== "returned" &&
                    requestInfoData.status !== undefined) ||
                  isApproved ||
                  terminalType === "Ecomm" ||
                  !isRequester ||
                  canEdit
                }
                onChange={() => {
                  setFormData({
                    ...formData,
                    mediaCard: "no",
                    physicalCard: "yes",
                  });
                  setIsPhysicalCard("yes");
                }}
              />
              <div
                className="form-check-label font align-content-center justify-content-center d-flex flex-column"
                htmlFor="statusPhysical"
              >
                <label htmlFor="physicalCard" className="font form-check-label">
                  Physical card
                </label>
              </div>
            </div>
          </div>

          {/* Table */}
          {(vaultCounts > 0 || rows.length) && (
            <div className="tester-detail-table-wrapper mt-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Add More</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {rows?.map((row, index) => (
                    <tr key={row.id}>
                      <td className="position-relative form-field-wrapper">
                        <div className="d-flex">
                          <Select
                            options={availableOptions}
                            labelField="email"
                            searchBy="email"
                            disabled={
                              user.role == 1 ||
                              isApproved ||
                              canEdit ||
                              vaultCounts == 0 ||
                              !isRequester
                            }
                            valueField="email"
                            onChange={(values) => {
                              const user = values[0];
                              if (user) {
                                handleEmailChange(row.id, user.email);
                              }
                            }}
                            onSearch={(query) => {
                              handleEmailChange(row.id, query);
                            }}
                            key={`${row.id}-${row.email}`}
                            className="form-control  formcontrol w-100 max-350-p min-350-p"
                            dropdownHeight="156px"
                            multi={false}
                            clearOnBlur={false}
                            values={[row]}
                            create={true}
                            placeholder="Press Enter to add mail or click ADD"
                          />
                          {renderAddUserButton(row.email)}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control formcontrol"
                          disabled
                          value={row.name}
                          onChange={(e) =>
                            setRows(
                              rows.map((r) =>
                                r.id == row.id
                                  ? { ...r, name: e.target.value }
                                  : r
                              )
                            )
                          }
                          placeholder="Enter name"
                        />
                      </td>
                      <td className="text-center">
                        {index === rows?.length - 1 &&
                          rows.length < vaultCounts &&
                          rows?.length < 10 &&
                          isEmailValidAndUnique(row.email, row.id) && (
                            <button
                              type="button"
                              disabled={
                                isApproved ||
                                user.role == 1 ||
                                !isRequester ||
                                requestInfoData.status == "approved"
                              }
                              onClick={() => {
                                const userExists = users.some(
                                  (user) => user.email === row.email
                                );

                                const lastIndex = rows[rows.length - 1];
                                if (validateEmail(row.email) && userExists) {
                                  addNewRow(lastIndex.id + 1);
                                }
                              }}
                              className="btn btn-outline-primary btn-sm add-more-btn"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          )}
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          disabled={
                            canEdit ||
                            isApproved ||
                            user.role == 1 ||
                            vaultCounts == 0 ||
                            !isRequester
                          }
                          className="btn btn-outline-danger btn-sm delete-btn"
                          onClick={() => deleteRow(row.id, index === 0)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {vaultCounts <= 0 && rows.length == 0 && (
            <div className="p-5 text-center font text-danger">
              Not enough cards available
            </div>
          )}

          {(requestInfoData.status === "draft" ||
            requestInfoData.status == "returned" ||
            requestInfoData.status == undefined) && (
            <div className="w-100 d-flex justify-content-between mt-4">
              <div className="d-flex gap-2 align-items-center justify-content-center">
                <span className="h6">Number of Testers</span>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    name="requestorName"
                    placeholder="0"
                    type="text"
                    disabled
                    className="form-control formcontrol custom-input-w-100"
                    value={rows?.length}
                  />
                </div>
              </div>
              {isRequester && (
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
                    onClick={async () => {
                      handleSave(true);
                    }}
                    type="button"
                    className="btn save-btn save-next-btn"
                    disabled={loading || vaultCounts <= 0 || canEdit}
                  >
                    <span>Save & Next</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSave();
                    }}
                    type="button"
                    className="btn save-btn"
                    disabled={loading || vaultCounts <= 0 || canEdit}
                  >
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {user.role == 2 && isPhysicalCard === "no" && (
          <div className="request-form aqua-border-t mt-4 d-flex align-items-center justify-content-center flex-column py-4 gap-4">
            <div className="row">
              <label htmlFor="" className="col-8">
                I have checked the request&apos;s details
              </label>
              <div className="formcard col-4 d-flex gap-3">
                <div className="form-check d-flex gap-1 align-items-center">
                  <input
                    disabled={canEdit || isApproved}
                    name="requestForSelf"
                    id="details-checked-yes"
                    className="form-check-input"
                    type="radio"
                    value="yes"
                    checked={isChecked === true}
                    onChange={handleCheckedDetailsChange}
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
                    disabled={canEdit || isApproved}
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
                disabled={loading || isApproved || canEdit}
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
                  isApproved ||
                  canEdit
                }
              >
                Submit TC Request
              </button>
            </div>
          </div>
        )}
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

export default TesterDetails;
