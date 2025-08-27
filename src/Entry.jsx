import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import { useAuth } from "./utils/AuthContext"; // Adjust the import path if necessary
import ProtectedRoute from "./utils/ProtectedRoute"; // Adjust the import path if necessary
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/users/ManageUsers";
import ManageTestCardPartner from "./pages/partners/ManageTestCardPartner";

// import ManageCards from "./pages/cards/ManageCards";

// import Settings from "./pages/settings/Settings";
// import SettingsV2 from "./pages/settings/SettingsV2";
import ManageAuditTrails from "./pages/audittrails/ManageAuditTrails";

// import ManageNotifications from "./pages/notifications/ManageNotifications";
// import AddNotification from "./pages/notifications/AddNotification";
import ManageNotificationsV2 from "./pages/notifications-v2/ManageNotifications";
import AddNotificationV2 from "./pages/notifications-v2/AddNotification";

// import ManageIssuers from "./pages/test-card-issuer/ManageIssuers";
import TCrequesetHistory from "./pages/test-card-request/TCrequesetHistory";
import TCrequest from "./pages/test-card-request/TCrequest";
// import UpdateCards from "./pages/cards/UpdateCards";
import TCfulfilment from "./pages/test-card-request/TCfulfilment";
import OnboardUser from "./pages/users/OnboardUser";
// import AddTCissuer from "./pages/test-card-issuer/AddTCissuer";
// import EditTCissuer from "./pages/test-card-issuer/EditTCissuer";
import AddTestPartners from "./pages/partners/AddTestPartners";
import AddTestCard from "./pages/cards/AddTestCard";
import About from "./pages/static/About";
import Help from "./pages/static/Help";
import ChangePassword from "./pages/static/ChangePassword";
// import Profile from "./pages/static/Profile";
import EditTestPartners from "./pages/partners/EditTestPartners";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassWord from "./auth/ResetPassWord";
import AuditTrailView from "./pages/audittrails/AuditTrailView";
import NotificationView from "./pages/notifications/NotificationView";
import Testinformation from "./pages/test-card-request/Testinformation";
import Terminaldetails from "./pages/test-card-request/Terminaldetails";
import Cardshippingdetails from "./pages/test-card-request/Cardshippingdetails";
import Fullfilment from "./pages/test-card-request/Fullfilment";
import CardShipment from "./pages/test-card-request/CardShipment";
import AddUser from "./pages/users/AddUser";
import CardProfile from "./pages/card-profile/CardProfile";
import DashboardLayout from "./pages/layouts/DashboardLayout";
import AddProfile from "./pages/card-profile/AddProfile";
import ViewProfile from "./pages/card-profile/ViewProfile";
import AssignCard from "./pages/card-profile/AssignCard";
import ProfileV2 from "./pages/static/Profile-v2";
import IssuerList from "./pages/test-card-issuer/IssuerList";
import EditCurrentIssuer from "./pages/test-card-issuer/EditCurrentIssuer";
import TestingPartnerList from "./pages/testing-partner/TestingPartner";
import TestingPartnerEditDetail from "./pages/testing-partner/TestingPartnerEditDetail";
import TestingPartnerAddDetail from "./pages/testing-partner/TestingPartnerAddDetail";
import ProductBundleTable from "./pages/maintain-card-stock/ProductBundleTable";
import AddCard from "./pages/maintain-card-stock/AddCard";
import OnBoardUser from "./pages/onboard-user/OnBoardUser";
import SearchCard from "./pages/search-card/SearchCard";
import AddNewIssuer from "./pages/test-card-issuer/AddNewIssuer";
import UpdateCard from "./pages/search-card/UpdateCard";
import UserListingView from "./pages/onboard-user/UserListingView";
import UpdateUser from "./pages/onboard-user/UpdateUser";

import OnBoardUserv2 from "./pages/onboard-user-v2/OnBoardUserv2";
import ViewUserv2 from "./pages/view-user-v2/ViewUserv2";
import LoginHistoryv2 from "./pages/login-history-v2/LoginHistoryv2";
// import AssignedCardv2 from "./pages/assigned-card-v2/AssignedCardv2";
import SystemDefaults from "./pages/system-defaults/SystemDefaults";
import ManageCountryv2 from "./pages/manage-countries-v2/ManageCountryv2";
import ManageMccv2 from "./pages/manage-mcc-v2/ManageMccv2";
import AddNotificationv2 from "./pages/create-notification-v2/AddNotificationv2";
import EditNotificationv2 from "./pages/create-notification-v2/EditNotificationv2";
import BinList from "./pages/bin/BinList";
import UpdateBin from "./pages/bin/UpdateBin";
import AddNewBin from "./pages/bin/CreateBin";
import CreateBin from "./pages/bin/UpdateBin";
import ViewBin from "./pages/bin/BinDetails";
import AssignCardManually from "./pages/assign-card-manually";
import UserCaredHistory from "./pages/onboard-user/UserCaredHistory";

import TestCaseList from "./pages/test-case/TestCaseList";
import UpdateTestCase from "./pages/test-case/UpdateTestCase";
import AddNewTestCase from "./pages/test-case/CreateTestCase";
import ViewTestCase from "./pages/test-case/TestCaseDetails";

function Entry() {
  const { user = {} } = useAuth();
  const userType = user.role;

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassWord />} />
        {/* static Pages */}
        <Route
          path="/dashboard/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/help"
          element={
            <ProtectedRoute>
              {" "}
              <Help />
            </ProtectedRoute>
          }
        />

        {/* change password */}
        <Route
          path="/dashboard/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        {/* profile */}
        {/* <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          /> */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Old user dashboard */}
        <Route
          path="/dashboard/user-management"
          element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        {/* OLD */}
        <Route
          path="/dashboard/user-management/onboard-user"
          element={
            <ProtectedRoute>
              <OnboardUser />
            </ProtectedRoute>
          }
        />

        {/* Test Card */}
        <Route
          path="/dashboard/request-history"
          element={
            <ProtectedRoute>
              <TCrequesetHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/test-card-request"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TCrequest />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-card-request/:cardRequestId"
          element={
            <ProtectedRoute>
              <DashboardLayout audit tableName="card_requests">
                <TCrequest />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/add-user"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Add User"}>
                <AddUser />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/update-user/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Update address"}>
                <AddUser />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-card-request/requestor-info/:cardRequestId"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                headerTitle={"Test Card Request"}
                tableName="card_requests"
              >
                <TCrequest />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/test-card-request/test-info/:cardRequestId"
          element={
            <ProtectedRoute>
              <Testinformation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-card-request/terminal-details/:cardRequestId"
          element={
            <ProtectedRoute>
              <Terminaldetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-card-request/card-shipping-details/:cardRequestId"
          element={
            <ProtectedRoute>
              <Cardshippingdetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/test-card-request/fulfilment/:cardRequestId"
          element={
            <ProtectedRoute>
              <Fullfilment />
            </ProtectedRoute>
          }
        />
        {/* test card assignment OLD
        <Route
          path="/dashboard/test-card-request/assignment/:cardRequestId"
          element={
            <ProtectedRoute>
              <CardAssignment />
            </ProtectedRoute>
          }
        /> */}

        {/* test card shipment */}
        <Route
          path="/dashboard/test-card-request/shipment/:cardRequestId"
          element={
            <ProtectedRoute>
              <CardShipment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/test-card-fulfilment"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Test Card Fulfillment"}>
                <TCfulfilment />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* test-card-issuer */}
        <Route
          path="/dashboard/test-card-issuer"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Test Card Issuer"}>
                <IssuerList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* <Route
              path="/dashboard/test-card-issuer/add-issuer"
              element={
                <ProtectedRoute>
                  <AddTCissuer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/test-card-issuer/view-issuer"
              element={
                <ProtectedRoute>
                  <EditTCissuer />
                </ProtectedRoute>
              }
            /> */}

        {/* testing partner management */}
        <Route
          path="/dashboard/testing-partner-old"
          element={
            <ProtectedRoute>
              <ManageTestCardPartner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/testing-partner/add-partner"
          element={
            <ProtectedRoute>
              <AddTestPartners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/testing-partner/edit-partner"
          element={
            <ProtectedRoute>
              <EditTestPartners />
            </ProtectedRoute>
          }
        />

        {/* OLD cards */}
        {/* <Route
          path="/dashboard/manage-cards"
          element={
            <ProtectedRoute>
              <ManageCards />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/dashboard/cards/add-card"
          element={
            <ProtectedRoute>
              <AddTestCard />
            </ProtectedRoute>
          }
        />

        {/* <Route OLD
          path="/dashboard/update-card"
          element={
            <ProtectedRoute>
              <UpdateCards />
            </ProtectedRoute>
          }
        /> */}

        {/* settings OLD*/}
        {/* <Route
          path="/dashboard/system-settings"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="system_defaults"
                headerTitle={"System Defaults"}
              >
                <SettingsV2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        /> */}

        {/* settings NEW //IN USE*/}
        <Route
          path="/dashboard/system-settings"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="system_defaults"
                headerTitle={"System Defaults"}
              >
                <SystemDefaults />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Manage Countries //IN USE */}
        <Route
          path="/dashboard/system-settings/manage-countries"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Manage Countries"}>
                <ManageCountryv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Manage MCCs //IN USE */}
        <Route
          path="/dashboard/system-defaults-v2/manage-mcc"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Manage MCC"}>
                <ManageMccv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/system-settings"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="system_defaults"
                headerTitle={"System Defaults"}
              >
                <SystemDefaults />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* OLD notification */}
        {/* <Route
              path="/dashboard/manage-notifications"
              element={
                <ProtectedRoute>
                  <ManageNotifications />
                </ProtectedRoute>
              }
            /> */}

        {/* New notification */}
        <Route
          path="/dashboard/manage-notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Notification History"}>
                <ManageNotificationsV2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* OLD */}
        {/* <Route
              path="/dashboard/create-notification"
              element={
                <ProtectedRoute>
                  <AddNotification />
                </ProtectedRoute>
              }
            /> */}

        {/* NEW */}
        <Route
          path="/dashboard/create-notification"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"New Notification"}>
                <AddNotificationV2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* OLD */}
        {/* <Route
              path="/notification/view"
              element={
                <ProtectedRoute>
                  <NotificationView />
                </ProtectedRoute>
              }
            /> */}

        {/* NEW */}
        <Route
          path="/notification/view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                headerTitle={"Manage Notification"}
                audit
                tableName="notifications"
              >
                <NotificationView />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Audit trails */}
        <Route
          path="/dashboard/audit-trails"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Audit Trail"}>
                <ManageAuditTrails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-trails/view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Audit Trail"}>
                <AuditTrailView />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Additional routes can be added here */}

        {/* New routes */}
        <Route
          path="/dashboard/card-profile"
          element={
            <ProtectedRoute>
              <DashboardLayout
                showEnvHeader
                pageName={userType == 6 ? "cardProfile" : "cardProfile"}
                headerTitle={"Card Profile"}
              >
                <CardProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/card-profile/add"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit={true}
                showEnvHeader
                headerTitle={"Add new Profile"}
              >
                <AddProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/card-profile/edit/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit={true}
                showEnvHeader
                headerTitle={"Edit Profile"}
              >
                <AddProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/card-profile/view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit={true}
                showEnvHeader
                disableHeader={true}
                headerTitle={"View Profile"}
                tableName="profiles"
              >
                <ViewProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/card-profile/assign-card/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit={true}
                showEnvHeader
                disableHeader
                headerTitle={"Assign Card"}
              >
                <AssignCard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"My Profile"}>
                <ProfileV2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-card-issuer/edit/:issuerId"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="issuers"
                headerTitle={"Edit Test Card Issuer"}
              >
                <EditCurrentIssuer />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/test-card-issuer/add"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Add Test Card Issuer"}>
                <AddNewIssuer />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/testing-partner"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Testing Partners"}>
                <TestingPartnerList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/testing-partner/edit/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="partners"
                headerTitle={"Testing Partner"}
              >
                <TestingPartnerEditDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/testing-partner/add"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Testing Partner"}>
                <TestingPartnerAddDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/maintain-card-stock"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Maintain Card Stock"}>
                <ProductBundleTable />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/maintain-card-stock/add-card/:binId"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Add Card"}>
                <AddCard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/onboard-user"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Onboard User"}>
                <OnBoardUser />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/search-card"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Search Card"}>
                <SearchCard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* New */}
        <Route
          path="/dashboard/update-card/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="cards"
                headerTitle={"Update Card"}
              >
                <UpdateCard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/user-list-view"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"User Management"}>
                <UserListingView />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/user-list-view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="users"
                headerTitle={"User Management"}
              >
                <UpdateUser />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/onboard-user-v2"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Onboard User"}>
                <OnBoardUserv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/view-user-v2"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"View User"}>
                <ViewUserv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/login-history-v2/:userId"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Login History"}>
                <LoginHistoryv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/user-card-history/:userId"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Card History"}>
                {/* <AssignedCardv2 /> */}
                <UserCaredHistory />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/system-defaults-v2"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="system_defaults"
                headerTitle={"System Defaults"}
              >
                <SystemDefaults />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/system-defaults-v2/manage-countries-v2"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Manage Countries"}>
                <ManageCountryv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/dashboard/system-defaults-v2/manage-mcc-v2"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Manage MCC"}>
                <ManageMccv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/dashboard/notification-v2/add"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Create Notification"}>
                <AddNotificationv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/notification-v2/edit/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Edit Notification"}>
                <EditNotificationv2 />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bin-list"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Test Card Bin"}>
                <BinList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bin-list/update/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Update Bin"}>
                <UpdateBin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bin-list/add"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Add New Bin"}>
                <AddNewBin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bin-list/view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="bins"
                headerTitle={"Bin Details"}
              >
                <ViewBin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bin-list/create-bin"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Create Bin"}>
                <CreateBin />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/assign-card-manually/:requestId/:testerId"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Search Card"}>
                <AssignCardManually />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/test-case-list"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Test Cases"}>
                <TestCaseList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-case/add"
          element={
            <ProtectedRoute>
              <DashboardLayout headerTitle={"Add New Test Case"}>
                <AddNewTestCase />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-case/update/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="test_cases"
                headerTitle={"Update Test Case"}
              >
                <UpdateTestCase />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/test-case/view/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout
                audit
                tableName="test_cases"
                headerTitle={"Test Case Details"}
              >
                <ViewTestCase />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default Entry;
