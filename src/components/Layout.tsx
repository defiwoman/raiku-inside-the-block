import { Arrow } from "./Arrow";
import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    const page = location.pathname.split("/")[1];
    document.title = `${page ? page.charAt(0).toUpperCase() + page.slice(1) + " · " : ""}Raiku: Inside the Block`;
    window.scrollTo(0, 0);
    if (!firstRender.current) mainRef.current?.focus();
    firstRender.current = false;
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link
          className="wordmark"
          to="/"
          aria-label="Raiku: Inside the Block home"
        >
          <strong>raiku</strong>
          <span className="wordmark-divider" />
          <span className="wordmark-sub">
            INSIDE
            <br />
            THE BLOCK
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Overview
          </NavLink>
          <NavLink to="/tutorial">How to play</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <Link className="header-play" to="/tutorial">
          Enter the Block{" "}
          <span aria-hidden="true">
            <Arrow />
          </span>
        </Link>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-brand">
          raiku <span>/ INSIDE THE BLOCK</span>
        </div>
        <p>
          Community-built educational simulation. Not affiliated with or
          endorsed by Raiku.
        </p>
        <span className="footer-note">
          BUILT FOR CURIOSITY <Arrow />
        </span>
      </footer>
    </div>
  );
}
