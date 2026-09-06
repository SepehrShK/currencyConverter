import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "@mui/stylis-plugin-rtl";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import "./index.css";
import App from "./App.tsx";

const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: "Tahoma, sans-serif",
  },
  palette: {
    primary: {
      main: "#009688",
    },
    secondary: {
      main: "#00e676",
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>,
);