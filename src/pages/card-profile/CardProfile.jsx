import { useFormik } from "formik";
import CustomTable from "../../components/shared/table/CustomTable";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import apiService from "../../services";
import { useCallback, useEffect, useState } from "react";
import { formatDateToLocal } from "../../utils/date";
import binService from "../../services/bin";

const CardProfile = () => {
  const [data, setData] = useState([]);
  const [params] = useSearchParams();
  const envFromQuery = params.get("environment");
  const [issuers, setIssuers] = useState([]);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      status: "",
      featureText: "",
    },
    onSubmit: () => {},
  });

  const fetchIssuers = useCallback(async () => {
    try {
      const data = await binService.getIssuerList(envFromQuery, "Pos");

      setIssuers(data);
    } catch (error) {
      console.error(error);
    }
  }, [envFromQuery]);

  useEffect(() => {
    if (envFromQuery) {
      fetchIssuers();
    }
  }, [fetchIssuers, envFromQuery]);

  const fetchData = useCallback(async (filters = {}) => {
    try {
      const resp = await apiService.cardProfile.get(filters);
      setData(resp.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const filters = {};
    if (formik.values.issuerName) filters.issuer_id = formik.values.issuerName;
    if (formik.values.status) filters.status = formik.values.status;
    if (formik.values.featureText)
      filters.card_feature = formik.values.featureText;
    filters.limit = "-1";

    if (envFromQuery) {
      filters.environment_id = envFromQuery;
    }

    fetchData(filters);
  }, [
    formik.values.issuerName,
    formik.values.status,
    formik.values.featureText,
    fetchData,
    envFromQuery,
  ]);

  return (
    <div>
      <div className="container">
        <form
          onSubmit={formik.handleSubmit}
          className="form-field-wrapper row gap-3"
        >
          <div className="col-6 row gap-1 align-items-center">
            <label htmlFor="name" className="col-3 no-wrap font text-right">
              Issuer Name
            </label>
            <div className="d-flex flex-column col-8">
              <select
                id="issuerName"
                name="issuerName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.issuerName}
                className="form-control formcontrol"
              >
                <option value="">Select Status</option>
                {issuers.map((issuer) => (
                  <option
                    key={issuer.id}
                    value={issuer.id || issuer?.issuer_id}
                  >
                    {issuer?.issuer_name || ""}
                  </option>
                ))}
              </select>
              {formik.touched.name && formik.errors.name ? (
                <div className="text-danger font">{formik.errors.name}</div>
              ) : null}
            </div>
          </div>

          <div className="col-6 row gap-1 align-items-center">
            <label htmlFor="status" className="font col-3 text-right">
              Status
            </label>
            <div className="d-flex flex-column col-8">
              <select
                id="status"
                name="status"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.status}
                className="form-control formcontrol"
              >
                <option value="">Select Status</option>
                <option value="testing">testing</option>
                <option value="submitted">submitted</option>
                <option value="approved">approved</option>
                <option value="rejected">rejected</option>
                <option value="testing_card_assigned">
                  Testing Card Assigned
                </option>
              </select>
              {formik.touched.status && formik.errors.status ? (
                <div className="text-danger font">{formik.errors.status}</div>
              ) : null}
            </div>
          </div>

          <div className="col-6 row gap-1 align-items-center">
            <label htmlFor="featureText" className="font col-3 text-right">
              Feature
            </label>
            <div className="d-flex flex-column col-8">
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
                <option value="online_pin">Online pin</option>
                <option value="transit_online_pin">Transit online pin</option>
                <option value="generic">Generic</option>
              </select>
              {formik.touched.featureText && formik.errors.featureText ? (
                <div className="text-danger font">
                  {formik.errors.featureText}
                </div>
              ) : null}
            </div>
          </div>
          {/* 
          {userType == 6 && (
            <div className="col-6">
              <div className="w-100 d-flex align-items-center justify-content-center">
                <SmartLink
                  to="add"
                  className="btn save-btn w-50 font"
                  key={location.search}
                >
                  Add New Profile
                </SmartLink>
              </div>
            </div>
          )} */}
        </form>
      </div>

      <div className="border border-2 border-black rounded-3 mt-4 ">
        <CustomTable
          data={data}
          columns={[
            {
              key: "profile_id",
              label: "Profile ID",
              sortable: true,
              renderCell: (item) => (
                <Link to={`/dashboard/card-profile/view/${item.id}`}>
                  {item.profile_id}
                </Link>
              ),
            },
            {
              key: "status",
              label: "Status",
              sortable: true,
            },
            {
              key: "profile_name",
              label: "Profile Name",
              cellStyle: {
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "no",
              },
              renderCell: (item) => (
                <span className="text-4 underline fa-1x">
                  {item.profile_name}
                </span>
              ),
            },
            {
              key: "issuer_name",
              label: "Issuer Name",
              sortable: true,
            },
            {
              key: "product",
              label: "Product",
              sortable: true,
            },
            {
              key: "card_feature",
              label: "Feature",
              sortable: true,
            },
            {
              key: "lastChanged",
              label: "Last Changed",
              renderCell: (item) => {
                return formatDateToLocal(item.updated_at) || "";
              },
            },
            {
              key: "version",
              label: "V",
              sortable: true,
              renderCell: () => {
                return "0.4";
              },
              hide: true,
            },
          ]}
          totalItems={10}
          isServerSide={false}
          tableClass="striped-table"
          expandable={false}
          emptyState={"Data not found"}
          onRowClick={(item) => {
            navigate(`/dashboard/card-profile/view/${item.id}`);
          }}
        />
      </div>
    </div>
  );
};

export default CardProfile;
