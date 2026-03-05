import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <nav style={{ borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "20px" }}>
        <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/announcements" style={{ marginRight: "15px" }}>Announcements</Link>
        <Link to="/events" style={{ marginRight: "15px" }}>Events</Link>
        <Link to="/alerts" style={{ marginRight: "15px" }}>Alerts</Link>
        <Link to="/admin">Admin</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
