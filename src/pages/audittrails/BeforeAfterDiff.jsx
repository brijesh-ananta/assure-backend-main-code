import PropTypes from "prop-types";
import { useState } from "react";

const parseIfJson = (input) => {
  if (typeof input !== "string") return input || {};
  try {
    return JSON.parse(input);
  } catch {
    return { message: input };
  }
};

function BeforeAfterDiff({ oldData, newData }) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const oldObj = parseIfJson(oldData);
  const newObj = parseIfJson(newData);

  const keys = Array.from(
    new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  ).filter((k) => k !== "undefined");

  const handleRowClick = (key, oldVal, newVal) => {
    setModalData({ key, oldVal, newVal });
    setShowModal(true);
  };

  return (
    <>
      <table className="table table-bordered border row-border border-3 table-hover">
        <thead className="table-theme theme_noti">
          <tr>
            <th>Field</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            if (key === "password_hash") {
              return null;
            }
            const oldVal = oldObj[key] != null ? oldObj[key].toString() : "";
            const newVal = newObj[key] != null ? newObj[key].toString() : "";
            const changed = oldVal !== newVal;
            const displayOldVal =
              oldVal.length > 50 ? oldVal.substring(0, 50) + " ..." : oldVal;
            const displayNewVal =
              newVal.length > 50 ? newVal.substring(0, 50) + " ..." : newVal;

            return (
              <tr
                key={key}
                onClick={() => handleRowClick(key, oldVal, newVal)}
                className={changed ? "table-warning" : ""}
                style={{ cursor: "pointer" }}
              >
                <td>{key}</td>
                <td className="text-break small" style={{ maxWidth: "300px" }}>
                  {displayOldVal}
                </td>
                <td className="text-break small" style={{ maxWidth: "300px" }}>
                  {displayNewVal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && modalData && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ zIndex: 5 }}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title">Field Details: {modalData.key}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Before:</strong>
                  <div
                    className="border p-2 mt-1 bg-light text-break small font-monospace"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {modalData.oldVal || "N/A"}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>After:</strong>
                  <div
                    className="border p-2 mt-1 bg-light text-break small font-monospace"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {modalData.newVal || "N/A"}
                  </div>
                </div>
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
      )}
    </>
  );
}

BeforeAfterDiff.propTypes = {
  oldData: PropTypes.any,
  newData: PropTypes.any,
};

export default BeforeAfterDiff;
