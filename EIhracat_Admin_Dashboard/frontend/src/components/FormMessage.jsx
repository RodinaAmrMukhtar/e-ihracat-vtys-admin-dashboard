export default function FormMessage({ error, success }) {
  if (error) return <div className="form-message error">{error}</div>;
  if (success) return <div className="form-message success">{success}</div>;
  return null;
}
