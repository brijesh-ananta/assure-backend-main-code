import { ToastContainer } from "react-toastify";
import Entry from "./Entry.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Entry />
        </AuthProvider>
      </BrowserRouter>

      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </>
  );
}

export default App;
