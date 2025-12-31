import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from "react-toastify";
import "./i18n"; // Import i18n configuration

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
    <ToastContainer />
  </Provider>
);
