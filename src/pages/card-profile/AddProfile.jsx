import { useFormik } from "formik";
import * as Yup from "yup";
import CustomFileUpload from "../../components/shared/form-fields/CustomFileUpload";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import apiService from "../../services";
import { toast, ToastContainer } from "react-toastify";
import binService from "../../services/bin";

const AddProfile = () => {
  const { id = "" } = useParams();
  const params = new URLSearchParams(location.search);
  const envFromQuery = params.get("environment");
  const navigate = useNavigate();

  const [issuers, setIssuers] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);

  const formik = useFormik({
    initialValues: {
      issuerName: "",
      product: "",
      brand: "",
      featureText: "",
      profileName: "",
      profileImage: null,
    },
    validationSchema: Yup.object({
      issuerName: Yup.string().required("Name is required"),
      product: Yup.string().required("Product is required"),
      featureText: Yup.string().required("Feature Text is required"),
      profileImage: Yup.mixed().required("JSON file is required"),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);

      try {
        const formData = new FormData();

        // Append form fields
        formData.append("profile_name", profileName);
        formData.append("product", values.product);
        formData.append("card_feature", values.featureText);
        formData.append("issuer_id", values.issuerName);
        formData.append("brand", values.brand);
        formData.append("environment_id", envFromQuery || "");
        formData.append("date_submitted", new Date().toISOString());

        // Append file
        if (values.profileImage) {
          formData.append("json_file", values.profileImage);
        }

        const resp = await apiService.cardProfile.create(formData);
        if (resp?.message === "Profile created successfully") {
          toast.success(resp?.message || "Created");
          navigate("/dashboard/card-profile");
        }
      } catch (err) {
        console.error(err);
        toast.error("Creation failed");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  const fetchIssuers = useCallback(async () => {
    try {
      const data = await binService.getIssuerList(envFromQuery, "Pos");

      setIssuers(data);
    } catch (error) {
      setIssuers([]);
      console.error(error);
    }
  }, [envFromQuery]);

  useEffect(() => {
    if (envFromQuery) {
      fetchIssuers();
    }
  }, [fetchIssuers, envFromQuery]);

  const fetchBrands = useCallback(async () => {
    try {
      const data = await apiService.brands.getactive({ env: envFromQuery });

      setBrands(data?.data.map((b) => b.name));
    } catch (error) {
      setBrands([]);
      console.error(error);
    }
  }, [envFromQuery]);

  useEffect(() => {
    if (envFromQuery) {
      fetchBrands();
    }
  }, [fetchBrands, envFromQuery]);

  const getProfileName = useCallback(() => {
    if (!formik.values.issuerName) return;

    const issuerObj = issuers.find(
      (issuer) =>
        issuer.id == formik.values.issuerName ||
        issuer.issuer_id == formik.values.issuerName
    );

    const issuerName = issuerObj?.issuer_name || "";
    const issuerFirst4 = issuerName
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase();

    const profile_name = `${formik.values.brand}_${issuerFirst4}_${formik.values.product}_${formik.values.featureText}`;

    setProfileName(profile_name);
  }, [
    formik.values.brand,
    formik.values.featureText,
    formik.values.issuerName,
    formik.values.product,
    issuers,
  ]);

  useEffect(() => {
    getProfileName();
  }, [getProfileName]);

  return (
    <div className="container">
      <form
        onSubmit={formik.handleSubmit}
        className="form-field-wrapper row gap-3"
      >
        <div className="col-12 gap-1 row">
          <label htmlFor="issuerName" className="font col-4 text-right">
            Issuer Name
          </label>
          <div className="d-flex flex-column col-4">
            {!id ? (
              <select
                id="issuerName"
                name="issuerName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.issuerName}
                className="form-control formcontrol"
              >
                <option value="">Select Status</option>
                {issuers?.map((issuer) => (
                  <>
                    <option value={issuer.id || issuer?.issuer_id}>
                      {issuer?.issuer_name || ""}
                    </option>
                  </>
                ))}
              </select>
            ) : (
              <span className="text-2">Bank 1</span>
            )}
            {formik.touched.issuerName && formik.errors.issuerName ? (
              <div className="text-danger font">{formik.errors.issuerName}</div>
            ) : null}
          </div>
        </div>

        <div className="col-12 gap-1 row">
          <label htmlFor="brand" className="font col-4 text-right">
            Brand
          </label>
          <div className="d-flex flex-column col-4">
            <select
              id="brand"
              name="brand"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.brand}
              className="form-control formcontrol"
            >
              <option value="">Select</option>
              {brands?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {formik.touched.brand && formik.errors.brand ? (
              <div className="text-danger font">{formik.errors.brand}</div>
            ) : null}
          </div>
        </div>

        <div className="col-12 gap-1 row">
          <label htmlFor="product" className="font col-4 text-right">
            Product
          </label>
          <div className="d-flex flex-column col-4">
            <select
              id="product"
              name="product"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.product}
              className="form-control formcontrol"
            >
              <option value="">Select</option>
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
              <option value="US Debit">US Debit</option>
            </select>

            {formik.touched.product && formik.errors.product ? (
              <div className="text-danger font">{formik.errors.product}</div>
            ) : null}
          </div>
        </div>

        <div className="col-12 gap-1 row">
          <label htmlFor="featureText" className="font col-4 text-right">
            Feature
          </label>
          <div className="d-flex flex-column col-4">
            <select
              id="featureText"
              name="featureText"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.featureText}
              className="form-control formcontrol"
            >
              <option value="">Select</option>
              <option value="transit">Transit</option>
              <option value="pin_preferred">Pin Preferred</option>
              <option value="signature_preferred">Signature Preferred</option>
              {/* <option value="online_pin">Online pin</option> */}
              {/* <option value="transit_online_pin">Transit online pin</option> */}
            </select>

            {formik.touched.featureText && formik.errors.featureText ? (
              <div className="text-danger font">
                {formik.errors.featureText}
              </div>
            ) : null}
          </div>
        </div>

        {id && (
          <div className="col-12 gap-1 row">
            <label htmlFor="status" className="font col-4 text-right">
              Status
            </label>
            <div className="d-flex flex-column col-4">
              <select
                id="status"
                name="status"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.featureText}
                className="form-control formcontrol"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {formik.touched.featureText && formik.errors.featureText ? (
                <div className="text-danger font">
                  {formik.errors.featureText}
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="col-12 gap-1 row">
          <label htmlFor="profileName" className="font col-4 text-right">
            Profile Name
          </label>
          <div className="d-flex flex-column col-4 font ms-2">
            {profileName}
          </div>
        </div>

        <div className="col-12 gap-1 row">
          <label htmlFor="profileImage" className="font col-4 text-right">
            Profile
          </label>
          <div className="d-flex flex-column col-4">
            <CustomFileUpload
              name="profileImage"
              value={formik.values.profileImage}
              onChange={(name, file) => {
                formik.setFieldValue(name, file);
              }}
              onBlur={formik.handleBlur}
              error={formik.errors.profileImage}
              touched={formik.touched.profileImage}
              className={"w-100"}
            />
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
            disabled={loading}
            type="submit"
            className="btn save-btn w-25 font"
          >
            Save
          </button>
        </div>
      </form>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default AddProfile;
