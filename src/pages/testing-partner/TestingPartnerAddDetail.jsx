import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import axiosToken from "../../utils/axiosToken";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./TestingPartnerForm.css";

const TestingPartnerAddDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    partner_name: Yup.string().required("Partner name is required."),
    contact_person: Yup.string().required("Contact person is required."),
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Email is required."),
    status: Yup.string().required("Status is required."),
  });

  const formik = useFormik({
    initialValues: {
      partner_name: "",
      contact_person: "",
      email: "",
      status: "draft",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = { ...values, created_by: user.user_id };
        const response = await axiosToken.post("/partners", payload);
        toast.success(response?.data.message || "Testing partner added");
        navigate("/dashboard/testing-partner");
      } catch (err) {
        toast.error(err.response?.data?.error || "An error occurred.");
      }
    },
  });

  return (
    <section className="form-field-wrapper mt-5">
      <form
        onSubmit={formik.handleSubmit}
        className="d-flex flex-column gap-4 w-80 m-auto"
        autoComplete="off"
      >
        {/* Row 1 */}
        <div className="row">
          <div className="col-6 row align-items-center">
            <label className="col-5 text-right font">Partner Name</label>
            <div className="col-7">
              <input
                className="form-control formcontrol"
                name="partner_name"
                type="text"
                placeholder="Enter partner name"
                value={formik.values.partner_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.partner_name && formik.errors.partner_name && (
                <div className="font text-danger no-wrap">
                  {formik.errors.partner_name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="row">
          <div className="col-6 row align-items-center">
            <label className="col-5 font text-right">
              Partner Contact Person
            </label>
            <div className="col-7">
              <input
                className="form-control formcontrol"
                name="contact_person"
                type="text"
                placeholder="Enter contact person"
                value={formik.values.contact_person}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.contact_person &&
                formik.errors.contact_person && (
                  <div className="font text-danger no-wrap">
                    {formik.errors.contact_person}
                  </div>
                )}
            </div>
          </div>
          <div className="col-6 row align-items-center">
            <label className="col-3 text-right font no-wrap">
              Email Address
            </label>
            <div className="col-8">
              <input
                className="form-control formcontrol"
                name="email"
                type="email"
                placeholder="example@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="font text-danger no-wrap">
                  {formik.errors.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3 - Status */}
        <div className="col-12 row ps-1">
          <label className="col-2 ms-4 text-right font">Status</label>
          <div className="col-5 d-flex align-items-center gap-5">
            {["draft", "active", "inactive"].map((status) => (
              <label key={status} className="tp-radio-label ms-4">
                <input
                  className="form-check-input"
                  style={{
                    marginTop: 0,
                    width: "1.3rem",
                    height: "1.3rem",
                    marginRight: "10px",
                  }}
                  type="radio"
                  name="status"
                  value={status}
                  checked={formik.values.status === status}
                  onChange={formik.handleChange}
                />
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="button-group justify-content-end">
          <button
            className="btn cancel-btn"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button className="btn save-btn" type="submit">
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
    </section>
  );
};

export default TestingPartnerAddDetail;
