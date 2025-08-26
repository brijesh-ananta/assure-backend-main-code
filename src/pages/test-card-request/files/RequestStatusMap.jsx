/* eslint-disable react/prop-types */

function isCardHidden({ environment, terminalType, card }) {
  if (environment == 1 && terminalType === "Ecomm") {
    return (
      card === "Terminal Details" ||
      card === "Shipping Details" ||
      card === "Ship Card"
    );
  }
  if (environment == 3 && terminalType === "Pos") {
    return card === "Terminal Details" || card === "Tester Details" || card === 'Assign Card'
  }

  return false;
}

const RequestStatusMap = ({ setStart, terminalType, environment }) => {
  return (
    <div className="workflow-container">
      <div className="workflow-row">
        <div className="workflow-card">
          <div className="workflow-card-title">Requestor Information</div>
          <div className="workflow-card-content">
            Provide Service Now status and requestor details
          </div>
          <div className="workflow-card-bar"></div>
          <div className="workflow-arrow arrow-container arrow">
            <div className="arrow-line"></div>
            <div className="arrow-head"></div>
          </div>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-title">Test Information</div>
          <div className="workflow-card-content">
            Provide objective, priority, start and end date
          </div>
          <div className="workflow-card-bar"></div>
          <div className="workflow-arrow arrow-container arrow">
            <div className="arrow-line"></div>
            <div className="arrow-head"></div>
          </div>
        </div>

        <div
          className={`workflow-card ${
            isCardHidden({
              environment,
              terminalType,
              card: "Terminal Details",
            })
              ? "opacity-04"
              : ""
          }`}
        >
          <div className="workflow-card-title">Terminal Details</div>
          <div className="workflow-card-content">
            Provide terminal under test details
          </div>
          <div className="workflow-card-bar"></div>
          <div className="workflow-arrow arrow-container arrow">
            <div className="arrow-line"></div>
            <div className="arrow-head"></div>
          </div>
        </div>
        <div className={`workflow-card`}>
          <div className="workflow-card-title">Tester Details</div>
          <div className="workflow-card-content">
            Provide tester information
          </div>
          <div className="workflow-card-bar"></div>
          <div className="workflow-arrow arrow-container arrow">
            <div className="arrow-line"></div>
            <div className="arrow-head"></div>
          </div>
        </div>

        <div className={`workflow-card ${
            isCardHidden({
              environment,
              terminalType,
              card: "Shipping Details",
            })
              ? "opacity-04"
              : ""
          }`}>
          <div className="workflow-card-title">Shipping Details</div>
          <div className="workflow-card-content">Provide shipping details</div>
          <div className="workflow-card-bar"></div>
          {terminalType != "Ecomm" && (
            <div className="workflow-arrow arrow-container arrow-4">
              <div className="arrow-line"></div>
              <div className="arrow-head"></div>
            </div>
          )}
        </div>
      </div>

      <div className="workflow-row">
        <div
          className={`workflow-card shipping-card ${
            isCardHidden({
              environment,
              terminalType,
              card: "Ship Card",
            })
              ? "opacity-04"
              : ""
          }`}
        >
          <div className="workflow-card-title">Ship Card</div>
          <div className="workflow-card-content">
            Ship card and save tracking information
          </div>
          <div className="workflow-card-bar"></div>
        </div>

        <div
          className={`workflow-card shipping-card ${
            isCardHidden({
              environment,
              terminalType,
              card: "Assign Card",
            })
              ? "opacity-04"
              : ""
          }`}
        >
          <div className="workflow-card-title">Assign Card</div>
          <div className="workflow-card-content">
            Assign card and configure risk parameters
          </div>
          <div className="workflow-card-bar"></div>
          <div className="workflow-arrow arrow-container arrow-5">
            <div className="arrow-line-big"></div>
            <div className="arrow-head"></div>
          </div>
        </div>

        <div
          className={`workflow-card shipping-card ${
            isCardHidden({
              environment,
              terminalType,
              card: "TC Request Approval",
            })
              ? "opacity-04"
              : ""
          }`}
        >
          <div className="workflow-card-title">TC Request Approval</div>
          <div className="workflow-card-content">
            Review and approve Test Card request
          </div>
          <div className="workflow-card-bar"></div>
          <div className="workflow-arrow arrow-container arrow-5">
            <div className="arrow-line-big"></div>
            <div className="arrow-head"></div>
          </div>
        </div>

        <div
          className={`workflow-card-rounded mr-21-polygon  shipping-card`}
        >
          <div className="polygon-border">
            <div className="workflow-polygon">
              Submit <br /> TC Request
            </div>
          </div>
          <div className="workflow-card-bar workflow-card-bar-small"></div>
          <div className="workflow-arrow arrow-container arrow-6-polygon">
            <div className="arrow-line-big lg"></div>
            <div className="arrow-head"></div>
          </div>
        </div>
      </div>

      <div className="btn w-25 m-auto save-btn" onClick={() => setStart(true)}>
        Start Request
      </div>
    </div>
  );
};

export default RequestStatusMap;
