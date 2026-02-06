import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCurrentUser } from "../lib/api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        // Vérifier si un token existe
        const token = localStorage.getItem("token");
        if (!token) {
          // Pas de token, rediriger vers la page de connexion
          router.push("/login");
          return;
        }

        // Récupérer les données de l'utilisateur
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err);
        setError(err.message);

        // Si erreur d'authentification, rediriger vers login
        if (err.message.includes("401") || err.message.includes("403")) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Affichage du loader
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <div style={styles.spinner}></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/")} style={styles.button}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Affichage du profil
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mon Profil</h1>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Nom</label>
            <p style={styles.value}>{user?.name || "Non renseigné"}</p>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Email</label>
            <p style={styles.value}>{user?.email || "Non renseigné"}</p>
          </div>

          <div style={styles.infoGroup}>
            <label style={styles.label}>Rôle</label>
            <p style={styles.value}>
              <span style={styles.badge}>{user?.role || "user"}</span>
            </p>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            onClick={() => router.push("/")}
            style={styles.buttonSecondary}
          >
            Retour à l'accueil
          </button>
          <button onClick={handleLogout} style={styles.buttonDanger}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "2rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "2rem",
    maxWidth: "600px",
    width: "100%",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "2rem",
    color: "#333",
    textAlign: "center",
  },
  loader: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  spinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 1rem",
  },
  error: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    margin: "0 auto 1rem",
  },
  infoGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "1.125rem",
    color: "#333",
    margin: 0,
  },
  badge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    backgroundColor: "#3498db",
    color: "white",
    borderRadius: "12px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
    justifyContent: "center",
  },
  button: {
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    backgroundColor: "#3498db",
    color: "white",
  },
  buttonSecondary: {
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    border: "1px solid #ddd",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    backgroundColor: "white",
    color: "#333",
  },
  buttonDanger: {
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    backgroundColor: "#e74c3c",
    color: "white",
  },
};
