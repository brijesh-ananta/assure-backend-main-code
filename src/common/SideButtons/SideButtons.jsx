import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./SideButtons.css";

const SideButtons = ({disabled = false,  buttons = [], placement = "left", activeLabel }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const index = buttons.findIndex((btn) => btn.label === activeLabel);
    if (index !== -1) setActiveIndex(index);
  }, [activeLabel, buttons]);

  const handleClick = (index, onClick) => {
    setActiveIndex(index);
    if (typeof onClick === "function") onClick();
  };

  return (
    <div className={`side-buttons-wrapper ${placement}`}>
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          className={`side-tab ${activeIndex === idx ? "active" : ""} ${(disabled && activeIndex === idx)&& 'active-dis'}`}
          onClick={() => handleClick(idx, btn.onClick(btn.label))}
          disabled={btn?.disabled || disabled || false}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

SideButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ),
  disabled: PropTypes.bool,
  placement: PropTypes.oneOf(["left", "right"]),
  activeLabel: PropTypes.string,
};

export default SideButtons;
