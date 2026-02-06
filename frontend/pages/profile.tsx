import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { getCurrentUser, updateProfile } from "../lib/api";
import { showToast } from "../components/Toast";

interface User {
  name: string;
  email: string;
  role: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const userData: User = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Erreur lors du chargement du profil:", err);
          setError(err.message);

          if (err.message.includes("401") || err.message.includes("403")) {
            localStorage.removeItem("token");
            router.push("/login");
          }
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

  const openEditForm = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setFormErrors({});
    setEditing(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!editName.trim()) {
      errors.name = "Le nom est requis";
    } else if (editName.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères";
    }

    if (!editEmail.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      errors.email = "Format d'email invalide";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });
      setUser(updated);
      setEditing(false);
      showToast("Profil mis à jour avec succès", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

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

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/")} style={styles.button}>
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Mon Profil</h1>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {!editing ? (
            <>
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

              <button onClick={openEditForm} style={styles.buttonEdit}>
                ✎ Modifier le profil
              </button>
            </>
          ) : (
            <form onSubmit={handleEditSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (formErrors.name)
                      setFormErrors((p) => ({ ...p, name: undefined }));
                  }}
                  style={{
                    ...styles.input,
                    borderColor: formErrors.name ? "#e74c3c" : "#ddd",
                  }}
                  placeholder="Votre nom"
                />
                {formErrors.name && (
                  <span style={styles.fieldError}>{formErrors.name}</span>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    if (formErrors.email)
                      setFormErrors((p) => ({ ...p, email: undefined }));
                  }}
                  style={{
                    ...styles.input,
                    borderColor: formErrors.email ? "#e74c3c" : "#ddd",
                  }}
                  placeholder="votre@email.com"
                />
                {formErrors.email && (
                  <span style={styles.fieldError}>{formErrors.email}</span>
                )}
              </div>

              <div style={styles.infoGroup}>
                <label style={styles.label}>Rôle</label>
                <p style={styles.value}>
                  <span style={styles.badge}>{user?.role || "user"}</span>
                </p>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  style={styles.buttonSecondary}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.buttonSave,
                    opacity: saving ? 0.6 : 1,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={styles.actions}>
          <button
            onClick={() => router.push("/")}
            style={styles.buttonSecondary}
          >
            Retour à l&apos;accueil
          </button>
          <button onClick={handleLogout} style={styles.buttonDanger}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  buttonEdit: {
    padding: "0.6rem 1.25rem",
    borderRadius: "4px",
    border: "2px solid #3498db",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    backgroundColor: "transparent",
    color: "#3498db",
    alignSelf: "center",
    marginTop: "0.5rem",
  },
  buttonSave: {
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    backgroundColor: "#2ecc71",
    color: "white",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  fieldError: {
    color: "#e74c3c",
    fontSize: "0.8rem",
    marginTop: "0.15rem",
  },
};
