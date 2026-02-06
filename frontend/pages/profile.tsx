import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { updateProfile } from "../lib/api";
import { showToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

interface FormErrors {
  name?: string;
  email?: string;
}

export default function Profile() {
  const { user, loading, isAuthenticated, logout, setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

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
      showToast("Profil mis \u00e0 jour avec succ\u00e8s", "success");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center p-12 bg-white rounded-lg shadow-md">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Mon Profil
        </h1>

        <div className="flex flex-col gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {!editing ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nom
                </label>
                <p className="text-lg text-gray-800">
                  {user?.name || "Non renseigné"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </label>
                <p className="text-lg text-gray-800">
                  {user?.email || "Non renseigné"}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rôle
                </label>
                <p>
                  <span className="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                    {user?.role || "user"}
                  </span>
                </p>
              </div>

              <button
                onClick={openEditForm}
                className="self-center mt-2 px-5 py-2 border-2 border-blue-500 text-blue-500 rounded-md font-medium hover:bg-blue-50 transition-colors cursor-pointer"
              >
                ✎ Modifier le profil
              </button>
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <Input
                label="Nom"
                type="text"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  if (formErrors.name)
                    setFormErrors((p) => ({ ...p, name: undefined }));
                }}
                error={formErrors.name}
                placeholder="Votre nom"
              />

              <Input
                label="Email"
                type="email"
                value={editEmail}
                onChange={(e) => {
                  setEditEmail(e.target.value);
                  if (formErrors.email)
                    setFormErrors((p) => ({ ...p, email: undefined }));
                }}
                error={formErrors.email}
                placeholder="votre@email.com"
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rôle
                </label>
                <p>
                  <span className="inline-block px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                    {user?.role || "user"}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <Button variant="secondary" onClick={() => router.push("/")}>
            Retour à l&apos;accueil
          </Button>
          <Button variant="danger" onClick={logout}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
