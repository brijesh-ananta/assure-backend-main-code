import { useState } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import { useAuth } from "../../utils/AuthContext";

function Profile() {
  const [headerTitle] = useState("Profile");
  const { user } = useAuth();

  // Define a role mapping for a more user-friendly display
  const roleMapping = {
    1: "TC_SME", // You can change this to "SUPER" or "Super Admin" based on your requirement
    2: "TC_REQUEST_USER",
    3: "TC_REQUEST_VIEW_USER", //
    4: "TC_MANAGER_USER",
  };

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      {/* Main Content */}
      <section className="profile-section my-4">
        <div className="container col-md-10">
          <div className="card">
            <div className="card-body">
              <div className="row mb-2 border-bottom pb-2">
                <div className="col-sm-4 font-weight-bold">First Name:</div>
                <div className="col-sm-8">{user.firstName}</div>
              </div>
              <div className="row mb-2 border-bottom pb-2">
                <div className="col-sm-4 font-weight-bold">Last Name:</div>
                <div className="col-sm-8">{user.lastName}</div>
              </div>
              <div className="row mb-2 border-bottom pb-2">
                <div className="col-sm-4 font-weight-bold">Email:</div>
                <div className="col-sm-8">{user.email}</div>
              </div>
              <div className="row mb-2 border-bottom pb-2">
                <div className="col-sm-4 font-weight-bold">Role:</div>
                <div className="col-sm-8">
                  {roleMapping[user.role] || user.role}
                </div>
              </div>
              <div className="row mb-2 border-bottom pb-2">
                <div className="col-sm-4 font-weight-bold">Created Date:</div>
                <div className="col-sm-8">
                  {new Date(user.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="row mb-2 border-bottom pb-2">
                <div className="col-sm-4 font-weight-bold">Last Login:</div>
                <div className="col-sm-8">
                  {new Date(user.last_login).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            {/* <div className="card-footer">
              <Link className="btn btn-primary" to="/dashboard/edit-profile">
                Edit Profile
              </Link>
            </div> */}
          </div>
        </div>
      </section>

      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default Profile;
