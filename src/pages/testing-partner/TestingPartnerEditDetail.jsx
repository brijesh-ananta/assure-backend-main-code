/* eslint-disable no-useless-escape */
import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import axiosToken from "../../utils/axiosToken";
import { toast, ToastContainer } from "react-toastify";
import "./TestingPartnerForm.css";
import apiService from "../../services";

const TestingPartnerEditDetail = () => {
  const { id } = useParams();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [partnerData, setPartnerData] = useState({});
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    partner_name: "",
    partner_id: "",
    contact_person: "",
    email: "",
    status: "draft",
  });

  const fetchData = useCallback(async () => {
    try {
      const resp = await apiService.testingPartner.getByID(id);
      setPartnerData(resp?.partner || {});
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [fetchData, id]);

  useEffect(() => {
    if (partnerData) {
      setFormData({
        partner_name: partnerData.partner_name || "",
        partner_id: partnerData.partner_id || "",
        contact_person: partnerData.contact_person || "",
        email: partnerData.email || "",
        status: partnerData.status || "draft",
      });
    }
  }, [partnerData]);

  const handleChange = (e) => {
    if (userRole === 1) {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { partner_id, partner_name, contact_person, email } = formData;

    if (
      !partner_id.trim() ||
      !partner_name.trim() ||
      !contact_person.trim() ||
      !email.trim()
    ) {
      toast.error("All fields are required.");
      return;
    }

    if (!partner_name?.trim()) {
      toast.error("Partner name can not be empty.");
      return;
    }

    if (!contact_person.trim()) {
      toast.error("Contact person name can not be empty..");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const payload = {
        ...formData,
        created_by: user.user_id,
      };
      const response = await axiosToken.put(
        `/partners/${partnerData.pt_id}`,
        payload
      );
      toast.success(response.data.message);
      setEditing(false);
      navigate("/dashboard/testing-partner");
    } catch (err) {
      toast.error(err.response?.data?.error || "An error occurred.");
    }
  };

  const canEdit = useMemo(() => [1, 4].includes(userRole), [userRole]);

  useEffect(() => {
    if (id) {
      params.set("recordId", id);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [id]);

  return (
    <section className="container form-field-wrapper mt-5 pt-5">
      <form
        onSubmit={handleSubmit}
        className="d-flex gap-4 flex-column w-80 m-auto"
      >
        {/* Row 1 */}
        <div className="row">
          <div className="col-6 row align-items-center">
            <label className="font text-right col-5">Partner Name</label>
            <div className="col-7">
              <input
                name="partner_name"
                type="text"
                value={formData.partner_name}
                onChange={handleChange}
                className="form-control formcontrol"
                disabled={!canEdit || !editing}
              />
            </div>
          </div>
          <div className="col-6 row align-items-center">
            <label className="font text-right col-5">Partner ID</label>
            <div className="col-6">
              <input
                name="partner_id"
                type="text"
                readOnly
                disabled
                value={formData.partner_id}
                onChange={handleChange}
                className="form-control formcontrol"
              />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="row">
          <div className="col-6 row align-items-center">
            <label className="font text-right col-5">
              Partner Contact Person
            </label>
            <div className="col-7">
              <input
                name="contact_person"
                type="text"
                value={formData.contact_person}
                onChange={handleChange}
                className="form-control formcontrol"
                disabled={!canEdit || !editing}
              />
            </div>
          </div>
          <div className="col-6 row align-items-center">
            <label className="font col-5 text-right">Email</label>
            <div className="col-7">
              <input
                name="email"
                type="text"
                required={false}
                value={formData.email}
                onChange={handleChange}
                className="form-control formcontrol"
                disabled={!canEdit || !editing}
              />
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="row col-6">
          <label className="col-5 font text-right">Status</label>
          <div className="col-6 d-flex  gap-5">
            {["draft", "active", "inactive"].map((status) => (
              <label key={status} className="tp-radio-label">
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
                  checked={formData.status == status ? true : ""}
                  onChange={handleChange}
                  disabled={!canEdit || !editing}
                />
                <span className="text-capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group justify-content-end">
          <button
            className="btn cancel-btn"
            type="button"
            onClick={() => navigate("/dashboard/testing-partner")}
          >
            {userRole == 1 || userRole == 4 ? "Cancel" : "Close"}
          </button>
          {(userRole == 1 || userRole === 4) &&
            (editing ? (
              <button
                disabled={!canEdit}
                className="btn save-btn"
                type="submit"
              >
                Save
              </button>
            ) : (
              <button
                className="btn save-btn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setEditing(true);
                }}
              >
                Edit
              </button>
            ))}
        </div>
      </form>
      <ToastContainer />
    </section>
  );
};

export default TestingPartnerEditDetail;
