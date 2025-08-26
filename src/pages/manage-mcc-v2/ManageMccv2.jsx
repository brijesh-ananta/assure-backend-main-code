import { useCallback, useEffect, useState } from "react";
import "./managemcc.css";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-toastify";
import apiService from "../../services";
import TextLoader from "../../components/shared/loader/TextLoader";
import Select from "react-dropdown-select";
import { useNavigate } from "react-router-dom";

const ManageMccv2 = () => {
  const [env, setEnv] = useState("1");
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const [mccsData, setMccsData] = useState([]);
  const [brands, setBrands] = useState([]);

  const [newMccs, setNewMccs] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [errors, setErrors] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [dataFetching, setDataFetching] = useState(false);
  const [brandsDataFetching, setBrandsDataFetching] = useState(false);
  const [dataAdding, setDataAdding] = useState(false);

  const fetchData = useCallback(async () => {
    setDataFetching(true);
    try {
      const response = await apiService.mccCode.get({ env });
      if (response?.data.length) {
        setMccsData(response?.data);
      } else {
        setMccsData([]);
      }
      setDataFetching(false);
    } catch (error) {
      setDataFetching(false);
      console.error(error);
    }
  }, [env]);

  const fetchBrandsData = useCallback(async () => {
    setBrandsDataFetching(true);
    try {
      const response = await apiService.brands.get({ env });

      if (response?.data.length) {
        setBrands(response?.data);
      } else {
        setBrands([]);
      }
      setBrandsDataFetching(false);
    } catch (error) {
      setBrandsDataFetching(false);
      console.error(error);
    }
  }, [env]);

  useEffect(() => {
    fetchData();
  }, [fetchData, env]);

  useEffect(() => {
    fetchBrandsData();
  }, [fetchBrandsData, env]);

  const handleEnvironmentChange = (e) => {
    setEnv(e.target.value);
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setNewMccs((prev) => [
      ...prev,
      {
        mcc_code: "",
        description: "",
        brands: "",
      },
    ]);
    setErrors((prev) => [...prev, {}]);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...newMccs];
    updated[index][field] = value;
    setNewMccs(updated);
    validateField(index, field, value);
  };

  const validateField = (index, field, value) => {
    let error = "";

    if (field === "mcc_code" && `${value.trim()}`.length !== 4) {
      error = "MCC Code must be exactly 4 characters.";
    }

    if (field === "description" && value.trim().length === 0) {
      error = "Description is required.";
    }

    if (field === "brands" && (!value || value.length === 0)) {
      error = "At least one brand must be selected.";
    }

    const updatedErrors = [...errors];
    updatedErrors[index] = {
      ...updatedErrors[index],
      [field]: error,
    };
    setErrors(updatedErrors); // ✅ keeps errors as array
    return error;
  };

  const handleSave = async () => {
    const tempErrors = [...errors];

    newMccs.forEach((row, index) => {
      const rowErrors = {};

      if (!row.mcc_code || `${row.mcc_code}`.length !== 4) {
        rowErrors.mcc_code = "MCC Code must be exactly 4 characters.";
      }

      if (!row.description || row.description.trim().length === 0) {
        rowErrors.description = "Description is required.";
      }

      if (!row.brands || row.brands.length === 0) {
        rowErrors.brands = "At least one brand must be selected.";
      }

      tempErrors[index] = rowErrors;
    });

    setErrors(tempErrors);

    const hasErrors = tempErrors.some((err) =>
      Object.values(err).some((e) => !!e)
    );
    if (hasErrors) {
      toast.error("Fix validation errors before saving.");
      return;
    }

    const successfulIndexes = [];

    try {
      setDataAdding(true);
      for (let i = 0; i < newMccs.length; i++) {
        const row = newMccs[i];
        const payload = {
          mcc_code: `${row.mcc_code}`.trim(),
          description: row.description.trim(),
          brands: row.brands.map((b) => `${b.id || b}`),
          environment: parseInt(env),
        };

        try {
          const data = await apiService.mccCode.create(payload);

          if (data?.data && data?.data !== 0) {
            successfulIndexes.push(i);
          }
        } catch (e) {
          if (e?.response?.status === 409) {
            toast.error(`Conflict on row ${i + 1}: MCC already exists.`);
          } else {
            toast.error(`Row ${i + 1} failed: ${e.message}`);
          }
        } finally {
          setDataAdding(false);
        }
      }

      if (successfulIndexes.length === newMccs.length) {
        toast.success("All MCCs saved!");
        setIsAddingNew(false);
      } else if (successfulIndexes.length > 0) {
        toast.success(
          `${successfulIndexes.length} row(s) saved. Fix remaining.`
        );
      }

      setNewMccs(newMccs.filter((_, i) => !successfulIndexes.includes(i)));
      setErrors(errors.filter((_, i) => !successfulIndexes.includes(i)));

      fetchData();
    } catch (err) {
      toast.error(err?.message || "Unexpected error during save.");
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setNewMccs([]);
  };

  const isSaveDisabled = () => {
    if (dataAdding || !newMccs.length) return true;

    const hasEmptyFields = newMccs.some(
      (row) =>
        !row.mcc_code.trim() || !row.description.trim() || !row.brands.length
    );

    const hasErrors = errors.some((errObj) =>
      Object.values(errObj || {}).some((msg) => !!msg)
    );

    return hasEmptyFields || hasErrors;
  };

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="d-lg-flex align-items-start justify-content-start container w-100">
          <div className="d-lg-flex formcard card-custom-shadow-1 custom-bg-to-left p-2 rounded-3">
            <span className="me-lg-5 font">Environment</span>
            <div className="d-lg-flex formcard">
              <div className="form-check me-3 d-flex gap-4 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"1"}
                  id="flexRadioDefault1"
                  checked={env === "1"}
                  onChange={handleEnvironmentChange}
                  disabled={userRole !== 1}
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check d-flex gap-4 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  id="flexRadioDefault2"
                  value="2"
                  checked={env === "2"}
                  onChange={handleEnvironmentChange}
                  disabled={userRole !== 1}
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="mb-lg-0 mb-3 py-lg-3 py-2">
          <div className="container-fluid">
            <div className="d-lg-flex align-items-center justify-content-end w-90">
              <button className="btn save-btn ms-2" onClick={startAddingNew}>
                Add MCC
              </button>
            </div>
          </div>
        </div>

        {((!dataFetching && !brandsDataFetching && mccsData?.length) ||
          isAddingNew) && (
          <table className="table border-b-table text-center form-field-wrapper">
            <thead>
              <tr>
                <th className="text-left">MCC Code</th>
                <th>Description</th>
                <th>Brands</th>
              </tr>
            </thead>
            <tbody>
              {mccsData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => {
                    const mappedBrands = item?.brands
                      ?.map((id) =>
                        brands.find((b) => b.id === id || b.id === parseInt(id))
                      )
                      .filter(Boolean);

                    setModalData({
                      mcc_code: item.mcc_code,
                      description: item.description,
                      brands: mappedBrands.map((b) => b.name),
                    });
                    setShowModal(true);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td className="text-left">{item.mcc_code}</td>
                  <td className="text-center">
                    {item.description.length > 60 ? (
                      <span
                        title={item.description}
                        style={{ cursor: "pointer" }}
                      >
                        {item.description.slice(0, 60)}...
                      </span>
                    ) : (
                      item.description
                    )}
                  </td>

                  <td className="text-center">
                    {(() => {
                      const matchedBrands = item.brands
                        .map((id) =>
                          brands.find(
                            (b) => b.id === id || b.id === parseInt(id)
                          )
                        )
                        .filter(Boolean);

                      const visible = matchedBrands
                        .slice(0, 2)
                        .map((b) => b.name)
                        .join(", ");
                      const hiddenCount = matchedBrands.length - 2;

                      return (
                        <span
                          title={matchedBrands.map((b) => b.name).join(", ")}
                          style={{ cursor: "pointer" }}
                        >
                          {visible}
                          <span className="text-1">
                            {hiddenCount > 0 && ` +${hiddenCount} more`}
                          </span>
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}

              {isAddingNew &&
                newMccs.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex gap-2 flex-column ">
                        <input
                          type="text"
                          placeholder="MCC Code (4 digits)"
                          maxLength={4}
                          className="form-control formcontrol"
                          name="mcc_code"
                          value={newMccs[index].mcc_code}
                          onChange={(e) =>
                            handleInputChange(index, "mcc_code", e.target.value)
                          }
                          onBlur={(e) =>
                            validateField(index, "mcc_code", e.target.value)
                          }
                        />

                        {errors[index]?.mcc_code && (
                          <div className="text-danger">
                            {errors[index].mcc_code}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-column ">
                        <input
                          type="text"
                          placeholder="Description"
                          className="form-control formcontrol"
                          name="description"
                          value={newMccs[index].description}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          onBlur={(e) =>
                            validateField(index, "description", e.target.value)
                          }
                        />
                        {errors[index]?.description && (
                          <div className="text-danger">
                            {errors[index].description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-column align-items-center justify-content-center ">
                        <Select
                          options={brands}
                          labelField="name"
                          valueField="id"
                          className="form-control formcontrol max-w-240"
                          style={{ padding: "0.5rem" }}
                          optionRenderer={(a) => <span className="text-black">{a.item.name},</span>}
                          searchable
                          multi
                          name="brands"
                          placeholder="Select Brands"
                          onChange={(val) =>
                            handleInputChange(index, "brands", val)
                          }
                          values={newMccs[index].brands || []}
                        />
                        {errors[index].brands && (
                          <div className="text-danger">
                            {errors[index].brands}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {(dataFetching || brandsDataFetching) && <TextLoader />}

        {!dataFetching &&
          !brandsDataFetching &&
          !mccsData?.length &&
          !isAddingNew && (
            <h2 className="d-flex align-items-center justify-content-center p-4">
              Data not found.
            </h2>
          )}

        <div className="d-flex justify-content-end gap-3">
          <button
            disabled={dataAdding || dataFetching}
            className="btn cancel-btn"
            onClick={() => {
              if (isAddingNew) {
                handleCancel();
              } else {
                navigate("/dashboard/system-defaults-v2");
              }
            }}
          >
            Cancel
          </button>
          {isAddingNew && (
            <button
              disabled={
                dataAdding ||
                brandsDataFetching ||
                dataFetching ||
                isSaveDisabled()
              }
              className="btn save-btn"
              onClick={handleSave}
            >
              Save
            </button>
          )}
        </div>
      </div>

      {showModal && modalData && (
        <div className="show" style={{ zIndex: 5 }}>
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div
              className="modal-dialog"
              style={{
                height: "90%",
                maxHeight: "90%",
                overflow: "auto",
              }}
              role="document"
            >
              <div className="modal-content" style={{ zIndex: 999 }}>
                <div className="modal-header d-flex justify-content-between">
                  <h5 className="modal-title">
                    MCC Code: {modalData.mcc_code}
                  </h5>
                  <button
                    type="button"
                    className="btn cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Description:</strong>
                  </p>
                  <p>{modalData.description}</p>
                  <hr />
                  <p>
                    <strong>Brands:</strong>
                  </p>
                  <ul>
                    {modalData.brands.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageMccv2;
