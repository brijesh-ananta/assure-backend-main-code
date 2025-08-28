import PropTypes from "prop-types";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import "./style.css";
import EnvHeader from "../../components/EnvHeader";
import {
  environmentMappingOption,
  terminalTypeMappingOption,
} from "../../utils/constent";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HeaderWithoutLogo from "../../common/HeaderWithoutLogo";
import { useAuth } from "../../utils/AuthContext";

const buttonPageTitle = {
  cardProfile: "Add New Profile",
};

const DashboardLayout = ({
  headerTitle,
  children,
  audit = false,
  showEnvHeader = false,
  pageName = "",
  disableHeader = false,
  tableName = "",
  onlyLogo = false,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("recordId") || null;
  const location = useLocation();
  const { user } = useAuth();
  console.log(user);
  const getTerminalType = () => {
    const data = terminalTypeMappingOption.find((a) => a.value === "Ecomm");
    data.disabled = true;
    return terminalTypeMappingOption;
  };

  return (
    <div className="dashboard-layout-wrapper">
      {onlyLogo ? <HeaderWithoutLogo /> : <Header title={headerTitle} />}
      {showEnvHeader && (
        <EnvHeader
          environmentOptions={environmentMappingOption.slice(0, 2)}
          terminalTypeOptions={getTerminalType()}
          onSubmit={() => {
            if (pageName === "cardProfile") {
              const url = `/dashboard/card-profile/add${location.search}`;
              navigate(url);
            }
          }}
          disableHeader={disableHeader}
          isSubmitDisabled={false}
          showSubmit={
            pageName !== "" &&
            !(pageName === "cardProfile" && user?.profile_editor === false)
          }
          submitLabel={buttonPageTitle[pageName] || ""}
        />
      )}

      <div className="body mt-2 mb-2">{children}</div>
      <Footer
        audit={audit}
        recordId={recordId || null}
        tableName={tableName || null}
      />
    </div>
  );
};

DashboardLayout.propTypes = {
  headerTitle: PropTypes.string,
  children: PropTypes.children,
  audit: PropTypes.bool,
  showEnvHeader: PropTypes.bool,
  pageName: PropTypes.string,
  tableName: PropTypes.string,
  disableHeader: PropTypes.bool,
  onlyLogo: PropTypes.bool,
};

export default DashboardLayout;
