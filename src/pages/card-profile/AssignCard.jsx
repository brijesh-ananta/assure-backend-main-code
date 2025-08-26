import { useCallback, useEffect, useState } from "react";
import "./style.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiService from "../../services";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../utils/AuthContext";
import {
  STATUS_ACTIVE,
  STATUS_APPROVED,
  STATUS_ARCHIVE,
  STATUS_CARD_ASSIGNED,
  STATUS_REJECTED,
  STATUS_SUBMITTED,
} from "../../utils/constent";
import { convertToMMDDYYYY } from "../../utils/date";
import { decryptAesGcm } from "../../utils/encryptDecrypt";
import PosCard from "../../components/cards/pos/PosCard";
import axiosToken from "../../utils/axiosToken";

const AssignCard = () => {
  const { id = "" } = useParams();
  const params = new URLSearchParams(location.search);
  const envFromQuery = params.get("environment");
  const [allData, setAllData] = useState({});
  const [data, setData] = useState({});
  const [cardData, setCardData] = useState({});
  const [profileUser, setProfileUser] = useState({});
  const { user } = useAuth();
  const [isCardAssigned, setIsCardAssigned] = useState(false);
  const userType = user.role;
  const navigate = useNavigate();
  const [globalSystemData, setGlobalSystemData] = useState({});

  const [offlineDays, setOfflineDays] = useState("");
  const [offlineUsage, setOfflineUsage] = useState("");
  const [totalUsage, setTotalUsage] = useState("");
  const [lastUseDate, setLastUseDate] = useState("");
  const [individualTransactionLimit, setIndividualTransactionLimit] =
    useState("");
  const [totalTransactionLimit, setTotalTransactionLimit] = useState("");
  const [formError, setFormError] = useState("");

  const fetchDetail = useCallback(async () => {
    try {
      const resp = await apiService.cardProfile.getById(id);
      setAllData(resp);
      setData(resp.profile);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    if (data.status) {
      const allowedStatus = [
        STATUS_CARD_ASSIGNED,
        STATUS_SUBMITTED,
        STATUS_APPROVED,
        STATUS_REJECTED,
        STATUS_ACTIVE,
        STATUS_ARCHIVE,
      ];
      setIsCardAssigned(allowedStatus.includes(data.status));
    }
  }, [data.status]);

  useEffect(() => {
    const val = cardData?.environment;

    if (val) {
      params.set("environment", val);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [cardData]);

  useEffect(() => {
    async function fetchSystemDefault() {
      if (data?.environment_id || envFromQuery) {
        try {
          const response = await axiosToken.get(
            `/system-defaults?environment=${
              data?.environment_id || envFromQuery
            }`
          );
          if (response.data && response.data.length > 0) {
            setGlobalSystemData(response.data[0]);
          }
        } catch (error) {
          console.error("Error fetching system defaults:", error);
        }
      }
    }
    fetchSystemDefault();
  }, [data?.environment_id, envFromQuery]);

  function canAssignCardButton(env, userRole) {
    env = Number(env);
    if (env === 1 && (userRole === 1 || userRole === 4)) return true;
    if (env === 2 && [1, 4, 6].includes(userRole)) return true;
    return false;
  }

  const decryptCardDetails = useCallback(async (card) => {
    if (!card.ivKey || !card.cardDetails) return card;
    const userCiperText = localStorage.getItem("ciperText");

    const decryptedObj = await decryptAesGcm({
      cipherText: card.cardDetails,
      authTagB64: card.authTag,
      ivKey: card.ivKey,
      userKey: userCiperText,
    });
    return decryptedObj;
  }, []);

  const getAvailableCards = useCallback(async () => {
    try {
      const params = {
        product: data?.product,
        feature: data?.card_feature,
        issuer_id: data?.issuer_id,
        environment: data?.environment_id || envFromQuery,
      };

      let resp = "";
      if (allData?.userCardData?.length) {
        const card = allData?.userCardData[0] || "";
        card.cardDetails = card?.card_encrypted_data;
        card.ivKey = card?.card_encryption_iv;
        card.authTag = card?.card_encryption_auth_tag;

        const decryptedObj = await decryptCardDetails(card);
        setCardData({ ...card, decryptedCardDetails: decryptedObj });
      } else {
        resp = await apiService.cardProfile.getAvailableCards(params);

        if (resp.data && resp.data.length) {
          const card = resp.data[0];
          const decryptedObj = await decryptCardDetails(card);
          setCardData({ ...card, decryptedCardDetails: decryptedObj });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [
    allData?.userCardData,
    data?.card_feature,
    data?.environment_id,
    data?.issuer_id,
    data?.product,
    decryptCardDetails,
    envFromQuery,
  ]);

  const fetchUser = useCallback(async () => {
    try {
      const resp = await apiService.user.getById(data.created_by);
      setProfileUser(resp);
    } catch (error) {
      console.error(error);
    }
  }, [data.created_by]);

  useEffect(() => {
    if (data.created_by) {
      fetchUser();
    }
  }, [data.created_by, fetchUser]);

  useEffect(() => {
    if (
      (data?.card_feature && data?.issuer_id && data?.product) ||
      data?.environment_id
    ) {
      getAvailableCards();
    }
  }, [
    data,
    data?.card_feature,
    data.environment,
    data?.issuer_id,
    data?.product,
    getAvailableCards,
  ]);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [fetchDetail, id]);

  const handleNumberFieldChange = (e, setter) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    setter(cleanedValue);
  };

  const handleAssignCard = async () => {
    setFormError("");

    if (!validateForm()) {
      setFormError("All fields are required.");
      return;
    }

    if (+totalTransactionLimit > +(cardData.otb || cardData?.OTB || 0)) {
      toast.error(`Total transaction limit cannot exceed the available OTB (${cardData?.OTB || cardData?.otb}).`
      )
      return
    }
    
    const payload = {
      cardID: cardData?.cardid,
      userId: data?.created_by,
      offline_days: offlineDays,
      offline_usage: offlineUsage,
      total_usage: totalUsage,
      last_use_date: lastUseDate,
      individual_transaction_limit: individualTransactionLimit,
      total_transaction_limit: totalTransactionLimit,
      profile_id: data?.id,
    };

    try {
      const resp = await apiService.cardProfile.assignCard(payload);
      toast.success(resp?.message || "Assigned");

      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error(error);
    }
  };

  const validateForm = () => {
    if (
      !offlineDays ||
      !offlineUsage ||
      !totalUsage ||
      !lastUseDate ||
      !individualTransactionLimit ||
      !totalTransactionLimit
    ) {
      return false;
    }

    if (
      individualTransactionLimit &&
      +(individualTransactionLimit || 0) > +(totalTransactionLimit || 0)
    ) {
      toast.error(
        "Individual Transaction Limit can not be more then total Transaction limit"
      );
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (allData && allData?.profile && allData?.userCardData?.length) {
      const userCardData = allData?.userCardData[0];
      setOfflineDays(
        userCardData?.offlineDays ?? globalSystemData?.offline_days ?? ""
      );
      setOfflineUsage(
        userCardData?.onlineUsages ?? globalSystemData?.offline_usage ?? ""
      );
      setTotalUsage(
        userCardData?.totalUsage ?? globalSystemData?.total_usage ?? ""
      );
      setIndividualTransactionLimit(
        userCardData?.individual_transaction_limit ??
          globalSystemData?.individual_transaction_limit ??
          ""
      );
      setTotalTransactionLimit(
        userCardData?.total_transaction_limit ??
          globalSystemData?.total_transaction_limit ??
          ""
      );
      setLastUseDate(
        userCardData?.LastUseDate
          ? userCardData.LastUseDate.slice(0, 10)
          : globalSystemData?.last_use_date
          ? globalSystemData.last_use_date.slice(0, 10)
          : ""
      );
    } else if (Object.keys(globalSystemData).length) {
      setOfflineDays(globalSystemData?.offline_days ?? "");
      setOfflineUsage(globalSystemData?.offline_usage ?? "");
      setTotalUsage(globalSystemData?.total_usage ?? "");
      setIndividualTransactionLimit(
        globalSystemData?.individual_transaction_limit ?? ""
      );
      setTotalTransactionLimit(globalSystemData?.total_transaction_limit ?? "");
      setLastUseDate(
        globalSystemData?.last_use_date
          ? globalSystemData.last_use_date.slice(0, 10)
          : ""
      );
    }
  }, [allData, globalSystemData]);

  const handleReleaseCardClick = async () => {
    try {
      const resp = await apiService.cardProfile.releaseCard(
        allData?.userCardData[0]?.userCarid
      );

      if (resp) {
        toast.success(resp?.message || "Cared released");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-4 mx-3 assign-card-wrapper">
      <div className="accordion" id={`testerAccordion`}>
        <div className="accordion-item mt-4">
          <h2 className="accordion-header" id={`heading`}>
            <button
              className="accordion-button ps-5"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse`}
              aria-expanded="true"
              aria-controls={`collapse`}
            >
              <div className="d-flex align-items-center w-100">
                <div className="check-circle me-2">
                  <i className="fas fa-check"></i>
                </div>
                <span className="tester-link">Tester_1</span>
                <div className="ms-4 flex-grow-1 row">
                  <div className="col-12 d-flex justify-content-around">
                    <div className="d-flex gap-4 align-items-center">
                      <label htmlFor="profileName" className="font">
                        Name
                      </label>
                      <input
                        id="profileName"
                        name="profileName"
                        value={profileUser?.user?.firstName || ""}
                        className="form-control formcontrol"
                        placeholder="DFC_TCI-Credit_PIN"
                        disabled
                      />
                    </div>
                    <div className="d-flex gap-4 align-items-center">
                      <label htmlFor="profileEmail" className="font">
                        Email
                      </label>
                      <input
                        id="profileEmail"
                        name="profileEmail"
                        value={profileUser?.user?.email}
                        className="form-control formcontrol"
                        placeholder="DFC_TCI-Credit_PIN"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </h2>

          <div
            id={`collapse`}
            className="accordion-collapse collapse show"
            aria-labelledby={`heading`}
            data-bs-parent={`#testerAccordion`}
          >
            <div className="accordion-body">
              <div className="d-flex gap-1">
                <div className="w-50">
                  <PosCard data={cardData} />
                </div>
                <div className="row w-50">
                  <div className="col-12 row w-100">
                    <span className="col-5 no-wrap font text-2 text-right">
                      Issuer Name
                    </span>
                    <div className="col-5 no-wrap font">
                      {cardData?.issuer_name || cardData?.issuerName}
                    </div>
                  </div>
                  <div className="col-12 row w-100">
                    <span className="col-5 no-wrap font text-2 text-right">
                      Product
                    </span>
                    <div className="col-5 no-wrap font">
                      {cardData?.binProduct}
                    </div>
                  </div>
                  <div className="col-12 row w-100">
                    <span className="col-5 no-wrap font text-2 text-right">
                      Status
                    </span>
                    <div className="col-5 no-wrap font">{cardData?.status}</div>
                  </div>
                  <div className="col-12 row w-100">
                    <span className="col-5 no-wrap font text-2 text-right">
                      Exp. Date
                    </span>
                    <div className="col-5 no-wrap font">
                      {convertToMMDDYYYY(
                        cardData?.decryptedCardDetails?.expDate
                      )}
                    </div>
                  </div>
                  <div className="col-12 row w-100">
                    <span className="col-5 no-wrap font text-2 text-right">
                      PIN
                    </span>
                    <div className="col-5 no-wrap font">
                      {cardData?.decryptedCardDetails?.pinNumber}
                    </div>
                  </div>
                  <div className="col-12 row w-100">
                    <span className="col-5 no-wrap font text-2 text-right">
                      Profile Name
                    </span>
                    <div className="col-5 no-wrap font">
                      {data?.profile_name}
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-5">
                <div className="d-flex align-items-center">
                  <div className="font me-4">MCC Code</div>
                  <input
                    type="checkbox"
                    className="form-check-input custom-check-box"
                    name="mccCodesAll"
                    id="mccCodesAll"
                    checked={true}
                    disabled={true}
                  />
                  <span className="form-check-label ms-3">All</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="font me-4">Country Code</div>
                  <input
                    type="checkbox"
                    className="form-check-input custom-check-box"
                    name="mccCodesAll"
                    id="mccCodesAll"
                    checked={true}
                    disabled={true}
                  />
                  <span className="form-check-label ms-3">All</span>
                </div>
              </div>
              <div className="d-flex mt-2 gap-5">
                <div className="d-flex align-items-center gap-2">
                  <label className="font no-wrap">Offline Days</label>
                  <input
                    name="offline_days"
                    placeholder="2"
                    type="text"
                    value={offlineDays}
                    className="form-control formcontrol w-50p p-5p"
                    onChange={(e) => setOfflineDays(e.target.value)}
                    disabled={isCardAssigned}
                  />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="font no-wrap">Offline Usage</label>
                  <input
                    name="offline_usage"
                    placeholder="2"
                    type="text"
                    value={offlineUsage}
                    className="form-control formcontrol w-50p p-5p"
                    onChange={(e) => setOfflineUsage(e.target.value)}
                    disabled={isCardAssigned}
                  />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="font no-wrap">Total Usage</label>
                  <input
                    name="total_usage"
                    placeholder="2"
                    type="text"
                    value={totalUsage}
                    className="form-control formcontrol w-50p p-5p"
                    onChange={(e) => setTotalUsage(e.target.value)}
                    disabled={isCardAssigned}
                  />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label className="font no-wrap">Last Use Date</label>
                  <input
                    name="last_use_days"
                    placeholder="2"
                    type="date"
                    value={lastUseDate}
                    onChange={(e) => setLastUseDate(e.target.value)}
                    className="form-control formcontrol"
                    disabled={isCardAssigned}
                  />
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-6 d-flex gap-3 align-items-center">
                  <label htmlFor="" className=" no-wrap font">
                    Individual Transaction Limit
                  </label>
                  <input
                    type="text"
                    name="individualTransactionLimit"
                    placeholder="$10.00"
                    className="form-control formcontrol w-150p"
                    value={`${
                      individualTransactionLimit &&
                      `$${individualTransactionLimit}`
                    }`}
                    onChange={(e) =>
                      handleNumberFieldChange(e, setIndividualTransactionLimit)
                    }
                    disabled={isCardAssigned}
                  />
                </div>
                <div className="col-6 d-flex gap-3 align-items-center">
                  <label htmlFor="" className=" no-wrap font">
                    Total Transaction Limit
                  </label>
                  <input
                    type="text"
                    name="totalTransactionLimit"
                    placeholder="$100.00"
                    className="form-control formcontrol w-150p"
                    value={`${
                      totalTransactionLimit && `$${totalTransactionLimit}`
                    }`}
                    onChange={(e) =>
                      handleNumberFieldChange(e, setTotalTransactionLimit)
                    }
                    disabled={isCardAssigned}
                  />
                </div>
              </div>

              {formError && (
                <div className="alert alert-danger mt-3">{formError}</div>
              )}

              <div className="mt-5 d-flex gap-4 align-items-enter justify-content-end">
                {isCardAssigned &&
                  canAssignCardButton(envFromQuery, userType) && (
                    <button
                      className="btn save-btn"
                      onClick={() => handleReleaseCardClick()}
                    >
                      Release Card
                    </button>
                  )}
                <Link to={"/dashboard/card-profile"} className="btn cancel-btn">
                  Cancel
                </Link>
                {canAssignCardButton(envFromQuery, userType) && (
                  <button
                    disabled={isCardAssigned}
                    className="btn save-btn"
                    onClick={handleAssignCard}
                  >
                    Assign Card
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default AssignCard;
