export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", letterSpacing: "-0.02em", margin: 0 }}>
          Murmur
        </h1>
        <p style={{ color: "#71717A", marginTop: "0.5rem" }}>
          Remember every conversation.
        </p>
      </div>
    </main>
  );
}
