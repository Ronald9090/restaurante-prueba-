import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Initial mock data to seed database
const initialData = {
  categories: [
    { id: 'cat-1', name: 'Platos Tradicionales', order: 1, active: true },
    { id: 'cat-2', name: 'Sopas', order: 2, active: true },
    { id: 'cat-3', name: 'Desayunos y Bocados', order: 3, active: true },
    { id: 'cat-4', name: 'Bebidas Tradicionales', order: 4, active: true },
    { id: 'cat-5', name: 'Postres', order: 5, active: true },
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Mondongo Chuquisaqueño',
      description: 'Costillas de cerdo doradas cocidas lentamente en salsa de ají colorado y ají amarillo criollo, servido con mote de maíz amarillo pelado y papas cocidas.',
      price: 45,
      available: true,
      categoryId: 'cat-1',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
      featured: true,
    },
    {
      id: 'prod-2',
      name: 'Chorizo Chuquisaqueño',
      description: 'Tradicionales chorizos criollos artesanales sazonados con hierbabuena y especias locales. Acompañados de pan, ensalada fresca de cebolla y tomate con quilquiña, y escabeche.',
      price: 35,
      available: true,
      categoryId: 'cat-1',
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop',
      featured: true,
    },
    {
      id: 'prod-3',
      name: 'Sopa de Maní Tradicional',
      description: 'La reina de las sopas bolivianas: caldo concentrado de carne de res con base de maní blanco molido y tierno, servido con fideos gruesos, papas picadas y crujientes papas al hilo.',
      price: 25,
      available: true,
      categoryId: 'cat-2',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop',
      featured: true,
    },
    {
      id: 'prod-4',
      name: 'Karapecho Chuquisaqueño',
      description: 'Deliciosos bocados de charque de res (carne deshidratada al sol) fritos hasta quedar crocantes, acompañados de mote de maíz blanco y papas con cáscara doradas.',
      price: 40,
      available: true,
      categoryId: 'cat-1',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop',
      featured: false,
    },
    {
      id: 'prod-5',
      name: 'Ckoqo de Pollo',
      description: 'Guiso tradicional de pollo tierno cocido en salsa aromática de ajíes chuquisaqueños, vino tinto de mesa y chicha criolla, acompañado de papa y mote.',
      price: 38,
      available: true,
      categoryId: 'cat-1',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop',
      featured: false,
    },
    {
      id: 'prod-6',
      name: 'Empanadas de Santa Clara',
      description: 'Delicada empanada de masa quebrada dulce rellena de un picadillo jugoso de pollo con pasas, huevo duro, aceituna y un toque sutil de canela y azúcar glas.',
      price: 12,
      available: true,
      categoryId: 'cat-3',
      image: 'https://images.unsplash.com/photo-1608756687911-a15100ba3c71?w=600&auto=format&fit=crop',
      featured: true,
    },
    {
      id: 'prod-7',
      name: 'Tojori Caliente con Pastel',
      description: 'Bebida espesa y reconfortante a base de maíz wilcaparo molido, cocido con leche, canela, clavo de olor y cáscara de naranja, acompañado de un pastel inflado con queso.',
      price: 15,
      available: true,
      categoryId: 'cat-3',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop',
      featured: false,
    },
    {
      id: 'prod-8',
      name: 'Refresco de Mocochinchi',
      description: 'Refrescante bebida de duraznos deshidratados enteros cocidos a fuego lento con azúcar caramelizada, canela, clavo de olor, servido helado con su durazno.',
      price: 8,
      available: true,
      categoryId: 'cat-4',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
      featured: false,
    },
    {
      id: 'prod-9',
      name: 'Chicha de Maíz Chuquisaqueña',
      description: 'Bebida ancestral fermentada de maíz, ligeramente dulce, aromática y muy refrescante para acompañar platos picantes.',
      price: 12,
      available: true,
      categoryId: 'cat-4',
      image: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?w=600&auto=format&fit=crop',
      featured: false,
    },
    {
      id: 'prod-10',
      name: 'Helado Artesanal de Canela',
      description: 'Helado batido a mano con canela pura seleccionada, refrescante, digestivo e ideal para cerrar con broche de oro un almuerzo tradicional.',
      price: 10,
      available: true,
      categoryId: 'cat-5',
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop',
      featured: false,
    },
  ],
  promotions: [
    {
      id: 'promo-1',
      name: 'Combo Tradición Chuquisaqueña',
      description: '¡El verdadero sabor de Sucre en Cochabamba! Incluye 1 plato de Mondongo Chuquisaqueño, 1 porción de Sopa de Maní Tradicional y 1 Refresco de Mocochinchi frío.',
      originalPrice: 78,
      promoPrice: 65,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
      startDate: '2026-07-01',
      endDate: '2026-08-31',
      active: true,
      productIds: ['prod-1', 'prod-3', 'prod-8'],
    },
    {
      id: 'promo-2',
      name: 'Dúo de Chorizos Criollos',
      description: 'Ideal para compartir en pareja. Incluye 2 abundantes platos de Chorizo Chuquisaqueño y 2 vasos helados de Chicha de Maíz Tradicional.',
      originalPrice: 94,
      promoPrice: 79,
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop',
      startDate: '2026-07-10',
      endDate: '2026-08-15',
      active: true,
      productIds: ['prod-2', 'prod-9'],
    },
  ],
  orders: [],
  reservations: [],
  config: {
    name: 'El Chuquisaqueño',
    description: 'Traemos a Cochabamba el auténtico, inconfundible y tradicional sabor chuquisaqueño. Platos abundantes elaborados con ajíes puros traídos directamente de Sucre y el toque de cariño familiar.',
    address: 'Calle Melchor Urquidi #1248, entre Av. Uyuni y Av. América (Zona Queru Queru)',
    city: 'Cochabamba, Bolivia',
    phone: '+59162418191',
    hours: 'Todos los días de 8:00 a. m. a 6:00 p. m.',
    deliveryCost: 10,
    minOrder: 20,
    prepTime: '20 - 35 min',
    socialFacebook: 'https://facebook.com/elchuquisaqueno.cbba',
    socialInstagram: 'https://instagram.com/elchuquisaqueno.cbba',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop',
    paymentMethods: ['Pago QR coordinado por WhatsApp', 'Efectivo al recibir/recoger'],
    tablesCount: 6,
  },
  clients: [] as Array<{ id: string; name: string; phone: string; registrationDate: string }>,
  adminPin: "1234",
  requireClientRegistration: false,
};

const DB_FILE = path.join(process.cwd(), "db.json");

// Ensure db.json exists or create with initial mock data
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
}

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return initialData;
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for large payload (e.g. base64 images)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API: Get complete DB state
  app.get("/api/db", (req, res) => {
    res.json(readDB());
  });

  // API: Save categories
  app.post("/api/categories", (req, res) => {
    const db = readDB();
    db.categories = req.body;
    writeDB(db);
    res.json({ success: true, categories: db.categories });
  });

  // API: Save products
  app.post("/api/products", (req, res) => {
    const db = readDB();
    db.products = req.body;
    writeDB(db);
    res.json({ success: true, products: db.products });
  });

  // API: Save promotions
  app.post("/api/promotions", (req, res) => {
    const db = readDB();
    db.promotions = req.body;
    writeDB(db);
    res.json({ success: true, promotions: db.promotions });
  });

  // API: Save orders
  app.post("/api/orders", (req, res) => {
    const db = readDB();
    db.orders = req.body;
    writeDB(db);
    res.json({ success: true, orders: db.orders });
  });

  // API: Save reservations
  app.post("/api/reservations", (req, res) => {
    const db = readDB();
    db.reservations = req.body;
    writeDB(db);
    res.json({ success: true, reservations: db.reservations });
  });

  // API: Save config
  app.post("/api/config", (req, res) => {
    const db = readDB();
    db.config = req.body;
    writeDB(db);
    res.json({ success: true, config: db.config });
  });

  // API: Register client
  app.post("/api/clients", (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Nombre y teléfono requeridos" });
    }
    const db = readDB();
    const existing = db.clients.find((c: any) => c.phone === phone);
    if (existing) {
      return res.json({ success: true, client: existing, message: "Ya registrado" });
    }
    const newClient = {
      id: `cli-${Date.now()}`,
      name,
      phone,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    db.clients.push(newClient);
    writeDB(db);
    res.json({ success: true, client: newClient });
  });

  // API: Register client with email & password
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    const db = readDB();
    if (!db.clients) {
      db.clients = [];
    }
    const existing = db.clients.find((c: any) => c.email && c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado" });
    }
    const newClient = {
      id: `cli-${Date.now()}`,
      name,
      email,
      password,
      role: 'client',
      registrationDate: new Date().toISOString().split('T')[0]
    };
    db.clients.push(newClient);
    writeDB(db);
    res.json({ success: true, client: { id: newClient.id, name: newClient.name, email: newClient.email, role: 'client' } });
  });

  // API: Login client with email & password
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña requeridos" });
    }
    const db = readDB();
    if (!db.clients) {
      db.clients = [];
    }
    const client = db.clients.find((c: any) => c.email && c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    if (!client) {
      return res.status(400).json({ error: "Credenciales incorrectas" });
    }
    res.json({ success: true, client: { id: client.id, name: client.name, email: client.email, role: 'client' } });
  });

  // API: Save admin PIN and require registration settings
  app.post("/api/settings", (req, res) => {
    const { adminPin, requireClientRegistration } = req.body;
    const db = readDB();
    if (adminPin !== undefined) db.adminPin = adminPin;
    if (requireClientRegistration !== undefined) db.requireClientRegistration = requireClientRegistration;
    writeDB(db);
    res.json({ success: true, adminPin: db.adminPin, requireClientRegistration: db.requireClientRegistration });
  });

  // Vite development vs production asset serving setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
