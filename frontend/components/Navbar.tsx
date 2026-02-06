import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link href="/" style={styles.brand}>
          Reservation App
        </Link>

        <div style={styles.links}>
          {isAuthenticated ? (
            <>
              <Link href="/profile" style={styles.link}>
                {user?.name || "Profil"}
              </Link>
              <button onClick={logout} style={styles.logoutBtn}>
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" style={styles.loginLink}>
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#3498db",
    textDecoration: "none",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  link: {
    color: "#555",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
    padding: "0.4rem 0.75rem",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  loginLink: {
    color: "#3498db",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    padding: "0.5rem 1rem",
    border: "1px solid #3498db",
    borderRadius: "4px",
  },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
  },
};
