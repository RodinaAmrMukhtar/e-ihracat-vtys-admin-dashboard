import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";
import FormMessage from "../components/FormMessage";

export default function Returns() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ siparisNo: "", iadeNedenAdi: "Hasarlı ürün", aciklama: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => apiGet("/returns?limit=200").then(setRows).catch(err => setError(err.message));
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await apiPost("/orders/return-request", form);
      setSuccess("İade talebi oluşturuldu.");
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="page-grid two-cols">
      <GlassCard title="İade Talepleri" subtitle="Mevcut iade kayıtları">
        <TableView rows={rows.slice(0, 50)} />
      </GlassCard>
      <GlassCard title="Yeni İade Talebi" subtitle="Kullanım Senaryosu 9">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Sipariş No" value={form.siparisNo} onChange={e => setForm({ ...form, siparisNo: e.target.value })} />
          <input placeholder="İade Nedeni" value={form.iadeNedenAdi} onChange={e => setForm({ ...form, iadeNedenAdi: e.target.value })} />
          <textarea placeholder="Açıklama" value={form.aciklama} onChange={e => setForm({ ...form, aciklama: e.target.value })} />
          <button className="primary-btn" type="submit">İade Talebi Oluştur</button>
        </form>
        <FormMessage error={error} success={success} />
      </GlassCard>
    </div>
  );
}
