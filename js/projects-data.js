/* ==========================================
   GLITCH SOFTWARE HOUSE - PROJECTS DATA MODULE
   ========================================== */

const PROJECTS_DATA = [
  {
    id: "blackcart",
    title: "BlackCart Storefront",
    subtitle: "High-Performance Modern Website & E-Commerce Storefront",
    category: "website",
    categoryLabel: "Custom Website / E-Commerce",
    isConcept: true,
    summary: "Headless e-commerce storefront & brand website featuring 3D product customization, sub-second page loads, and dark cyber UI.",
    details: "BlackCart showcases our website engineering capabilities. Designed for modern brands requiring instant checkout rendering, SEO optimization, and dark visual storytelling.",
    tags: ["HTML5/CSS3", "JavaScript", "Shopify API", "Web Animations", "PWA"],
    stats: [
      { label: "Lighthouse Score", value: "99/100" },
      { label: "Page Load", value: "< 0.4s" },
      { label: "Mobile Speed", value: "Fast" }
    ],
    features: [
      "Ultra-fluid dark responsive storefront layout",
      "Interactive product customization & instant cart drawer",
      "Headless CMS integration with SEO optimization",
      "Cross-browser sub-second page load performance"
    ],
    mockupType: "blackcart",
    accentColor: "#c77dff"
  },
  {
    id: "biteflow",
    title: "BiteFlow QR System",
    subtitle: "Ultra-Fast Restaurant QR Code Menu & Ordering System",
    category: "qrmenu",
    categoryLabel: "QR Code Menu / Ordering",
    isConcept: true,
    summary: "Instant web QR menu, contactless table ordering, dynamic bill splitting, and zero-latency kitchen display system (KDS).",
    details: "BiteFlow eliminates app downloads with instant PWA QR menu scanning. Diners scan table QR codes, browse interactive menus, order directly, while kitchen staff receive live prioritized tickets.",
    tags: ["QR Scanner", "PWA", "Node.js", "WebSockets", "Stripe API"],
    stats: [
      { label: "Order Speedup", value: "3.5x" },
      { label: "App Download Req", value: "0%" },
      { label: "Table Turnover", value: "+28%" }
    ],
    features: [
      "Instant contactless PWA load in under 400 milliseconds",
      "Live order modification with kitchen station synchronized KDS",
      "Integrated multi-tender bill splitting & tip calculation",
      "Dynamic inventory auto-86 based on stock threshold triggers"
    ],
    mockupType: "biteflow",
    accentColor: "#9d4edd"
  },
  {
    id: "flowdesk",
    title: "FlowDesk SaaS Dashboard",
    subtitle: "Multi-Tenant Enterprise SaaS & Analytics Control Panel",
    category: "dashboard",
    categoryLabel: "Management Dashboard",
    isConcept: true,
    summary: "Unified workspace management, automated recurring subscription telemetry, team RBAC, and executive metrics aggregation.",
    details: "FlowDesk provides enterprise B2B SaaS platforms with an ultra-responsive management control panel. Built with modular widget isolation and real-time chart data visualization.",
    tags: ["JavaScript", "PostgreSQL", "GraphQL", "Data Charts", "RBAC Security"],
    stats: [
      { label: "Tenant Isolation", value: "100%" },
      { label: "Report Gen Time", value: "0.2s" },
      { label: "Role Granularity", value: "Fine-Grained" }
    ],
    features: [
      "Multi-tenant database isolation & security permissions",
      "Real-time revenue, usage, and cohort retention analytics charts",
      "Role-Based Access Control (RBAC) with team user management",
      "Customizable drag-and-drop dark widget dashboard layout"
    ],
    mockupType: "flowdesk",
    accentColor: "#00f0ff"
  },
  {
    id: "revgate",
    title: "RevGate Telemetry Dashboard",
    subtitle: "Real-Time Fleet & Automotive Diagnostic Control Center",
    category: "dashboard",
    categoryLabel: "Operations Dashboard",
    isConcept: true,
    summary: "High-speed real-time telemetry streaming, hardware sensor mapping, and live diagnostic monitoring dashboards.",
    details: "RevGate was engineered as a high-performance control dashboard capable of processing over 50,000 telemetry datapoints per second per vehicle cluster.",
    tags: ["Rust Core", "WebSockets", "Data Charts", "Live HUD UI", "IoT Stream"],
    stats: [
      { label: "Data Throughput", value: "50k/sec" },
      { label: "Latency", value: "< 12ms" },
      { label: "Predictive Accuracy", value: "98.4%" }
    ],
    features: [
      "Real-time sensor mapping & thermal visualization charts",
      "AI Predictive fault detection HUD indicators",
      "Custom dark telemetry dashboard with high-contrast widgets",
      "Live CAN-bus telemetry stream monitoring"
    ],
    mockupType: "revgate",
    accentColor: "#00f0ff"
  }
];

// Tech stack items data
const TECH_STACK_DATA = [
  { name: "JavaScript ESNext", icon: "fa-brands fa-js", category: "frontend" },
  { name: "Bootstrap 5", icon: "fa-brands fa-bootstrap", category: "frontend" },
  { name: "HTML5 / CSS3", icon: "fa-brands fa-html5", category: "frontend" },
  { name: "Vue.js / React", icon: "fa-brands fa-react", category: "frontend" },
  { name: "Git Versioning", icon: "fa-brands fa-git-alt", category: "frontend" },
  { name: "Node.js", icon: "fa-brands fa-node-js", category: "backend" },
  { name: "Python / FastAPI", icon: "fa-brands fa-python", category: "backend" },
  { name: "Rust Core", icon: "fa-solid fa-gear", category: "backend" },
  { name: "PostgreSQL & Databases", icon: "fa-solid fa-database", category: "backend" },
  { name: "WebSockets & APIs", icon: "fa-solid fa-network-wired", category: "backend" }
];
