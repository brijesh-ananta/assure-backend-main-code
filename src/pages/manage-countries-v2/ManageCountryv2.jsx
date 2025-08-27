import { useCallback, useEffect, useState } from "react";
import "./managecountry.css";
import { useAuth } from "../../utils/AuthContext";
import { toast } from "react-toastify";
import apiService from "../../services";
import TextLoader from "../../components/shared/loader/TextLoader";
import { useNavigate } from "react-router-dom";

const ManageCountryv2 = () => {
  const navigate = useNavigate();

  const [env, setEnv] = useState("1");
  const { userRole } = useAuth();
  const [countries, setCountries] = useState();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCountries, setNewCountries] = useState([]);
  const [errors, setErrors] = useState([]);

  const [dataFetching, setDataFetching] = useState(false);
  const [dataAdding, setDataAdding] = useState(false);

  const fetchData = useCallback(async () => {
    setDataFetching(true);
    try {
      const response = await apiService.countries.get({ env });

      if (response?.data.length) {
        setCountries(response?.data);
      } else {
        setCountries([]);
      }
      setDataFetching(false);
    } catch (error) {
      setDataFetching(false);
      console.error(error);
    }
  }, [env]);

  useEffect(() => {
    fetchData();
  }, [fetchData, env]);

  const validateField = (index, field, value) => {
    let error = "";

    if (field === "country_name" && !/^[A-Za-z\s]+$/.test(value)) {
      error = "Only alphabets allowed.";
    }
    if (field === "alpha2_code" && !/^[A-Za-z]{2}$/.test(value)) {
      error = "Must be 2 letters.";
    }
    if (field === "alpha3_code" && !/^[A-Za-z]{3}$/.test(value)) {
      error = "Must be 3 letters.";
    }
    if (field === "numeric_code" && !/^\d{1,3}$/.test(value)) {
      error = "Max 3 digits.";
    }

    const updatedErrors = [...errors];
    updatedErrors[index] = {
      ...updatedErrors[index],
      [field]: error,
    };
    setErrors(updatedErrors);
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setNewCountries((prev) => [
      ...prev,
      {
        country_name: "",
        alpha2_code: "",
        alpha3_code: "",
        numeric_code: "",
      },
    ]);
    setErrors((prev) => [...prev, {}]);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...newCountries];
    updated[index][field] = value;
    setNewCountries(updated);
    validateField(index, field, value);
  };

  const handleEnvironmentChange = (e) => {
    setEnv(e.target.value);
  };

  const handleSave = async () => {
    const tempErrors = [...errors];

    newCountries.forEach((row, index) => {
      Object.keys(row).forEach((field) => {
        const value = row[field];
        let error = "";

        if (field === "country_name" && !/^[A-Za-z\s]+$/.test(value)) {
          error = "Only alphabets allowed.";
        }
        if (field === "alpha2_code" && !/^[A-Za-z]{2}$/.test(value)) {
          error = "Must be 2 letters.";
        }
        if (field === "alpha3_code" && !/^[A-Za-z]{3}$/.test(value)) {
          error = "Must be 3 letters.";
        }
        if (field === "numeric_code" && !/^\d{1,3}$/.test(value)) {
          error = "Max 3 digits.";
        }

        tempErrors[index] = {
          ...tempErrors[index],
          [field]: error,
        };
      });
    });

    setErrors(tempErrors);

    const hasErrors = tempErrors.some((err) =>
      Object.values(err).some((e) => !!e)
    );
    if (hasErrors) {
      toast.error("Fix validation errors before saving.");
      return;
    }

    setDataAdding(true);
    const successfulIndexes = [];

    try {
      for (let i = 0; i < newCountries?.length; i++) {
        const country = newCountries[i];
        const payload = {
          country_name: country.country_name.trim(),
          alpha_2_code: country.alpha2_code.toUpperCase(),
          alpha_3_code: country.alpha3_code.toUpperCase(),
          numeric_code: country.numeric_code,
          environment: env,
        };

        try {
          const data = await apiService.countries.create(payload);

          if (data?.data && data?.data !== 0) {
            successfulIndexes.push(i);
          }
        } catch (e) {
          if (
            e?.response?.status === 409 ||
            e?.message?.includes("already exists")
          ) {
            toast.error(`Conflict on row ${i + 1}: Country already exists.`);
          } else {
            toast.error(
              `Failed to add country ${i + 1}: ${e.message || "Unknown error"}`
            );
          }
        }
      }

      if (successfulIndexes?.length === newCountries?.length) {
        toast.success("All countries saved!");
        setIsAddingNew(false);
      } else if (successfulIndexes.length > 0) {
        toast.success(
          `${successfulIndexes.length} country saved. Fix remaining.`
        );
      }

      const remainingRows = newCountries.filter(
        (_, i) => !successfulIndexes.includes(i)
      );
      const remainingErrors = errors.filter(
        (_, i) => !successfulIndexes.includes(i)
      );

      setNewCountries(remainingRows);
      setErrors(remainingErrors);

      fetchData();
    } catch (err) {
      toast.error(err?.message || "Unexpected error during save.");
    } finally {
      setDataAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setNewCountries([]);
  };

  const isSaveDisabled = () => {
    if (dataAdding || !newCountries.length) return true;

    const hasEmptyFields = newCountries.some(
      (row) =>
        !row.country_name.trim() ||
        !row.alpha2_code.trim() ||
        !row.alpha3_code.trim() ||
        !row.numeric_code.trim()
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
              <button
                disabled={dataAdding || dataFetching}
                className="btn save-btn ms-2"
                onClick={startAddingNew}
              >
                Add Country
              </button>
            </div>
          </div>
        </div>

        <div className="">
          {((!dataFetching && countries?.length) || isAddingNew) > 0 && (
            <table className="table border-b-table text-center form-field-wrapper">
              <thead>
                <tr>
                  <th className="text-left">Country Name</th>
                  <th>Alpha-2 code</th>
                  <th>Alpha-3 code</th>
                  <th>Numeric</th>
                </tr>
              </thead>
              <tbody>
                {countries?.map((bundle, index) => (
                  <tr key={index}>
                    <td className="text-left font">{bundle.country_name}</td>
                    <td className="p-3">{bundle.alpha_2_code}</td>
                    <td className="font">{bundle.alpha_3_code}</td>
                    <td className="font">{bundle.formatted_numeric_code}</td>
                  </tr>
                ))}

                {isAddingNew &&
                  newCountries.map((row, index) => (
                    <tr className="request-form" key={index}>
                      <td>
                        <div className="d-flex gap-2 flex-column ">
                          <input
                            type="text"
                            placeholder="Country Name"
                            className={`form-control formcontrol ${
                              errors[index]?.country_name ? "is-invalid" : ""
                            }`}
                            value={row.country_name}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "country_name",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              validateField(
                                index,
                                "country_name",
                                e.target.value
                              )
                            }
                          />
                          {errors[index]?.country_name && (
                            <div className="text-danger">
                              {errors[index].country_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-column ">
                          <input
                            type="text"
                            placeholder="Alpha-2"
                            maxLength={2}
                            className={`form-control formcontrol ${
                              errors[index]?.alpha2_code ? "is-invalid" : ""
                            }`}
                            value={row.alpha2_code}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "alpha2_code",
                                e.target.value.toUpperCase()
                              )
                            }
                            onBlur={(e) =>
                              validateField(
                                index,
                                "alpha2_code",
                                e.target.value
                              )
                            }
                          />
                          {errors[index]?.alpha2_code && (
                            <div className="text-danger">
                              {errors[index].alpha2_code}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-column ">
                          <input
                            type="text"
                            placeholder="Alpha-3"
                            maxLength={3}
                            value={row.alpha3_code}
                            className={`form-control formcontrol ${
                              errors[index]?.alpha3_code ? "is-invalid" : ""
                            }`}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "alpha3_code",
                                e.target.value.toUpperCase()
                              )
                            }
                            onBlur={(e) =>
                              validateField(
                                index,
                                "alpha3_code",
                                e.target.value
                              )
                            }
                          />
                          {errors[index]?.alpha3_code && (
                            <div className="text-danger">
                              {errors[index].alpha3_code}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 flex-column ">
                          <input
                            type="number"
                            placeholder="Numeric (3 digits)"
                            className={`form-control formcontrol ${
                              errors[index]?.numeric_code ? "is-invalid" : ""
                            }`}
                            maxLength={5}
                            value={row.numeric_code}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "numeric_code",
                                e.target.value.toUpperCase()
                              )
                            }
                            onBlur={(e) =>
                              validateField(
                                index,
                                "numeric_code",
                                e.target.value
                              )
                            }
                          />
                          {errors[index]?.numeric_code && (
                            <div className="text-danger">
                              {errors[index].numeric_code}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {dataFetching && <TextLoader />}

          {!dataFetching && !countries?.length && !isAddingNew && (
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
                disabled={dataAdding || dataFetching || isSaveDisabled()}
                className="btn save-btn"
                onClick={handleSave}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageCountryv2;
