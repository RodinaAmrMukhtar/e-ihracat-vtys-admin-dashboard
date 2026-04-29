import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";
import GlassCard from "../components/GlassCard";
import TableView from "../components/TableView";
import FormMessage from "../components/FormMessage";

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({ odemeYontemleri: [], odemeDurumlari: [] });
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ siparisId: "", odemeYontemiId: "", odemeDurumId: "", odemeTutari: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => apiGet("/payments?limit=200").then(setRows).catch(err => setError(err.message));
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
      await apiPost("/payments", {
        siparisId: Number(form.siparisId),
        odemeYontemiId: Number(form.odemeYontemiId),
        odemeDurumId: Number(form.odemeDurumId),
        odemeTutari: Number(form.odemeTutari)
      });
      setSuccess("Ödeme kaydı oluşturuldu.");
      load();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="page-grid two-cols">
      <GlassCard title="Ödemeler" subtitle="Siparişe bağlı ödeme kayıtları">
        <TableView rows={rows.slice(0, 50)} />
      </GlassCard>
      <GlassCard title="Yeni Ödeme" subtitle="Kullanım Senaryosu 6">
        <form className="form-grid" onSubmit={handleSubmit}>
          <select value={form.siparisId} onChange={e => setForm({ ...form, siparisId: e.target.value })}>
            <option value="">Sipariş seçin</option>
            {orders.map(o => <option key={o.SiparisID} value={o.SiparisID}>{o.SiparisNo}</option>)}
          </select>
          <select value={form.odemeYontemiId} onChange={e => setForm({ ...form, odemeYontemiId: e.target.value })}>
            <option value="">Ödeme yöntemi</option>
            {lookups.odemeYontemleri?.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
          <select value={form.odemeDurumId} onChange={e => setForm({ ...form, odemeDurumId: e.target.value })}>
            <option value="">Ödeme durumu</option>
            {lookups.odemeDurumlari?.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
          <input type="number" step="0.01" placeholder="Ödeme tutarı" value={form.odemeTutari} onChange={e => setForm({ ...form, odemeTutari: e.target.value })} />
          <button className="primary-btn" type="submit">Ödeme Oluştur</button>
        </form>
        <FormMessage error={error} success={success} />
      </GlassCard>
    </div>
  );
}
