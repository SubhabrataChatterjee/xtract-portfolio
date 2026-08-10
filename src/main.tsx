
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  // @ts-ignore: allow side-effect import for CSS without declarations
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  