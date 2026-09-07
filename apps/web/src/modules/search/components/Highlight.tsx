export function Highlight({ text, match }: { text: string; match: string }) {
  if (!match) return <>{text}</>;
  const i = text.toLowerCase().indexOf(match.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: "var(--manga-100)", color: "var(--ink-800)", padding: "0 2px", borderRadius: 3 }}>
        {text.slice(i, i + match.length)}
      </mark>
      {text.slice(i + match.length)}
    </>
  );
}
