function formatCell(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  return String(value);
}

export default function TableView({ rows }) {
  const headers = Object.keys(rows?.[0] || {});
  if (!headers.length) return <div className="muted">Kayıt bulunamadı.</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {headers.map((h) => <td key={h}>{formatCell(row[h])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
