import { Arrow } from "./components/Arrow";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "@fontsource/geist/latin-600.css";
import "@fontsource/geist/latin-700.css";
import "@fontsource/geist-mono/latin-400.css";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Tutorial } from "./pages/Tutorial";
import { Game } from "./pages/Game";
import { Results } from "./pages/Results";
import { About } from "./pages/About";
import "./styles.css";
import "./onboarding.css";
import "./simulation.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tutorial" element={<Tutorial />} />
          <Route path="game" element={<Game />} />
          <Route path="results" element={<Results />} />
          <Route path="about" element={<About />} />
          <Route
            path="*"
            element={
              <section className="page-width inner-page empty-state">
                <p className="eyebrow">OUTSIDE THE BLOCK</p>
                <h1>This page isn’t here.</h1>
                <Link className="button primary" to="/">
                  Back to the overview <Arrow />
                </Link>
              </section>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
