import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";

function Help() {
  const [headerTitle] = useState("Help & Support");

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      {/* Main Content */}
      <div className="notification my-4">
        <div className="container">
          <div className="row row-cols-1 row-cols-lg-2 gy-3">
            {/* FAQ Card */}
            <div className="col">
              <div className="card shadow">
                <div className="card-header bg-info text-white">
                  <h4>Frequently Asked Questions</h4>
                </div>
                <div className="card-body">
                  <p>
                    <strong>Q: How do I reset my password?</strong>
                    <br />
                    A: Click on the "Forgot Password" link on the login page and
                    follow the instructions.
                  </p>
                  <p>
                    <strong>Q: How do I contact support?</strong>
                    <br />
                    A: You can reach out to our support team via our{" "}
                    <Link to="/contact">Contact Us</Link> page.
                  </p>
                  <p>
                    <strong>Q: Where can I find the user guide?</strong>
                    <br />
                    A: The user guide is available in the Help section of your
                    dashboard.
                  </p>
                </div>
              </div>
            </div>
            {/* Contact Support Card */}
            <div className="col">
              <div className="card shadow">
                <div className="card-header bg-secondary text-white">
                  <h4>Contact Support</h4>
                </div>
                <div className="card-body">
                  <p>
                    If you have any issues or need further assistance, please
                    don't hesitate to contact our support team.
                  </p>
                  <p>
                    You can reach us via email at{" "}
                    <a href="mailto:support@example.com">support@example.com</a>{" "}
                    or call us at <strong>+1 (555) 123-4567</strong>.
                  </p>
                  <p>
                    Alternatively, you can fill out our support form on the{" "}
                    <Link to="/contact">Contact Us</Link> page and we will get
                    back to you as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default Help;
