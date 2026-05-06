import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.tsx";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(<App />);
