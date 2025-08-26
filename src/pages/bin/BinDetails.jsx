import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import binService from "../../services/bin";
import Footer from "../../common/Footer";

const BinDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [binData, setBinData] = useState(null);

  useEffect(() => {
    const fetchBinData = async () => {
      try {
        const data = await binService.getBinById(id);
        setBinData(data.data);
      } catch (e) {
        setBinData(null);
      }
    };
    fetchBinData();
     if (id) {
        const params = new URLSearchParams(location.search);
        params.set("recordId", id);
        navigate({ search: params.toString() }, { replace: true });
    }
  }, [id]);

  if (!binData) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-evenly w-100">
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
              <span className="me-3 font">Environment</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"1"}
                  checked={binData.environment === "1"}
                  disabled
                  id="flexRadioDefault1"
                />
                <label style={{ marginBottom: 0 }} className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"2"}
                  checked={binData.environment === "2"}
                  disabled
                  id="flexRadioDefault2"
                />
                <label style={{ marginBottom: 0 }} className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
            </div>
            <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3 ms-3">
              <span className="me-3 font">Card Type</span>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="cardType"
                  value={"Pos"}
                  checked={binData.card_type === "Pos"}
                  disabled
                  id="cardType1"
                />
                <label style={{ marginBottom: 0 }} className="form-check-label" htmlFor="cardType1">
                  POS
                </label>
              </div>
              <div className="form-check d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="cardType"
                  value={"Ecomm"}
                  checked={binData.card_type === "Ecomm"}
                  disabled
                  id="cardType2"
                />
                <label style={{ marginBottom: 0 }} className="form-check-label" htmlFor="cardType2">
                  Ecomm
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="form-field-wrapper form-container">
        <div className="row">
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Issuer Name</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.issuer_name}</p>
            </div>
          </div>

          
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Issuer ID</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.issuer_unique_id}</p>
            </div>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">IISC</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.iisc}</p>
            </div>
          </div>
          
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Issuer Code</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.issuer_code}</p>
            </div>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Issuer Status</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.status}</p>
            </div>
          </div>
          
          


          <div className="col-6 row align-items-center mb-3">
            {/* blank */}
          </div>
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Bin</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.bin}</p>
            </div>
          </div>

          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Bin ID</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.bin_unique_id}</p>
            </div>
          </div>
          
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Card Type</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.card_type}</p>
            </div>
          </div>
          <div className="col-6 row align-items-center mb-3">
            {/* blank */}
          </div>
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Bin Product</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.bin_product}</p>
            </div>
          </div>
          <div className="col-6 row align-items-center mb-3">
            {/* blank */}
          </div>
          <div className="col-6 row align-items-center mb-3">
            <p className="font col-4 pe-4 text-right m-0">Pan Length</p>
            <div className="col-5 p-0">
              <p className="form-control-plaintext mb-0">{binData.pan_length}</p>
            </div>
          </div>
          
          {/* Bin Status - full row */}
          <div className="col-6 row align-items-center mb-3">
            {/* blank */}
          </div>
          <div className="row col-6 row align-items-center mb-3 ">
            <label className="col-4 font pe-4 text-right">Bin Status</label>
            <div className="radio-group col-8">
              {[
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ].map((status) => (
                <label
                  style={{
                    marginBottom: 0,
                    gap: "0.1rem",
                    marginRight: "4rem",
                  }}
                  key={status.value}
                  className="radio-label"
                >
                  <input
                    className="form-check-input"
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={(binData.bin_status || "active") === status.value}
                    disabled
                    style={{
                      marginTop: 0,
                      width: "1.3rem",
                      height: "1.3rem",
                      marginRight: "10px",
                    }}
                  />
                  <span>{status.label}</span>
                </label>
              ))}
            </div>
            </div>
         
          <div className="col-12 row align-items-center mb-3 mt-4">
            <div className="col-12 p-0 d-flex justify-content-end form-actions">
              <button
                type="button"
                className="btn save-btn"
                onClick={() => navigate(`/dashboard/bin-list/update/${id}`)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => navigate("/dashboard/bin-list")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </section>
      
    </>
  );
};

export default BinDetails;
