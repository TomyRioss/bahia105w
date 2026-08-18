import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Vestidos", slug: "vestidos" },
  { name: "Blusas", slug: "blusas" },
  { name: "Huipiles", slug: "huipiles" },
  { name: "Accesorios", slug: "accesorios" },
];

const PRODUCTS = [
  {
    name: "Vestido negro Carmen",
    slug: "vestido-negro-carmen",
    description: "Vestido bordado a mano, corte recto, tela de algodón fresco. Material: 100% algodón.",
    price: "5100.00",
    category: "vestidos",
    img: "https://images.pexels.com/photos/31197522/pexels-photo-31197522/free-photo-of-woman-in-embroidered-blue-dress-pouring-sand-indoors.jpeg?auto=compress&cs=tinysrgb&w=800",
    variants: [
      { color: "Negro", size: "S", stock: 4 },
      { color: "Negro", size: "M", stock: 6 },
      { color: "Negro", size: "L", stock: 3 },
    ],
  },
  {
    name: "Tunica de lino rosa palo",
    slug: "tunica-lino-rosa-palo",
    description: "Túnica ligera de lino con bordado floral. Material: lino 100%.",
    price: "5100.00",
    category: "vestidos",
    img: "https://images.pexels.com/photos/22392080/pexels-photo-22392080/free-photo-of-young-woman-posing-in-a-white-dress-with-embroidery.jpeg?auto=compress&cs=tinysrgb&w=800",
    variants: [
      { color: "Rosa palo", size: "S", stock: 5 },
      { color: "Rosa palo", size: "M", stock: 5 },
    ],
  },
  {
    name: "Blusa de lino blanco",
    slug: "blusa-lino-blanco",
    description: "Blusa artesanal bordada a mano, cuello redondo. Material: lino 100%.",
    price: "2950.00",
    category: "blusas",
    img: "https://images.pexels.com/photos/34510308/pexels-photo-34510308/free-photo-of-elegant-fashion-portrait-in-embroidered-velvet-dress.jpeg?auto=compress&cs=tinysrgb&w=800",
    variants: [
      { color: "Blanco", size: "S", stock: 6 },
      { color: "Blanco", size: "M", stock: 6 },
      { color: "Blanco", size: "L", stock: 4 },
    ],
  },
  {
    name: "Vestido Carlota fucsia",
    slug: "vestido-carlota-fucsia",
    description: "Vestido de fiesta bordado, tela satinada. Material: satín con forro de algodón.",
    price: "4200.00",
    category: "vestidos",
    img: "https://images.pexels.com/photos/18387261/pexels-photo-18387261/free-photo-of-a-woman-in-a-red-outfit-stands-next-to-a-wall.jpeg?auto=compress&cs=tinysrgb&w=800",
    variants: [
      { color: "Fucsia", size: "S", stock: 3 },
      { color: "Fucsia", size: "M", stock: 5 },
    ],
  },
  {
    name: "Huipil tradicional bordado",
    slug: "huipil-tradicional-bordado",
    description: "Huipil bordado a mano por artesanas oaxaqueñas. Material: algodón grueso.",
    price: "3950.00",
    category: "huipiles",
    img: "https://images.pexels.com/photos/29239688/pexels-photo-29239688/free-photo-of-woman-in-traditional-mexican-attire-outdoors.jpeg?auto=compress&cs=tinysrgb&w=800",
    variants: [
      { color: "Multicolor", size: "Única", stock: 8 },
    ],
  },
  {
    name: "Rebozo bordado a mano",
    slug: "rebozo-bordado-a-mano",
    description: "Rebozo tejido artesanalmente, flecos anudados a mano. Material: rayón.",
    price: "1800.00",
    category: "accesorios",
    img: "https://images.pexels.com/photos/28618358/pexels-photo-28618358/free-photo-of-mystery-woman-with-a-traditional-sombrero.jpeg?auto=compress&cs=tinysrgb&w=800",
    variants: [
      { color: "Negro", size: "Única", stock: 10 },
    ],
  },
];

const BANNERS = [
  {
    type: "HERO" as const,
    imageUrl:
      "https://images.pexels.com/photos/33492025/pexels-photo-33492025/free-photo-of-colorful-mexican-dress-in-leon-de-los-aldama.jpeg?auto=compress&cs=tinysrgb&w=1600",
    title: "La belleza de la tradición, reinventada",
    link: "/categoria/vestidos",
    order: 0,
  },
  {
    type: "FLYER" as const,
    imageUrl:
      "https://images.pexels.com/photos/20282185/pexels-photo-20282185/free-photo-of-young-woman-standing-next-to-a-palm-tree.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Detalle de bordado",
    order: 0,
  },
  {
    type: "BANNER" as const,
    imageUrl:
      "https://images.pexels.com/photos/18387179/pexels-photo-18387179/free-photo-of-a-woman-in-a-skirt-and-top-stands-in-front-of-a-market.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Donde la tradición se une al estilo contemporáneo",
    link: "/categoria/vestidos",
    order: 0,
  },
];

async function main() {
  const adminPassword = await bcrypt.hash("boutiquemex2026", 10);
  await prisma.user.upsert({
    where: { email: "admin@boutiquemex.mx" },
    update: {},
    create: {
      name: "Admin Bahia 105w",
      email: "admin@boutiquemex.mx",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const devAdminPassword = await bcrypt.hash("tomy1234", 10);
  await prisma.user.upsert({
    where: { email: "dev@admin.com" },
    update: { password: devAdminPassword, role: "OWNER" },
    create: {
      name: "Dev Admin",
      email: "dev@admin.com",
      password: devAdminPassword,
      role: "OWNER",
    },
  });

  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.category } });
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        categoryId: category.id,
        variants: {
          create: p.variants.map((v) => ({ ...v, imageUrl: p.img })),
        },
      },
    });
  }

  for (const b of BANNERS) {
    const exists = await prisma.banner.findFirst({ where: { type: b.type, title: b.title } });
    if (!exists) await prisma.banner.create({ data: b });
  }

  console.log("Seed OK.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
