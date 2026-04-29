import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";
import FormMessage from "../components/FormMessage";

export default function Shipping() {
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lookups, setLookups] = useState({ kargoFirmalari: [], kargoDurumlari: [] });
  const [form, setForm] = useState({ siparisId: "", kargoFirmasiId: "", kargoDurumId: "", cikisTarihi: "", tahminiTeslimTarihi: "", teslimTarihi: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => apiGet("/shipping?limit=200").then(setRows).catch(err => setError(err.message));
  useEffect(() => {
    load();
    Promise.all([apiGet("/lookups/all"), apiGet("/orders/summary?limit=200")]).then(([lk, os]) => {
      setLookups(lk);
      setOrders(os);
    }).catch(console.error);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await apiPost("/shipping", {
        siparisId: Number(form.siparisId),
        kargoFirmasiId: Number(form.kargoFirmasiId),
        kargoDurumId: Number(form.kargoDurumId),
        cikisTarihi: form.cikisTarihi || null,
        tahminiTeslimTarihi: form.tahminiTeslimTarihi || null,
        teslimTarihi: form.teslimTarihi || null
      });
      setSuccess("Kargo kaydı oluşturuldu.");
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="page-grid two-cols">
      <GlassCard title="Kargo Kayıtları" subtitle="Takip numarası ve durum yönetimi">
        <TableView rows={rows.slice(0, 50)} />
      </GlassCard>
      <GlassCard title="Yeni Kargo" subtitle="Kullanım Senaryosu 7">
        <form className="form-grid" onSubmit={handleSubmit}>
          <select value={form.siparisId} onChange={e => setForm({ ...form, siparisId: e.target.value })}>
            <option value="">Sipariş seçin</option>
            {orders.map(o => <option key={o.SiparisID} value={o.SiparisID}>{o.SiparisNo}</option>)}
          </select>
          <select value={form.kargoFirmasiId} onChange={e => setForm({ ...form, kargoFirmasiId: e.target.value })}>
            <option value="">Kargo firması</option>
            {lookups.kargoFirmalari?.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
          <select value={form.kargoDurumId} onChange={e => setForm({ ...form, kargoDurumId: e.target.value })}>
            <option value="">Kargo durumu</option>
            {lookups.kargoDurumlari?.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
          <input type="datetime-local" value={form.cikisTarihi} onChange={e => setForm({ ...form, cikisTarihi: e.target.value })} />
          <input type="datetime-local" value={form.tahminiTeslimTarihi} onChange={e => setForm({ ...form, tahminiTeslimTarihi: e.target.value })} />
          <input type="datetime-local" value={form.teslimTarihi} onChange={e => setForm({ ...form, teslimTarihi: e.target.value })} />
          <button className="primary-btn" type="submit">Kargo Oluştur</button>
        </form>
        <FormMessage error={error} success={success} />
      </GlassCard>
    </div>
  );
}
