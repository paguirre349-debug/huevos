import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, Boxes, Egg, Users, Truck,
  Package, Wallet, FileBarChart, Target, Sparkles, Settings,
  Search, Plus, Bell, TrendingUp, TrendingDown, Command,
  ArrowUpRight, ArrowDownRight, Clock, CreditCard, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid,
} from "recharts";

/* ============================================================
   DESIGN TOKENS  (del brief de Patricio)
   ============================================================ */
const C = {
  bg: "#0B0F19",
  card: "#121826",
  border: "#1F2937",
  text: "#FFFFFF",
  sub: "#9CA3AF",
  amber: "#F59E0B",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#3B82F6",
};

/* ============================================================
   MOCK DATA
   ============================================================ */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const last7 = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const dia = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()];
  return { name: dia, ventas: rand(18000, 62000), maples: rand(40, 130) };
});

const last30 = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  ventas: rand(15000, 65000),
}));

const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const last12 = meses.map((m) => ({ name: m, ventas: rand(600000, 1400000), ganancia: rand(180000, 500000) }));

const porHora = Array.from({ length: 13 }, (_, i) => ({
  name: `${8 + i}h`,
  ventas: rand(1000, 14000),
}));

const metodoPago = [
  { name: "Efectivo", value: 52, color: C.green },
  { name: "Transferencia", value: 33, color: C.blue },
  { name: "Mercado Pago", value: 15, color: C.amber },
];

const porProducto = [
  { name: "Maple x30", value: 48 },
  { name: "Docena", value: 27 },
  { name: "Media docena", value: 14 },
  { name: "Huevo de color", value: 7 },
  { name: "Suelto", value: 4 },
];

const sparkUp = Array.from({ length: 12 }, () => ({ v: rand(20, 100) }));

// Heatmap: 20 semanas x 7 días
const heatWeeks = 20;
const heatmap = Array.from({ length: heatWeeks }, () =>
  Array.from({ length: 7 }, () => rand(0, 100))
);

const insights = [
  { icon: TrendingUp, color: C.green, title: "Mejor día", value: "Sábado", detail: "+38% sobre el promedio semanal" },
  { icon: Clock, color: C.amber, title: "Hora pico", value: "10–12 h", detail: "El 41% de las ventas del día" },
  { icon: Egg, color: C.blue, title: "Más rentable", value: "Maple x30", detail: "Deja el mayor margen: 32%" },
  { icon: TrendingDown, color: C.red, title: "Sin rotación", value: "Huevo de color", detail: "12 días sin una venta" },
];

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: ShoppingCart, label: "Ventas", key: "ventas" },
  { icon: Boxes, label: "Stock", key: "stock" },
  { icon: Egg, label: "Productos", key: "productos" },
  { icon: Users, label: "Clientes", key: "clientes" },
  { icon: Truck, label: "Proveedores", key: "proveedores" },
  { icon: Package, label: "Compras", key: "compras" },
  { icon: Wallet, label: "Gastos", key: "gastos" },
  { icon: FileBarChart, label: "Reportes", key: "reportes" },
  { icon: Target, label: "Objetivos", key: "objetivos" },
  { icon: Sparkles, label: "IA", key: "ia" },
  { icon: Settings, label: "Configuración", key: "config" },
];

/* ============================================================
   HELPERS
   ============================================================ */
const money = (n) => "$" + n.toLocaleString("es-AR");
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

/* ============================================================
   SPARKLINE
   ============================================================ */
function Spark({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
          fill={`url(#sp-${color})`} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */
function StatCard({ icon: Icon, label, value, delta, positive, spark, sparkColor, i }) {
  return (
    <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show"
      whileHover={{ y: -3 }}
      style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20 }}
      className="p-5 relative overflow-hidden transition-shadow hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${sparkColor}1A` }}>
          <Icon size={18} style={{ color: sparkColor }} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
          style={{ background: positive ? `${C.green}1A` : `${C.red}1A`, color: positive ? C.green : C.red }}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {delta}
        </div>
      </div>
      <div className="text-sm mb-1" style={{ color: C.sub }}>{label}</div>
      <div className="text-3xl font-bold tracking-tight mb-2" style={{ color: C.text }}>{value}</div>
      <div className="h-10 -mx-1"><Spark data={spark} color={sparkColor} /></div>
    </motion.div>
  );
}

/* ============================================================
   CHART CARD
   ============================================================ */
function ChartCard({ title, subtitle, children, right, span = 1, i = 0 }) {
  return (
    <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show"
      style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, gridColumn: `span ${span}` }}
      className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold" style={{ color: C.text }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: C.sub }}>{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </motion.div>
  );
}

const ChartTip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0B0F19", border: `1px solid ${C.border}`, borderRadius: 12 }}
      className="px-3 py-2 text-xs shadow-xl">
      <div style={{ color: C.sub }} className="mb-1">{label}</div>
      {payload.map((p, idx) => (
        <div key={idx} style={{ color: p.color || p.stroke || C.text }} className="font-semibold">
          {fmt ? fmt(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

/* ============================================================
   HEATMAP
   ============================================================ */
function Heatmap() {
  const shade = (v) => {
    if (v < 20) return C.border;
    if (v < 40) return `${C.amber}33`;
    if (v < 60) return `${C.amber}66`;
    if (v < 80) return `${C.amber}AA`;
    return C.amber;
  };
  return (
    <div className="flex gap-[3px]">
      {heatmap.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((v, di) => (
            <motion.div key={di}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (wi * 7 + di) * 0.004 }}
              whileHover={{ scale: 1.35 }}
              title={`${v} maples`}
              style={{ width: 13, height: 13, borderRadius: 4, background: shade(v) }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   COMMAND PALETTE
   ============================================================ */
function CommandPalette({ open, onClose, onNav }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);
  const items = nav.filter((n) => n.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-start justify-center pt-32"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}>
          <motion.div onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, y: -8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, width: 560 }}
            className="overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: C.border }}>
              <Search size={18} style={{ color: C.sub }} />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar pantalla o acción…"
                className="bg-transparent outline-none flex-1 text-sm"
                style={{ color: C.text }} />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.border, color: C.sub }}>ESC</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto py-2">
              {items.map((n) => (
                <button key={n.key} onClick={() => { onNav(n.key); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition"
                  style={{ color: C.text }}>
                  <n.icon size={16} style={{ color: C.sub }} />
                  {n.label}
                  <ChevronRight size={14} className="ml-auto" style={{ color: C.sub }} />
                </button>
              ))}
              {items.length === 0 && (
                <div className="px-4 py-6 text-sm text-center" style={{ color: C.sub }}>Sin resultados</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   QUICK SALE SHEET
   ============================================================ */
function QuickSale({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed right-0 top-0 bottom-0 z-50 w-[420px] p-6 overflow-y-auto"
            style={{ background: C.card, borderLeft: `1px solid ${C.border}` }}
            initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: C.text }}>Nueva venta</h2>
              <button onClick={onClose} className="text-2xl leading-none" style={{ color: C.sub }}>×</button>
            </div>
            {[
              { label: "Producto", el: "select", opts: ["Maple x30", "Docena", "Media docena", "Huevo de color", "Suelto"] },
              { label: "Cantidad", el: "input", ph: "1" },
              { label: "Precio", el: "input", ph: "$8.500" },
              { label: "Cliente", el: "input", ph: "Buscar o dejar en blanco" },
              { label: "Forma de pago", el: "select", opts: ["Efectivo", "Transferencia", "Mercado Pago"] },
              { label: "Observaciones", el: "textarea", ph: "Opcional" },
            ].map((f) => (
              <div key={f.label} className="mb-4">
                <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>{f.label}</label>
                {f.el === "select" ? (
                  <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
                    {f.opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.el === "textarea" ? (
                  <textarea rows={2} placeholder={f.ph}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
                ) : (
                  <input placeholder={f.ph}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }} />
                )}
              </div>
            ))}
            <motion.button whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl font-semibold text-sm mt-2"
              style={{ background: C.amber, color: "#0B0F19" }}>
              Guardar venta
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   PLACEHOLDER (pantallas aún no construidas)
   ============================================================ */
function Placeholder({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${C.amber}1A` }}>
        <Sparkles size={24} style={{ color: C.amber }} />
      </div>
      <h2 className="text-xl font-bold mb-1" style={{ color: C.text }}>{label}</h2>
      <p className="text-sm" style={{ color: C.sub }}>Esta pantalla llega en el próximo paso del desarrollo.</p>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Hero cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard i={0} icon={Egg} label="Huevos vendidos hoy" value="2.340" delta="12%" positive
          spark={sparkUp} sparkColor={C.amber} />
        <StatCard i={1} icon={Wallet} label="Facturación hoy" value={money(184500)} delta="8%" positive
          spark={sparkUp} sparkColor={C.green} />
        <StatCard i={2} icon={TrendingUp} label="Ganancia hoy" value={money(52300)} delta="5%" positive
          spark={sparkUp} sparkColor={C.blue} />
        <StatCard i={3} icon={Boxes} label="Stock actual" value="78 maples" delta="9%" positive={false}
          spark={sparkUp} sparkColor={C.amber} />
      </div>

      {/* Secundarias */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { l: "Cajones pendientes", v: "6", d: "vs ayer", pos: true, delta: "2" },
          { l: "Ticket promedio", v: money(6420), d: "vs semana pasada", pos: true, delta: "4%" },
          { l: "Maples vendidos hoy", v: "78", d: "vs ayer", pos: true, delta: "11%" },
          { l: "Margen del día", v: "28,3%", d: "vs semana pasada", pos: false, delta: "1,2%" },
        ].map((s, i) => (
          <motion.div key={s.l} custom={i + 4} variants={fadeUp} initial="hidden" animate="show"
            style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20 }}
            className="p-5">
            <div className="text-sm mb-2" style={{ color: C.sub }}>{s.l}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold" style={{ color: C.text }}>{s.v}</div>
              <div className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: s.pos ? C.green : C.red }}>
                {s.pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{s.delta}
              </div>
            </div>
            <div className="text-[11px] mt-1" style={{ color: C.sub }}>{s.d}</div>
          </motion.div>
        ))}
      </div>

      {/* Gráficos fila principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard i={8} title="Ventas últimos 7 días" subtitle="Facturación diaria" span={2}
          right={<span className="text-xs px-2 py-1 rounded-lg" style={{ background: `${C.amber}1A`, color: C.amber }}>+14% vs semana previa</span>}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={last7} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="area7" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.amber} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" stroke={C.sub} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={C.sub} fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<ChartTip fmt={money} />} cursor={{ stroke: C.border }} />
              <Area type="monotone" dataKey="ventas" stroke={C.amber} strokeWidth={2.5} fill="url(#area7)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard i={9} title="Método de pago" subtitle="Distribución de hoy">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={metodoPago} dataKey="value" innerRadius={55} outerRadius={80}
                paddingAngle={3} strokeWidth={0}>
                {metodoPago.map((m) => <Cell key={m.name} fill={m.color} />)}
              </Pie>
              <Tooltip content={<ChartTip fmt={(v) => v + "%"} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {metodoPago.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2" style={{ color: C.sub }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: m.color }} />{m.name}
                </div>
                <span style={{ color: C.text }} className="font-semibold">{m.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Heatmap + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard i={10} title="Actividad de ventas" subtitle="Últimas 20 semanas · más oscuro = más maples" span={2}>
          <div className="overflow-x-auto pb-2"><Heatmap /></div>
          <div className="flex items-center gap-2 mt-4 text-[11px]" style={{ color: C.sub }}>
            Menos
            {[C.border, `${C.amber}33`, `${C.amber}66`, `${C.amber}AA`, C.amber].map((c, i) => (
              <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
            ))}
            Más
          </div>
        </ChartCard>

        <ChartCard i={11} title="Análisis automático" subtitle="Detectado por el sistema">
          <div className="space-y-3">
            {insights.map((ins) => (
              <div key={ins.title} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: C.bg }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${ins.color}1A` }}>
                  <ins.icon size={15} style={{ color: ins.color }} />
                </div>
                <div>
                  <div className="text-[11px]" style={{ color: C.sub }}>{ins.title}</div>
                  <div className="text-sm font-semibold" style={{ color: C.text }}>{ins.value}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: C.sub }}>{ins.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Fila secundaria de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard i={12} title="Ventas por hora" subtitle="Promedio del día">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={porHora} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke={C.sub} fontSize={10} tickLine={false} axisLine={false} interval={1} />
              <YAxis hide />
              <Tooltip content={<ChartTip fmt={money} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="ventas" radius={[4, 4, 0, 0]} fill={C.blue} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard i={13} title="Ventas por producto" subtitle="Participación %">
          {porProducto.map((p) => (
            <div key={p.name} className="mb-2.5">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: C.sub }}>{p.name}</span>
                <span style={{ color: C.text }} className="font-semibold">{p.value}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: C.bg }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.value}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full" style={{ background: C.amber }} />
              </div>
            </div>
          ))}
        </ChartCard>

        <ChartCard i={14} title="Facturación 12 meses" subtitle="Tendencia anual">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={last12} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="name" stroke={C.sub} fontSize={10} tickLine={false} axisLine={false} interval={1} />
              <YAxis hide />
              <Tooltip content={<ChartTip fmt={money} />} />
              <Line type="monotone" dataKey="ventas" stroke={C.green} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="ganancia" stroke={C.amber} strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
export default function ErpHuevos() {
  const [active, setActive] = useState("dashboard");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") { setCmdOpen(false); setSaleOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}
      className="flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col p-4"
        style={{ borderRight: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.amber }}>
            <Egg size={20} color="#0B0F19" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">Don Stefano</div>
            <div className="text-[11px]" style={{ color: C.sub }}>ERP Huevos</div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const on = active === n.key;
            return (
              <button key={n.key} onClick={() => setActive(n.key)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all relative"
                style={{ background: on ? `${C.amber}14` : "transparent", color: on ? C.text : C.sub }}>
                {on && <motion.span layoutId="active-bar"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full" style={{ background: C.amber }} />}
                <n.icon size={17} style={{ color: on ? C.amber : C.sub }} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 px-2 pt-4 mt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{ background: `${C.blue}33`, color: C.blue }}>P</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Patricio</div>
            <div className="text-[11px] truncate" style={{ color: C.sub }}>Dueño</div>
          </div>
          <Settings size={16} style={{ color: C.sub }} />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center gap-4"
          style={{ background: "rgba(11,15,25,0.8)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h1 className="font-bold text-lg leading-tight">Hola Patricio 👋</h1>
            <p className="text-xs capitalize" style={{ color: C.sub }}>{today}</p>
          </div>

          <button onClick={() => setCmdOpen(true)}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-64 transition hover:brightness-125"
            style={{ background: C.card, border: `1px solid ${C.border}`, color: C.sub }}>
            <Search size={15} />
            <span className="flex-1 text-left">Buscar…</span>
            <kbd className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: C.border }}>
              <Command size={10} />K
            </kbd>
          </button>

          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSaleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: C.amber, color: "#0B0F19" }}>
            <Plus size={16} /> Venta
          </motion.button>

          <button className="relative w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Bell size={17} style={{ color: C.sub }} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: C.red }} />
          </button>
        </header>

        {/* Content */}
        <main className="p-6">
          {active === "dashboard" ? <Dashboard /> : <Placeholder label={nav.find((n) => n.key === active)?.label} />}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNav={setActive} />
      <QuickSale open={saleOpen} onClose={() => setSaleOpen(false)} />
    </div>
  );
}
