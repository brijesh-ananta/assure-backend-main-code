import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiService from "../../services";
import { useAuth } from "../../utils/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import CustomFileUpload from "../../components/shared/form-fields/CustomFileUpload";
import {
  STATUS_ACTIVE,
  STATUS_APPROVED,
  STATUS_ARCHIVE,
  STATUS_CARD_ASSIGNED,
  STATUS_REJECTED,
  STATUS_SUBMITTED,
  STATUS_TESTING,
} from "../../utils/constent";

// New code here
function getAllowedStatuses(
  currentStatus,
  userRole,
  currentUserId,
  profileCreator
) {
  switch (currentStatus) {
    case "testing":
      // SME assigns card
      return userRole === 1 ? ["testing_card_assigned"] : [];
    case "testing_card_assigned":
      // only the creator (“card user”) may submit
      return currentUserId === profileCreator ? ["submitted"] : [];
    case "submitted":
      // Manager approves or rejects
      return userRole === 4 || userRole === 1 ? ["approved", "rejected"] : [];
    case "approved":
      // after approval, both SME and Manager can activate or archive
      return [1, 4].includes(userRole) ? ["active", "archive"] : [];
    default:
      // all other statuses are terminal or not user-editable
      return [];
  }
}

// New code here
const statusList = [
  {
    title: "Testing",
    value: "testing",
    disabled: true,
  },
  {
    title: "Testing Card Assigned",
    value: "testing_card_assigned",
    disabled: true,
  },
  {
    title: "Submitted",
    value: "submitted",
  },
  {
    title: "Approved",
    value: "approved",
    disabled: true,
  },
  {
    title: "Rejected",
    value: "rejected",
    disabled: true,
  },
  {
    title: "Active",
    value: "active",
  },
  {
    title: "Archive",
    value: "archive",
  },
];

const ViewProfile = () => {
  const { id = "" } = useParams();
  const params = new URLSearchParams(location.search);
  const envFromQuery = params.get("environment");
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [cardData, setCardData] = useState({});
  const { user } = useAuth();
  const userRole = user.role;
  const currentUserId = user?.id || user?.user_id;
  const profileCreator = data.created_by;

  const allowedStatuses = useMemo(
    () =>
      getAllowedStatuses(data.status, userRole, currentUserId, profileCreator),
    [data.status, userRole, currentUserId, profileCreator]
  );

  const fetchDetail = useCallback(async () => {
    try {
      const resp = await apiService.cardProfile.getById(id);
      setData(resp.profile);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const getAvailableCards = useCallback(async () => {
    try {
      const params = {
        product: data?.product,
        feature: data?.card_feature,
        issuer_id: data?.issuer_id,
        environment: data?.environment_id || envFromQuery,
      };
      const resp = await apiService.cardProfile.getAvailableCards(params);
      setCardData(resp);
    } catch (error) {
      console.error(error);
    }
  }, [
    data?.card_feature,
    data?.environment_id,
    data?.issuer_id,
    data?.product,
    envFromQuery,
  ]);

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

  useEffect(() => {
    const val = data?.environment_id;

    if (val) {
      params.set("environment", val);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [data?.environment_id]);

  useEffect(() => {
    const profileId = data.id;

    if (profileId) {
      params.set("recordId", profileId);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [data.id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      status: data.status || "",
      profileImage: null,
    },
    validationSchema: Yup.object({
      status: Yup.string().required("Status is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const formData = new FormData();
      if (values.profileImage) {
        formData.append("xml_file", values.profileImage);
      }
      if (values.status !== data.status) {
        formData.append("status", values.status);
      }
      try {
        await apiService.cardProfile.update(id, formData);
        toast.success("Profile updated!");
        fetchDetail();
      } catch (e) {
        console.error(e);
        toast.error("Update failed.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const afterAssigned = useMemo(() => {
    const allowedStatus = statusList
      .filter((opt) => opt.value !== "testing")
      .map((o) => o.value);
    return allowedStatus.includes(data.status);
  }, [data.status]);

  function canAssignCard(env, userRole, afterAssigned, cardCount) {
    if (afterAssigned) return false; // If already assigned, don't show assign button

    if (env === 1 && (userRole === 1 || userRole === 4) && cardCount > 0) {
      return true;
    }
    if (env === 2 && [1, 4, 6].includes(userRole) && cardCount > 0) {
      return true;
    }
    return false;
  }

const downloadFile = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("File download failed");
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${new Date().toString()}.xml`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    alert("Download failed: " + error.message);
  }
};



  return (
    <div className="container gap-3 mt-5">
      <form onSubmit={formik.handleSubmit}>
        <div className="row w-100">
          <div className="row col-6 gap-3">
            <div className="col-12 gap-1 row">
              <label htmlFor="issuerName" className="font col-4 text-right">
                Issuer Name
              </label>
              <div className="col-4 text-2 fa-1x">{data?.issuer_name}</div>
            </div>
            <div className="col-12 gap-1 row">
              <label htmlFor="product" className="font col-4 text-right">
                Product
              </label>
              <div className="col-4 text-2 fa-1x">{data?.product || ""}</div>
            </div>
            <div className="col-12 gap-1 row">
              <label htmlFor="featureText" className="font col-4 text-right">
                Feature
              </label>
              <div
                className="col-4 text-2 fa-1x"
                style={{ textTransform: "capitalize" }}
              >
                {data?.card_feature}
              </div>
            </div>
            <div className="col-12 gap-1 row">
              <label
                htmlFor="profileName"
                className="font col-4 text-right no-wrap"
              >
                Current Version
              </label>
              <div className="col-4 text-2 fa-1x">{data?.version || "1.2"}</div>
            </div>
            <div className="col-12 gap-1 row">
              <label className="font col-4 text-right">Status</label>
              <div className="col-4 text-2 fa-1x text-capitalize">{data?.status}</div>
            </div>
            <div className="col-12 gap-1 row">
              <label className="font col-4 text-right">Profile Name</label>
              <div className="col-4 text-2 fa-1x"> {data?.profile_name}</div>
            </div>
            <div className="col-12 gap-1 row">
              <label className="font col-4 text-right">Profile</label>
              <div className="col-7 d-flex gap-4 text-2 fa-1x underline font text-4">
                {data.xml_file_url ? (
                  <span
                      onClick={() => downloadFile(data.xml_file_url)}
                      className="cursor-pointer"
                  >
                    Download current
                  </span>
                ) : (
                  "No file uploaded"
                )}
                {[STATUS_TESTING, STATUS_CARD_ASSIGNED].includes(
                  data.status
                ) && (
                  <CustomFileUpload
                    name="profileImage"
                    value={formik.values.profileImage}
                    onChange={(name, file) => formik.setFieldValue(name, file)}
                    onBlur={formik.handleBlur}
                    error={formik.errors.profileImage}
                    touched={formik.touched.profileImage}
                    className="w-100 mt-2 no-wrap p-2"
                    accept=".xml"
                  />
                )}
              </div>
            </div>
            <div className="col-12 gap-1 row">
              <label className="font col-4 text-right">Profile Editor</label>
              <div className="col-4 text-2 fa-1x ">{data?.profileEditorEmail}</div>
            </div>
            <>
              <div className="col-12 gap-1 row z-3">
                <label className="font col-4 text-right">Status</label>
                <div className="col-7 text-2 fa-1x d-flex gap-2">
                  {statusList.map((option) => (
                    <div
                      className="d-flex align-items-center"
                      key={option.value}
                    >
                      <input
                        id={`status-${option.value}`}
                        className="form-check-input p-12p"
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formik.values.status === option.value}
                        onChange={formik.handleChange}
                        disabled={
                          !allowedStatuses.includes(option.value) ||
                          option.disabled
                        }
                      />
                      <label
                        htmlFor={`status-${option.value}`}
                        className="form-check-label ms-3 no-wrap font"
                      >
                        {option.title}
                      </label>
                    </div>
                  ))}
                </div>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-danger">{formik.errors.status}</div>
                )}
              </div>
            </>
            {/* {userRole == 4 && ( uncommit this line after changed*/}
            {[
              STATUS_SUBMITTED,
              STATUS_APPROVED,
              STATUS_REJECTED,
              STATUS_ACTIVE,
              STATUS_ARCHIVE,
            ].includes(data.status) &&
              (userRole === 4 || userRole === 1) && (
                <div className="col-12 gap-1 row">
                  <label className="font col-4 text-right">Action</label>
                  <div className="col-7 text-2 fa-1x d-flex gap-2">
                    <div className="d-flex align-items-center">
                      <input
                        className="form-check-input p-12p"
                        type="radio"
                        name="status"
                        value={"approved"}
                        checked={formik.values.status === "approved"}
                        onChange={formik.handleChange}
                        disabled={!allowedStatuses.includes("approved")}
                      />
                      <label className="form-check-label ms-3 no-wrap font">
                        Approve Profile
                      </label>
                    </div>
                    <div className="d-flex align-items-center">
                      <input
                        className="form-check-input p-12p"
                        type="radio"
                        name="status"
                        value={"rejected"}
                        checked={formik.values.status === "rejected"}
                        onChange={formik.handleChange}
                        disabled={!allowedStatuses.includes("rejected")}
                      />
                      <label className="form-check-label ms-3 no-wrap font">
                        Reject Profile
                      </label>
                    </div>
                  </div>
                </div>
              )}
          </div>
          <div className="col-6 row">
            <div className="col-12 gap-1 row">
              <label htmlFor="issuerName" className="font col-4 text-right">
                Profile ID
              </label>
              <div className="col-4 text-2 fa-1x">{data?.profile_id}</div>
            </div>
            <div className="col-12 gap-1 row mt-5">
              <label htmlFor="issuerName" className="font col-4 text-right">
                Available Cards
              </label>
              {afterAssigned ? (
                <div className="col-7 text-2 fa-1x d-flex align-items-start gap-3 justify-content-center">
                  <Link
                    to={`/dashboard/card-profile/assign-card/${id}`}
                    className="btn p-2 w-50 assign-btn"
                  >
                    View card
                  </Link>
                </div>
              ) : (
                <>
                  <div className="col-7 text-2 fa-1x d-flex align-items-start gap-3 justify-content-center">
                    <span className="font">{cardData?.count || 0}</span>
                    {canAssignCard(
                      Number(data?.environment_id || envFromQuery),
                      userRole,
                      afterAssigned,
                      cardData?.count || 0
                    ) && (
                      <Link
                        to={`/dashboard/card-profile/assign-card/${id}`}
                        className="btn p-2 w-100 assign-btn"
                      >
                        Assign card
                      </Link>
                    )}
                  </div>
                  {/* <div className="col-7 text-2 fa-1x d-flex align-items-start gap-3 justify-content-center">
                    <span className="font">{cardData?.count || 0}</span>
                    {cardData?.count > 0 && (
                      <Link
                        to={`/dashboard/card-profile/assign-card/${id}`}
                        className="btn p-2 w-100 assign-btn"
                      >
                        Assign card
                      </Link>
                    )}
                  </div> */}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 mt-5 d-flex gap-5 justify-content-end">
          <Link
            to="/dashboard/card-profile"
            className="btn cancel-btn w-25 font"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn save-btn w-25 font"
            disabled={
              (!formik.dirty && !formik.values.profileImage) ||
              formik.isSubmitting
            }
          >
            Save
          </button>
        </div>
      </form>

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
    </div>
  );
};

export default ViewProfile;
