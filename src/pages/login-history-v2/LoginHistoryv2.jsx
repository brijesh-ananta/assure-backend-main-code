import { useEffect, useMemo, useState } from "react";
import CustomTable from "../../components/shared/table/CustomTable";
import SideButtons from "../../common/SideButtons/SideButtons";
import { useNavigate, useParams } from "react-router-dom";
import "./loginhistoryv2.css";
import apiService from "../../services";

function formatDateTime(isoString) {
  if (!isoString)  return { date: 'N/A', time: 'N/A', };
  const dateObj = new Date(isoString);

  const date = dateObj.toISOString().split("T")[0];

  const time = dateObj.toISOString().split("T")[1].split(".")[0];

  return { date, time };
}

const LoginHistoryv2 = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [user, setUser] = useState({});
  const [history, setHistory] = useState([]);

  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "login_date",
          label: "Login Date",
          width: "120px",
          renderCell: (item) => {
            return formatDateTime(item?.login_time).date || "N/A";
          },
        },
        {
          key: "login_time",
          label: "Login Time",
          width: "120px",
          renderCell: (item) => {
            return formatDateTime(item?.login_time)?.time || "N/A";
          },
        },
        {
          key: "logout_date",
          label: "Logout Date",
          width: "120px",
          renderCell: (item) => {
            return formatDateTime(item?.logout_time).date || "N/A";
          },
        },
        {
          key: "logout_time",
          label: "Logout Time",
          width: "120px",
          renderCell: (item) => {
            return formatDateTime(item?.logout_time).time || "N/A";
          },
        },
        {
          key: "device_id",
          label: "Device",
          width: "120px",
          renderCell: (item) => {
            return item?.device_id || "N/A";
          },
        },
        {
          key: "ip_address",
          label: "IP Address",
          width: "120px",
          renderCell: (item) => {
            return item?.ip_address || "N/A";
          }
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

  const handleClickSideButtons = (label) => {
    if (label === "User Profile") {
      navigate(`/dashboard/user-list-view/${userId}`);
    } else if (label === "Assigned Cards") {
      navigate(`/dashboard/user-card-history/${userId}`);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiService.user.getUserLoginHistory(userId);
        setHistory(resp);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiService.user.getById(userId);
        setUser(resp.user);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [userId]);

  return (
    <>
      <SideButtons
        placement="left"
        activeLabel="Login History"
        buttons={[
          {
            label: "User Profile",
            onClick: () => handleClickSideButtons("User Profile"),
          },
          {
            label: "Login History",
            onClick: () => handleClickSideButtons("Login History"),
          },
          {
            label: "Assigned Cards",
            onClick: () => handleClickSideButtons("Assigned Cards"),
          },
        ]}
      />
      <div className="login-history-conatiner">
        <div className="search-card-wrapper form-field-wrapper">
          <div className="form-grid-search-card">
            <div className="form-grid-row">
              <div className="form-group-search-card">
                <label>User Email</label>
                <p>{user.email}</p>
              </div>
              <div className="form-group-search-card">
                <label>User Name</label>
                <p>
                  {user?.firstName || ""} {user?.lastName || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-lg-5 mb-3 table-responsive">
          <CustomTable
            options={tableConfig.options}
            styles={tableConfig.styles}
            data={history}
            columns={tableConfig.columns}
            expandable={tableConfig.options.expandable}
            emptyState={
              <div className="text-center p-5 font fa-1x">No Card found.</div>
            }
          />
        </div>
      </div>
    </>
  );
};

export default LoginHistoryv2;
