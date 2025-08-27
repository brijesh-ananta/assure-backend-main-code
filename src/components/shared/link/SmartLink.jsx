import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

const SmartLink = ({ to = "", children, ...rest }) => {
  const location = useLocation();
  const hasQuery = to.includes("?");
  const linkTo = hasQuery ? to : `${to}${location.search}`;
  return (
    <Link to={linkTo} {...rest}>
      {children}
    </Link>
  );
};

SmartLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node,
  params: PropTypes.object,
  className: PropTypes.string,
};

export default SmartLink;
