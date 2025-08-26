import PropTypes from "prop-types";
import { useRef } from "react";

const CustomFileUpload = ({
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  buttonText = "Upload New Profile",
  className = "",
  accept = "application/xml"
}) => {
  const inputRef = useRef();

  const handleClick = () => inputRef.current.click();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(name, e.target.files[0]);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={className}
        style={{
          background: "#e3f2fa",
          border: "2px solid #000",
          borderRadius: "10px",
          padding: "5px",
          boxShadow: "2px 2px 6px #999",
          fontStyle: "italic",
          fontWeight: "bold",
          fontSize: "1em",
          cursor: "pointer",
        }}
      >
        {buttonText}
      </button>
      <input
        type="file"
        accept={accept}
        ref={inputRef}
        onChange={handleFileChange}
        onBlur={onBlur}
        style={{ display: "none" }}
      />
      {value && typeof value === "object" && (
        <div style={{ marginTop: 8 }} className="no-wrap">
          <b>Uploaded:</b> {value.name}
        </div>
      )}
      {touched && error ? (
        <div className="text-danger font">{error}</div>
      ) : null}
    </div>
  );
};

CustomFileUpload.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.any,
  onBlur: PropTypes.any,
  error: PropTypes.any,
  touched: PropTypes.any,
  buttonText: PropTypes.string,
  className: PropTypes.string,
  accept: PropTypes.string,
};

export default CustomFileUpload;
