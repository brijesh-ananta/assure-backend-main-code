import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import CustomTable from "../../components/shared/table/CustomTable";
import "./UserListingView.css";
import axiosToken from "../../utils/axiosToken";
import { Link, useNavigate } from "react-router-dom";

const roleMapping = {
  1: "TC SME",
  2: "TC REQUEST USER",
  3: "TC REQUEST VIEW USER",
  4: "TC MANAGER USER",
  5: "Mobile App User",
  6: "Profile Editor",
};

const UserListingView = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [testerName, setTesterName] = useState("");
  const [email, setEmail] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [showLockedOnly, setShowLockedOnly] = useState(false);

  const navigate = useNavigate();

  const renderInput = (placeholder, value, onChange) => (
    <div className="input-wrapper">
      <input
        type="text"
        className="form-control formcontrol"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <Search size={18} className="input-icon" />
    </div>
  );

  const fetchUsers = async () => {
    try {
      const response = await axiosToken.get(`/users`);
      const all = response.data || [];
      const updatedUsers = all.map((item) => {
        let userStatus = "inactive";

        if (item.is_locked === 1) {
          userStatus = "locked";
        } else if (item.isDeleted === 1) {
          userStatus = "deleted";
        } else if (item.isActive === 1) {
          userStatus = "active";
        } else {
          userStatus = "blocked";
        }

        return { ...item, userStatus };
      });

      setAllUsers(updatedUsers);
      setUsersList(updatedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    let filtered = allUsers;

    if (testerName.trim()) {
      filtered = filtered.filter(
        (u) =>
          (u.firstName + " " + u.lastName)
            .toLowerCase()
            .includes(testerName.trim().toLowerCase()) ||
          u.username.toLowerCase().includes(testerName.trim().toLowerCase())
      );
    }
    if (email.trim()) {
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(email.trim().toLowerCase())
      );
    }
    if (partnerName.trim()) {
      filtered = filtered.filter((u) =>
        (u.partnerName || "")
          .toLowerCase()
          .includes(partnerName.trim().toLowerCase())
      );
    }
    if (showLockedOnly) {
      filtered = filtered.filter((u) => u.is_locked === 1);
    }
    setUsersList(filtered);
  }, [testerName, email, partnerName, showLockedOnly, allUsers]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "email",
          label: "Email",
          width: "120px",
          sortable: true,
          renderCell: (item) => (
            <Link
              style={{ textTransform: "none" }}
              to={`/dashboard/user-list-view/${item?.user_id}`}
            >
              {item.email}
            </Link>
          ),
        },
        {
          key: "name",
          label: "Name",
          width: "150px",
          sortable: true,
          renderCell: (item) => <>{item.firstName + " " + item.lastName}</>,
        },
        {
          key: "role_id",
          label: "User Role",
          width: "120px",
          sortable: true,
          renderCell: (item) => (
            <>{roleMapping[item.role_id] || item?.user_type ||  "Unknown Role"}</>
          ),
        },
        {
          key: "userStatus",
          label: "User Status",
          width: "120px",
          sortable: true,
          renderCell: (item) => {
            const redStatus = ["locked", "deleted"];
            return (
              <span
                style={{
                  color: redStatus.includes(item.userStatus) ? "red" : "black",
                }}
              >
                {item.userStatus}
              </span>
            );
          },
        },
        {
          key: "user_type",
          label: "User Type",
          width: "120px",
          sortable: true,
        },
      ],
      options: {
        isServerSide: false,
        sortConfig: {
          initialSortColumn: "submittedDate",
          initialSortDirection: "desc",
        },
        pagination: {
          initialEntriesPerPage: 10,
          pageOptions: [10, 25, 50, 100],
        },
        responsive: {
          breakpoint: "768px",
          minWidth: "600px",
        },
      },
      styles: {
        header: {
          backgroundColor: "#f8f9fa",
          borderBottom: "4px solid #dee2e6",
        },
        row: {
          striped: true,
          hover: true,
        },
      },
    }),
    []
  );

  return (
    <>
      <div className="mb-lg-0 mb-3 py-lg-3 py-2 aqua-border-b">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-end w-90">
            <button
              className="btn save-btn"
              onClick={() => navigate("/dashboard/onboard-user")}
            >
              Onboard User
            </button>
          </div>
        </div>
      </div>
      <div className="search-card-wrapper form-field-wrapper">
        <div className="form-grid-search-card">
          <div className="form-grid-row">
            <div className="form-group-search-card">
              <label>User Name</label>
              {renderInput("Enter user name", testerName, (e) =>
                setTesterName(e.target.value)
              )}
            </div>
            <div className="form-group-search-card">
              <label>Email</label>
              {renderInput("Enter email", email, (e) =>
                setEmail(e.target.value)
              )}
            </div>
          </div>

          <div className="form-grid-row">
            <div className="form-group-search-card">
              <label>Testing Partner Name</label>
              {renderInput("Enter testing partner name", partnerName, (e) =>
                setPartnerName(e.target.value)
              )}
            </div>
            <div
              className="form-group-search-card"
              style={{ marginLeft: "11rem" }}
            >
              <button
                className={`btn save-btn ${showLockedOnly ? "btn-active" : ""}`}
                onClick={() => setShowLockedOnly((prev) => !prev)}
              >
                {showLockedOnly ? "Show All Accounts" : "Locked Accounts"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-lg-5 mb-3 table-responsive">
        <CustomTable
          options={tableConfig.options}
          styles={tableConfig.styles}
          data={usersList}
          columns={tableConfig.columns}
          expandable={tableConfig.options.expandable}
          emptyState={
            <div className="text-center p-5 font fa-1x">No Card found.</div>
          }
        />
      </div>
    </>
  );
};

export default UserListingView;
