import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Addresses from "./pages/Addresses";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Shipping from "./pages/Shipping";
import Customs from "./pages/Customs";
import Returns from "./pages/Returns";

const nav = [
  { to: "/", label: "Dashboard", subtitle: "Genel bakış ve canlı özet", icon: "✦" },
  { to: "/customers", label: "Müşteriler", subtitle: "Kişi ve iletişim kayıtları", icon: "☺" },
  { to: "/addresses", label: "Adresler", subtitle: "Teslimat ve fatura adresleri", icon: "⌂" },
  { to: "/products", label: "Ürünler", subtitle: "Stok ve ürün kataloğu", icon: "◫" },
  { to: "/orders", label: "Siparişler", subtitle: "Sipariş akışı ve kalemler", icon: "◎" },
  { to: "/payments", label: "Ödemeler", subtitle: "Tahsilat ve ödeme durumları", icon: "₺" },
  { to: "/shipping", label: "Kargo", subtitle: "Gönderi ve teslim takibi", icon: "→" },
  { to: "/customs", label: "Gümrük", subtitle: "Vergi ve süreç yönetimi", icon: "◇" },
  { to: "/returns", label: "İadeler", subtitle: "İade talepleri ve kayıtlar", icon: "↺" }
];

function LayoutHeader() {
  const location = useLocation();
  const current = nav.find((item) => item.to === location.pathname) || nav[0];

  return (
    <header className="topbar soft-panel">
      <div className="topbar-left">
        <div className="topbar-orb">✦</div>
        <div>
          <div className="topbar-title">{current.label}</div>
          <div className="topbar-subtitle">{current.subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="soft-chip active-chip">NF3 canlı bağlantı</div>
        <div className="soft-chip">LocalDB · SQL Server</div>
        <div className="soft-chip subtle-chip">Soft lilac UI</div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="page-bg">
      <div className="page-glow glow-1" />
      <div className="page-glow glow-2" />
      <div className="page-glow glow-3" />

      <div className="app-shell">
        <aside className="sidebar soft-panel">
          <div className="brand-block">
            <div className="brand-row">
              <div className="brand-orb">
                <span>◌</span>
              </div>
              <div className="brand-copy">
                <div className="brand-kicker">Neumorphic Studio</div>
                <div className="brand-title">E-İhracat</div>
              </div>
            </div>

            <p className="brand-subtitle">
              Sipariş, gümrük, ödeme ve iade takibini daha yumuşak, daha modern bir arayüzle yönet.
            </p>

            <div className="brand-pills">
              <span className="brand-pill">Pastel tema</span>
              <span className="brand-pill">Canlı veri</span>
            </div>
          </div>

          <nav className="nav-list">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-copy">
                  <strong>{item.label}</strong>
                  <small>{item.subtitle}</small>
                </span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="main-shell">
          <LayoutHeader />
          <section className="main-stage soft-panel">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/customs" element={<Customs />} />
              <Route path="/returns" element={<Returns />} />
            </Routes>
          </section>
        </main>
      </div>
    </div>
  );
}
