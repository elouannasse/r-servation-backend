import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Reservation App</h1>
      <nav style={{ marginTop: "2rem" }}>
        <Link
          href="/profile"
          style={{
            marginRight: "1rem",
            color: "blue",
            textDecoration: "underline",
          }}
        >
          Voir mon profil
        </Link>
      </nav>
    </div>
  );
}
