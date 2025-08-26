import React, { useState, useEffect } from "react";
import axiosToken from "../../utils/axiosToken";

function AddTestBundle() {
  const [bundleName, setBundleName] = useState("");
  const [total, setTotal] = useState("");
  const [bundleList, setBundleList] = useState([]);

  // State for update modal
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [updateBundleName, setUpdateBundleName] = useState("");
  const [updateTotal, setUpdateTotal] = useState("");

  // Fetch bundle list on mount
  useEffect(() => {
    const fetchBundleList = async () => {
      try {
        const response = await axiosToken.get("/test-card-bundles");
        const bundleList = response.data;
        setBundleList(bundleList);
      } catch (error) {
        console.error("Error fetching bundle list:", error);
      }
    };
    fetchBundleList();
  }, []);

  // Show Add Bundle Modal
  const handleAddTestCard = () => {
    const confirmModalEl = document.getElementById("confirmModal");
    if (confirmModalEl) {
      const confirmModal = new window.bootstrap.Modal(confirmModalEl);
      confirmModal.show();
    }
  };

  // Submit handler for adding a bundle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bundleName || !total) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const formData = { bundleName, total };
      const response = await axiosToken.post(`/test-card-bundles`, formData);
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Error adding bundle:", error);
      alert(
        (error.response && error.response.data && error.response.data.error) ||
          error.message ||
          "An error occurred."
      );
    }
  };

  // Show Update Modal with prefilled data
  const handleUpdateBundle = (bundle) => {
    setSelectedBundle(bundle);
    setUpdateBundleName(bundle.bundleName);
    setUpdateTotal(bundle.total);
    const updateModalEl = document.getElementById("updateModal");
    if (updateModalEl) {
      const updateModal = new window.bootstrap.Modal(updateModalEl);
      updateModal.show();
    }
  };

  // Submit handler for updating a bundle
  const handleUpdateSubmit = async () => {
    if (!updateBundleName || !updateTotal) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const formData = { bundleName: updateBundleName, total: updateTotal };
      // Assuming your update endpoint accepts PUT or PATCH to /test-card-bundles/:id
      const response = await axiosToken.put(
        `/test-card-bundles/${selectedBundle.id}`,
        formData
      );
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Error updating bundle:", error);
      alert(
        (error.response && error.response.data && error.response.data.error) ||
          error.message ||
          "An error occurred."
      );
    }
  };

  return (
    <>
      <div className="mb-lg-0 mb-2">
        <a
          className="btn-add py-2 ms-auto ws100"
          href="#"
          onClick={handleAddTestCard}
        >
          Add Bundle
        </a>
      </div>
      <table className="table table-bordered mt-3">
        <thead className="table-theme">
          <tr>
            <th className="w500" scope="col"></th>
            <th className="bggray text-center" scope="col" colSpan="4">
              <span className="tabletext">POS Test Cards</span>
            </th>
          </tr>
          <tr>
            <th className="w500" scope="col">
              Product Bundle
            </th>
            <th className="bggray" scope="col">
              Available
            </th>
            <th className="bggray" scope="col">
              Assigned
            </th>
            <th className="bggray" scope="col">
              Total
            </th>
            <th scope="col" className="bggray"></th>
          </tr>
        </thead>
        <tbody>
          {bundleList && bundleList.length > 0 ? (
            bundleList.map((bundle) => (
              <tr key={bundle.id}>
                <td>{bundle.bundleName}</td>
                <td className="bggray">
                  <span className="addgreen">
                    {bundle.total - bundle.assigned}
                  </span>
                </td>
                <td className="bggray">{bundle.assigned || "00"}</td>
                <td className="bggray">{bundle.total}</td>
                <td className="bggray">
                  <div className="">
                    <a
                      className="btn-add py-2 ms-auto ws100"
                      href="#"
                      onClick={() => handleUpdateBundle(bundle)}
                    >
                      Update bundle
                    </a>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}> No bundle found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Bundle Modal */}
      <div
        className="modal fade"
        id="confirmModal"
        tabIndex="-1"
        aria-labelledby="confirmModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-0 shadow-xl">
            <div className="modal-header header-color rounded-0">
              <h5 className="modal-title text-white" id="confirmModalLabel">
                Add Card Bundle
              </h5>
              <button
                type="button"
                className="btn-close text-white btnclose"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="bundleName" className="form-label">
                  Bundle Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="bundleName"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                  placeholder="Enter bundle name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="total" className="form-label">
                  Total
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="total"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="Enter total"
                />
              </div>
              <p>
                Are you sure you want to add a Card Bundle with these details?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btncolor"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btncolor btnyellow"
                onClick={handleSubmit}
              >
                Confirm New Bundle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Bundle Modal */}
      <div
        className="modal fade"
        id="updateModal"
        tabIndex="-1"
        aria-labelledby="updateModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-0 shadow-xl">
            <div className="modal-header header-color rounded-0">
              <h5 className="modal-title text-white" id="updateModalLabel">
                Update Card Bundle
              </h5>
              <button
                type="button"
                className="btn-close text-white btnclose"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Prefilled update form */}
              <div className="mb-3">
                <label htmlFor="updateBundleName" className="form-label">
                  Bundle Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="updateBundleName"
                  value={updateBundleName}
                  onChange={(e) => setUpdateBundleName(e.target.value)}
                  placeholder="Enter bundle name"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="updateTotal" className="form-label">
                  Total
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="updateTotal"
                  value={updateTotal}
                  onChange={(e) => setUpdateTotal(e.target.value)}
                  placeholder="Enter total"
                />
              </div>
              <p>
                Are you sure you want to update this Card Bundle with the above details?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btncolor"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btncolor btnyellow"
                onClick={handleUpdateSubmit}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddTestBundle;
