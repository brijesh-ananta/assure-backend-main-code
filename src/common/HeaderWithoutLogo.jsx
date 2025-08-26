const HeaderWithoutLogo = () => {
  const VITE_SITE_NAME = import.meta.env.VITE_SITE_NAME;

  return (
    <>
      <header
        className="-sticky login-header mb-lg-0 mb-3 z-2"
      >
        <div className="logo d-flex align-items-center gap-4">
          <a
            href="#"
            className="d-flex align-items-center text-decoration-none"
          >
            <img
              src="/images/Logobottomwhite.png"
              alt="Login Logo"
              className="img-fluid"
              style={{ width: "8%", height: "auto" }}
            />
            <span className="ms-2">{VITE_SITE_NAME}</span>
          </a>
        </div>
      </header>
    </>
  );
};

export default HeaderWithoutLogo;
