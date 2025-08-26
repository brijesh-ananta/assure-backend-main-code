import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  // Define your menu items with their corresponding routes
  const menuItems = [
    { label: "Home", route: "/dashboard" },
    { label: "Profile details", route: "/dashboard/profile" },
    { label: "Change Password", route: "/dashboard/change-password" },
    { label: "About", route: "/dashboard/about" },
    { label: "Help", route: "/dashboard/help" },
  ];

  return (
    <div className="offcanvas offcanvas-start" id="offcanvasExample">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">BluHive</h5>
        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas"></button>
      </div>
      <div className="offcanvas-body">
        <ul className="list-unstyled menu-items">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link className="dropdown-item" to={item.route} reloadDocument>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
