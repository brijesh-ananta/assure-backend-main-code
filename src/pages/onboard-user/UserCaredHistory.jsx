import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../../components/shared/table/CustomTable";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDateToLocal } from "../../utils/date";
import SideButtons from "../../common/SideButtons/SideButtons";
import apiService from "../../services";
import { decryptAesGcm } from "../../utils/encryptDecrypt";

const UserCaredHistory = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [cardHistory, setCardHistory] = useState();
  const [user, setUser] = useState();
  const [totalamount, setotalamount] = useState(0);
  const [totalUsage, setotalUsage] = useState(0);
  const tableConfig = useMemo(
    () => ({
      columns: [
        {
          key: "cardNumber",
          label: "Card Number",
          renderCell: (item) => (
            <Link to={`/dashboard/update-card/${item?.usages?.id}`}>
              {item.decryptedCardDetails?.cardNumber
                ? item.decryptedCardDetails.cardNumber.replace(
                    /^(\d{6})(\d+)(\d{6})$/,
                    "$1XXXX$3"
                  )
                : "N/A"}
            </Link>
          ),
        },
        {
          key: "cardType",
          label: "Card Type",
          width: "120px",
          sortable: true,
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              {item?.decryptedCardDetails?.cardType ||
                item?.decryptedCardDetails?.card_type}
            </span>
          ),
        },
        {
          key: "is_active",
          label: "Assignment Status",
          sortable: true,
          width: "120px",
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              {item?.is_active ? "Assigned" : "UnAssigned"}
            </span>
          ),
        },
        {
          key: "binProduct",
          label: "Date Assigned",
          width: "120px",
          sortable: true,
          renderCell: (item) => (
            <span>{formatDateToLocal(item?.createdDate)}</span>
          ),
        },
        {
          key: "feature",
          label: "Date Released",
          width: "120px",
          sortable: true,
          renderCell: (item) => (
            <span>{formatDateToLocal(item?.release_date)}</span>
          ),
        },
        {
          key: "card_used",
          label: "Card Used #",
          width: "120px",
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              {item?.card_used || 0}
            </span>
          ),
        },
        {
          key: "amount_used",
          label: "Amount Used #",
          width: "120px",
          renderCell: (item) => (
            <span style={{ textTransform: "capitalize" }}>
              ${item?.amount_used || 0}
            </span>
          ),
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
    if (label === "Login History") {
      navigate(`/dashboard/login-history-v2/${userId}`);
    } else if (label === "User Profile") {
      navigate(`/dashboard/user-list-view/${userId}`);
    }
  };

  const getCardHistory = useCallback(async () => {
    try {
      const result = await apiService.card.getCardHistory(userId);

      setotalamount(result?.posData?.totalPosAmoutUsed || 0);
      setotalUsage(result?.posData?.totalPosUsage || 0);
      const userCiperText = localStorage.getItem("ciperText");

      if (result?.cards?.length) {
        const decryptedCards = await Promise.all(
          result?.cards.map(async (c) => {
            const card = c.usages;
            if (!card.ivKey || !card.cardDetails) {
              return { ...card, decryptedCardDetails: {} };
            }
            try {
              const decryptedObj = await decryptAesGcm({
                cipherText: card.cardDetails,
                authTagB64: card.authTag,
                ivKey: card.ivKey,
                userKey: userCiperText,
              });

              return { ...c, decryptedCardDetails: decryptedObj };
            } catch (err) {
              console.error(`Error decrypting card ID ${card.id}:`, err);
              return { ...card, decryptedCardDetails: {} };
            }
          })
        );

        setCardHistory(decryptedCards);
      }
    } catch (error) {
      console.error(error);
    }
  }, [userId]);

  useEffect(() => {
    getCardHistory();
  }, [getCardHistory]);

  const getUser = useCallback(async () => {
    if (!userId?.trim()) return;
    try {
      const resp = await apiService.user.getById(userId);
      setUser(resp.user);
    } catch (error) {
      console.error(error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      getUser();
    }
  }, [getUser, userId]);

  return (
    <>
      <SideButtons
        placement="left"
        activeLabel="Assigned Cards"
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

      <div className="container">
        <div className="form-field-wrapper row p-5">
          <div className="col-12">
            <div className="col-6 row">
              <label className="col-5 font text-right">Testing Partner</label>
              <div className="col-7">
                <input
                  placeholder="Testing Partner Name"
                  className="form-control formcontrol"
                  value={user?.partnerName}
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="col-6 row">
              <label className="col-5 font text-right">User Email</label>
              <div className="col-7">
                <input
                  placeholder="Email Address"
                  className="form-control formcontrol"
                  value={user?.partnerEmail}
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="col-12 row ps-2">
              <label className="col-2 ms-4 font text-right">User Name</label>
              <div className="col-8 d-flex gap-5 ps-3">
                <input
                  placeholder="First Name"
                  className="form-control formcontrol max-w-240"
                  value={user?.firstName}
                  disabled
                />
                <input
                  placeholder="Last Name"
                  className="form-control formcontrol"
                  disabled
                  value={user?.lastName}
                />
              </div>
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="col-6 row">
              <label className="col-5 text-right font">POS Card Usaged #</label>
              <div className="col-4">
                <input
                  placeholder="000"
                  className="form-control formcontrol"
                  disabled
                  value={totalamount || 0}
                />
              </div>
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="col-6 row">
              <label className="col-5 text-right font">
                POS Card Total Amount{" "}
              </label>
              <div className="col-4">
                <input
                  placeholder="000"
                  className="form-control formcontrol"
                  disabled
                  value={totalUsage || 0}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <CustomTable
            options={tableConfig.options}
            styles={tableConfig.styles}
            data={cardHistory || []}
            columns={tableConfig.columns}
            expandable={tableConfig.options.expandable}
            emptyState={
              <div className="text-center p-5 font fa-1x">No Data found.</div>
            }
          />
        </div>
      </div>
    </>
  );
};

export default UserCaredHistory;
