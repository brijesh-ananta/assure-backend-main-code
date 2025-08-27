import { useEffect, useState } from "react";
import "./style.css";
import apiService from "../../../services";
import { toast } from "react-toastify";

const Bundle = () => {
  const [isManaging, setIsManaging] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [addQuantities, setAddQuantities] = useState({});
  const [newBundles, setNewBundles] = useState([{ bundleName: "", count: "" }]);
  const [bundleList, setBundleList] = useState([]);

  const toggleManage = () => {
    setIsManaging((prev) => !prev);
    setAddQuantities({});
    setNewBundles([{ bundleName: "", count: "" }]);
    setIsAddingNew(false);
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
  };

  const handleInputChange = (index, value) => {
    setAddQuantities({
      ...addQuantities,
      [index]: value ? Number(value) : "",
    });
  };

  const handleNewBundleChange = (idx, field, value) => {
    const updated = [...newBundles];
    updated[idx][field] = value;
    setNewBundles(updated);
  };

  const addNewBundleRow = () => {
    setNewBundles([...newBundles, { bundleName: "", count: "" }]);
  };

  const removeNewBundleRow = (idx) => {
    if (newBundles.length === 1) return;
    setNewBundles(newBundles.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const filteredNewBundles = newBundles.filter(
      (b) => b.bundleName.trim() && Number(b.count) > 0
    );
    if (filteredNewBundles.length === 0) {
      toast.error("Please enter data");
      return;
    }

    const validUpdate = Object.values(addQuantities).every(
      (v) => v === "" || (typeof v === "number" && v >= 0)
    );
    if (!validUpdate) {
      toast.error("Invalid quantities for existing bundles!");
      return;
    }

    let updatedBundlesArr = [];
    let updatedBundlesState = bundleList?.map((bundle, index) => {
      const added = Number(addQuantities[index]) || 0;
      if (added > 0) {
        const updated = {
          ...bundle,
          available: bundle.available + added,
          total: bundle.total + added,
        };
        updatedBundlesArr.push(updated);
        return updated;
      }
      return bundle;
    });

    let newBundlesArr = [];
    for (const b of filteredNewBundles) {
      newBundlesArr.push({
        bundleName: b.bundleName,
        available: Number(b.count),
        assigned: 0,
        total: Number(b.count),
      });
      updatedBundlesState.push({
        bundleName: b.bundleName,
        available: Number(b.count),
        assigned: 0,
        total: Number(b.count),
      });
    }

    for (const bundle of newBundlesArr) {
      await apiService.testCardBundles.create({
        bundleName: bundle.bundleName,
        total: bundle.total,
      });
    }
    for (const bundle of updatedBundlesArr) {
      await apiService.testCardBundles.update(bundle.id, {
        bundleName: bundle.bundleName,
        total: bundle.total,
      });
    }

    setBundleList(updatedBundlesState);
    setIsManaging(false);
    setIsAddingNew(false);
    toast.success("Data Updated Successfully");
    fetchBundleList();
  };

  const fetchBundleList = async () => {
    try {
      const response = await apiService.testCardBundles.get();
      setBundleList(response);
    } catch (error) {
      console.error("Error fetching bundle list:", error);
    }
  };

  useEffect(() => {
    fetchBundleList();
  }, []);

  return (
    <div className="container">
      <div className="mb-lg-0 mb-3 py-lg-3 py-2">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-end w-90">
            {!isManaging && (
              <button className="btn save-btn" onClick={toggleManage}>
                Manage Product Bundle
              </button>
            )}
            {isManaging && (
              <button className="btn save-btn ms-2" onClick={startAddingNew}>
                Add New Bundle
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="">
        <table className="table border-b-table text-center form-field-wrapper">
          <thead>
            <tr>
              <th className="text-left">Product Bundle</th>
              <th>Available</th>
              <th>Assigned</th>
              <th>Total</th>
              {isManaging && <th>Update / New</th>}
            </tr>
          </thead>
          <tbody>
            {bundleList?.map((bundle, index) => (
              <tr key={index}>
                <td className="text-left font">{bundle.bundleName}</td>
                <td className="p-3">
                  <span className="bg-green py-2 px-3 rounded font">
                    {bundle?.total - bundle?.assigned}
                  </span>
                </td>
                <td className="font">{bundle.assigned || 0}</td>
                <td className="font">{bundle.total}</td>
                {isManaging && (
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="form-control w-50 m-auto"
                      value={addQuantities[index] || ""}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                  </td>
                )}
              </tr>
            ))}

            {isManaging &&
              isAddingNew &&
              newBundles?.map((b, idx) => (
                <tr key={`new-${idx}`}>
                  <td>
                    <input
                      type="text"
                      placeholder="Enter New Bundle Name"
                      className="form-control"
                      value={b.bundleName}
                      onChange={(e) =>
                        handleNewBundleChange(idx, "bundleName", e.target.value)
                      }
                      required={b.bundleName.length === 0}
                    />
                  </td>
                  <td>
                    <span className="bg-green py-2 px-3 rounded">0</span>
                  </td>
                  <td>0</td>
                  <td>0</td>
                  <td>
                    <div className="d-flex gap-3 align-items-center justify-content-center">
                      <input
                        type="number"
                        min="1"
                        className="form-control w-25"
                        value={b.count}
                        onChange={(e) =>
                          handleNewBundleChange(idx, "count", e.target.value)
                        }
                        required={b.count.length === 0}
                      />
                      <button
                        type="button"
                        className="btn save-btn p-3"
                        onClick={addNewBundleRow}
                      >
                        +
                      </button>
                      {newBundles.length > 1 && (
                        <button
                          type="button"
                          className="btn cancel-btn p-3"
                          onClick={() => removeNewBundleRow(idx)}
                        >
                          -
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {isManaging && (
          <div className="d-flex justify-content-end gap-3">
            <button className="btn cancel-btn" onClick={toggleManage}>
              Cancel
            </button>
            <button className="btn save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bundle;
