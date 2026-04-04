import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ClaimProvider } from "./app/context/ClaimContext";

// ✅ ADD THIS
import { UserProvider } from "./app/context/UserContext";

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <ClaimProvider>
      <App />
    </ClaimProvider>
  </UserProvider>
);