import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Identifiants incorrects");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      router.push("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Connexion</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="votre@email.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ? Contactez l'administrateur
        </p>
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
    maxWidth: "400px",
    width: "100%",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "2rem",
    color: "#333",
    textAlign: "center",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c33",
    padding: "0.75rem",
    borderRadius: "4px",
    marginBottom: "1rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#666",
    fontSize: "0.875rem",
  },
};
