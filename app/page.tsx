import Link from "next/link";

// Placeholder — the real Home screen (the count, set toggle, Start) comes next.
export default function Home() {
  return (
    <main style={{ padding: "2rem 1rem", margin: "auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.4rem" }}>kanahero</h1>
      <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
        Home screen not built yet. Stroke data check:{" "}
        <Link href="/verify" style={{ textDecoration: "underline" }}>
          /verify
        </Link>
      </p>
    </main>
  );
}
