export default function TagList({ tags }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {(tags || []).map(t => (
        <span key={t} className="tag">{t}</span>
      ))}
    </div>
  );
}
