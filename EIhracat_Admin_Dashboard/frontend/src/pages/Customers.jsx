import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";
import FormMessage from "../components/FormMessage";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ ad: "", soyad: "", email: "", telefon: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => apiGet("/customers?limit=200").then(setRows).catch(err => setError(err.message));
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await apiPost("/customers", form);
      setSuccess("Müşteri başarıyla eklendi.");
      setForm({ ad: "", soyad: "", email: "", telefon: "" });
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="page-grid two-cols">
      <GlassCard title="Müşteriler" subtitle="Yeni müşteri ekleme ve mevcut kayıtları görüntüleme">
        <TableView rows={rows.slice(0, 50)} />
      </GlassCard>
      <GlassCard title="Yeni Müşteri" subtitle="Kullanım Senaryosu 1">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Ad" value={form.ad} onChange={e => setForm({ ...form, ad: e.target.value })} />
          <input placeholder="Soyad" value={form.soyad} onChange={e => setForm({ ...form, soyad: e.target.value })} />
          <input placeholder="E-posta" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Telefon" value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
          <button className="primary-btn" type="submit">Müşteri Ekle</button>
        </form>
        <FormMessage error={error} success={success} />
      </GlassCard>
    </div>
  );
}
