/* eslint-disable no-useless-escape */
import Sidebar from "../../common/Sidebar";
import { useAuth } from "../../utils/AuthContext";
import { formatDateToLocal } from "../../utils/date";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosToken from "../../utils/axiosToken";
import { toast } from "react-toastify";
import { useState } from "react";
import PasswordInput from "../../components/shared/form-fields/PasswordField";

function ProfileV2() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Current Password is required"),
      newPassword: Yup.string()
        .required("New Password is required")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
          "Must be at least 8 characters, Include an upper case, a lower case letter, a digit and a special character."
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm New Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const payload = {
        currentPassword: values.currentPassword,
        newPassword: values.confirmPassword,
      };
      try {
        const result = await axiosToken.post("/users/change-password", payload);
        if (result.status === 200 || result.status === 201) {
          toast.success("Password updated");
          passwordFormik.resetForm();
          setChangePassword(false);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Failed to update password. Please try again."
        );
      }
      setLoading(false);
    },
  });

  const roleMapping = {
    1: "TC_SME",
    2: "TC_REQUEST_USER",
    3: "TC_REQUEST_VIEW_USER",
    4: "TC_MANAGER_USER",
    6: "PROFILE_EDITOR",
  };

  return (
    <div className="pt-5">
      <section className="profile-section my-4">
        <div className="container col-md-10">
          <h4>My Profile</h4>

          <div className="mt-4 row">
            <div className="col-12 row">
              <div className="col-6 row">
                <span className="font col-3 text-right">User Name</span>
                <span className="col-6">
                  {user?.firstName || ""} {user?.lastName || ""}
                </span>
              </div>
              <div className="col-6 row">
                <span className="col-4 text-right font">User Since</span>
                <span className="col-6 ps-3">
                  {formatDateToLocal(user?.created_at)}
                </span>
              </div>
            </div>
            <div className="col-12 row mt-4">
              <div className="col-6 row">
                <span className="font col-3 no-wrap text-right">
                  Email Address
                </span>
                <span className="col-6 no-wrap">{user?.email || ""}</span>
              </div>
            </div>
            <div className="col-12 row mt-4">
              <div className="col-6 row">
                <span className="font col-3 text-right">User Role</span>
                <span className="col-6">{roleMapping[user?.role]}</span>
              </div>
              <div className="col-6 row">
                <span className="font col-4 no-wrap text-right">Test Card Env Access</span>
                <span className="col-8 d-flex gap-3 ps-5">
                  <div className="form-check me-4 d-flex gap-1 p-0 align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input custom-check-box"
                      name="mccCodesAll"
                      id="mccCodesAll"
                      checked={user.prod == 1}
                      disabled
                    />
                    <label
                      className="form-check-label ms-3 tex-black opacity-100"
                      htmlFor="mccCodesAll"
                    >
                      Prod
                    </label>
                  </div>
                  <div className="form-check me-4 d-flex gap-1 p-0 align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input custom-check-box"
                      name="mccCodesAll"
                      id="mccCodesAll"
                      checked={user?.qa == 1}
                      disabled
                    />
                    <label
                      className="form-check-label ms-3 tex-black opacity-100"
                      htmlFor="mccCodesAll"
                    >
                      QA
                    </label>
                  </div>
                  <div className="form-check me-4 d-flex gap-1 p-0 align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input custom-check-box"
                      name="mccCodesAll"
                      id="mccCodesAll"
                      checked={user?.test == 1}
                      disabled
                    />
                    <label
                      className="form-check-label ms-3 tex-black opacity-100"
                      htmlFor="mccCodesAll"
                    >
                      Cert
                    </label>
                  </div>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 d-flex gap-5 justify-content-center align-align-items-center">
            <button
              className="btn cancel-btn"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              className="btn save-btn"
              onClick={() => setChangePassword(true)}
            >
              Change Password
            </button>
          </div>

          {changePassword && (
            <div className="mt-4 m-5 border border-2 p-4 rounded-3">
              <h3>Change Password</h3>

              <form
                onSubmit={passwordFormik.handleSubmit}
                className="form-field-wrapper row gap-4 w-80 mt-5 m-auto"
              >
                <div className="col-12 row">
                  <label htmlFor="" className="font no-wrap col-4">
                    Current Password
                  </label>

                  <div className="d-flex flex-column w-50">
                    <PasswordInput
                      name="currentPassword"
                      placeholder="Current Password"
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.errors.currentPassword}
                      touched={passwordFormik.touched.currentPassword}
                    />
                  </div>
                </div>

                <div className="col-12 row">
                  <label htmlFor="" className="font no-wrap col-4">
                    New Password
                  </label>

                  <div className="d-flex flex-column w-50">
                    <PasswordInput
                      name="newPassword"
                      placeholder="New Password"
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.errors.newPassword}
                      touched={passwordFormik.touched.newPassword}
                    />
                  </div>
                </div>

                <div className="col-12 row">
                  <label htmlFor="" className="font no-wrap col-4">
                    Confirm New Password
                  </label>

                  <div className="d-flex flex-column w-50">
                    <PasswordInput
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.errors.confirmPassword}
                      touched={passwordFormik.touched.confirmPassword}
                    />
                  </div>
                </div>

                <div className="col-12 d-flex gap-2 justify-content-end mt-5">
                  <button
                    onClick={() => {
                      passwordFormik.resetForm();
                      setChangePassword(false);
                    }}
                    disabled={loading}
                    className="btn cancel-btn"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn save-btn"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      <Sidebar />
    </div>
  );
}

export default ProfileV2;
