import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ClaimProvider } from "./app/context/ClaimContext";

createRoot(document.getElementById("root")!).render(
  <ClaimProvider>
    <App />
  </ClaimProvider>
);