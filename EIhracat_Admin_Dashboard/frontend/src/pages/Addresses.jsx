import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";
import FormMessage from "../components/FormMessage";

export default function Addresses() {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({ ulkeler: [] });
  const [form, setForm] = useState({ ulkeId: "", sehir: "", postaKodu: "", acikAdres: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => apiGet("/addresses?limit=200").then(setRows).catch(err => setError(err.message));

  useEffect(() => {
    load();
    apiGet("/lookups/all").then(data => setLookups({ ulkeler: data.ulkeler || [] })).catch(console.error);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await apiPost("/addresses", { ...form, ulkeId: Number(form.ulkeId) });
      setSuccess("Adres başarıyla eklendi.");
      setForm({ ulkeId: "", sehir: "", postaKodu: "", acikAdres: "" });
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="page-grid two-cols">
      <GlassCard title="Adresler" subtitle="Tanımlı adres kayıtları">
        <TableView rows={rows.slice(0, 50)} />
      </GlassCard>
      <GlassCard title="Yeni Adres" subtitle="Kullanım Senaryosu 2">
        <form className="form-grid" onSubmit={handleSubmit}>
          <select value={form.ulkeId} onChange={e => setForm({ ...form, ulkeId: e.target.value })}>
            <option value="">Ülke seçin</option>
            {lookups.ulkeler.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
          <input placeholder="Şehir" value={form.sehir} onChange={e => setForm({ ...form, sehir: e.target.value })} />
          <input placeholder="Posta Kodu" value={form.postaKodu} onChange={e => setForm({ ...form, postaKodu: e.target.value })} />
          <textarea placeholder="Açık Adres" value={form.acikAdres} onChange={e => setForm({ ...form, acikAdres: e.target.value })} />
          <button className="primary-btn" type="submit">Adres Ekle</button>
        </form>
        <FormMessage error={error} success={success} />
      </GlassCard>
    </div>
  );
}
