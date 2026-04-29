import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import GlassCard from "../components/GlassCard";
import StatCard from "../components/StatCard";
import TableView from "../components/TableView";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    apiGet("/orders/summary?limit=50").then(setOrders).catch(console.error);
  }, []);

  const teslimEdilen = orders.filter((r) => r.KargoDurumu === "Teslim Edildi").length;
  const gumrukte = orders.filter((r) => ["İncelemede", "Belge Bekleniyor"].includes(r.GumrukDurumu)).length;
  const iadeli = orders.filter((r) => r.IadeDurumu).length;
  const ulkeler = useMemo(() => new Set(orders.map((r) => r.TeslimatUlkesi).filter(Boolean)).size, [orders]);

  return (
    <div className="page-grid">
      <GlassCard>
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Cute neumorphic redesign</div>
            <h1 className="hero-title">Kontrol paneli artık daha yumuşak, daha temiz ve daha canlı.</h1>
            <p className="hero-text">
              Gerçek SQL Server veritabanına bağlı bu panel; sipariş, kargo, gümrük ve iade verilerini pastel tonlarda daha okunur bir deneyimle gösterir.
            </p>
            <div className="hero-pills">
              <span className="hero-pill">LocalDB bağlı</span>
              <span className="hero-pill">Vite aktif</span>
              <span className="hero-pill">Canlı veriler</span>
            </div>
          </div>

          <div className="hero-aside recessed-panel">
            <span className="hero-aside-label">Takip edilen ülke</span>
            <strong>{ulkeler}</strong>
            <small>Özet ekranındaki aktif teslimat ülkesi sayısı</small>
          </div>
        </div>
      </GlassCard>

      <div className="stats-grid stats-grid-dashboard">
        <StatCard label="Yüklenen Sipariş" value={orders.length} />
        <StatCard label="Teslim Edilen" value={teslimEdilen} />
        <StatCard label="Gümrükte Bekleyen" value={gumrukte} />
        <StatCard label="İade Süreci" value={iadeli} />
      </div>

      <GlassCard title="Sipariş Özeti" subtitle="vw_SiparisTamOzet görünümünden ilk kayıtlar">
        <TableView rows={orders.slice(0, 12)} />
      </GlassCard>
    </div>
  );
}
