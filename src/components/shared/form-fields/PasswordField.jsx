import PropTypes from "prop-types";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function PasswordInput({
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  label,
  className = "",
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`d-flex flex-column w-100 ${className}`}>
      {label && (
        <label htmlFor={id || name} className="font no-wrap mb-1">
          {label}
        </label>
      )}
      <div className="position-relative">
        <input
          type={visible ? "text" : "password"}
          id={id || name}
          name={name}
          className="form-control formcontrol w-100"
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          key={visible}
          autoComplete={name}
          {...rest}
        />
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "45%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            zIndex: 2,
          }}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <FaEyeSlash size={24}/> : <FaEye size={24}/>}
        </span>
      </div>
      {touched && error && (
        <div className="text-danger mt-1" style={{ fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}

PasswordInput.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.any,
  onBlur: PropTypes.any,
  error: PropTypes.any,
  touched: PropTypes.any,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default PasswordInput;
