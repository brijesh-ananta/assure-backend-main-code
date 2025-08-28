import { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { Link } from "react-router-dom";
import Footer from "../common/Footer";
import Header from "../common/Header";
import Sidebar from "../common/Sidebar";
import Notifications from "../common/Notifications";

const Dashboard = () => {
  const [headerTitle, setHeaderTitle] = useState("Test Card Dashboard");
  const { user, userRole } = useAuth();

  const dashboardCards = [
    {
      text: "Request History",
      subText: "View request history",
      link: "/dashboard/request-history",
      roles: [1, 2, 3, 4, 5],
    },
    {
      text: "Test Card Issuer",
      subText: "View every test card issuer",
      link: "/dashboard/test-card-issuer",
      roles: [1, 2, 3, 4, 5],
    },
    {
      text: "Test Card Fulfilment",
      subText: "View all test card fulfilments",
      link: "/dashboard/test-card-fulfilment",
      roles: [1, 4],
    },
    {
      text: "Testing Partner",
      subText: "View all testing partners",
      link: "/dashboard/testing-partner",
      roles: [1, 2, 3, 4],
    },
    {
      text: "Manage Cards",
      subText: "View all update cards",
      link: "/dashboard/search-card",
      roles: [1, 4],
    },
    {
      text: "Maintain Card Inventory",
      subText: "View all card inventory",
      link: "/dashboard/maintain-card-stock",
      roles: [1, 4],
    },
    {
      text: "Manage Users",
      subText: "View all users",
      link: "/dashboard/user-list-view",
      roles: [1, 4],
    },
    {
      text: "System Defaults",
      subText: "View all system defaults",
      link: "/dashboard/system-settings",
      roles: [1, 4],
    },
    {
      text: "Manage Notification",
      subText: "View all notifications",
      link: "/dashboard/manage-notifications",
      roles: [1, 4],
    },
    {
      text: "Audit Trail",
      subText: "View all audit trails",
      link: "/dashboard/audit-trails",
      roles: [1, 4],
    },
    {
      key: "card_profile",
      text: "Card Profile",
      subText: "Create new, view, and approve Card Profiles",
      link: "/dashboard/card-profile",
      roles: [1, 4, 6],
    },
    {
      text: "Test Cases",
      subText: "Create new, view, and update Test Cases",
      link: "/dashboard/test-case-list",
      roles: [1, 4, 6],
    },
  ];

  const userHasAccess = (cardRoles, cardKey) => {
    if (!cardRoles) return true;

    // Special case: Card Profile
    if (cardKey === "card_profile") {
      return userRole === 1 || userRole === 4 || user?.profile_editor === true;
    }

    // Default rule: role must match
    return cardRoles.includes(userRole);
  };

  // const userHasAccess = (cardRoles) => {
  //   // If no specific roles are required for the card, grant access by default
  //   if (!cardRoles) return true;
  //   // If userRole is a single value, convert it into an array
  //   const userRolesArray = Array.isArray(userRole) ? userRole : [userRole];
  //   // Check if any role in userRolesArray is included in the card's required roles
  //   return cardRoles.some(role => userRolesArray.includes(role));
  // };

  const filteredCards = dashboardCards.filter((card) =>
    userHasAccess(card.roles, card.key)
  );

  return (
    <>
      <Header title={headerTitle} page="dashboard" />

      <div className="notification h-svh-125">
        <div className="container-fluid">
          <div className="row row-cols-1 row-cols-lg-2 gy-3 justify-content-between">
            <div className="col-lg-7 -1">
              <div className="row g-4 text-center">
                {filteredCards.map((item, index) => (
                  <div key={index} className="col-lg-3 max-w-240 d-flex">
                    <div className="card border-orange cardradius w-100">
                      <div className="bg-orange bgorange h-100 d-flex align-items-center min300">
                        <Link
                          to={item.link}
                          onClick={() => setHeaderTitle(item.text)}
                          className="stretched-link"
                          reloadDocument
                        ></Link>
                        <div className="card-body cardbody">
                          <p className="m-0">{item.text}</p>
                          {item.subText && (
                            <span className="m-0">{item.subText}</span>
                          )}
                        </div>
                      </div>
                      <div className="lineyellow"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Notifications />
          </div>
        </div>
      </div>

      <Sidebar />
      <Footer />
    </>
  );
};

export default Dashboard;
