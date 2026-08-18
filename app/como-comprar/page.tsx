import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";

const STEPS = [
  { title: "Elegí tu pieza", description: "Explorá la tienda y agregá tus favoritos al carrito." },
  { title: "Completá tu pedido", description: "Ingresá tus datos de envío y método de pago en el checkout." },
  { title: "Recibí en tu puerta", description: "Enviamos a todo el mundo, directo desde México." },
];

export default function ComoComprarPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center gap-10 px-6 py-24 sm:px-10">
        <h1 className="font-serif text-3xl">Cómo Comprar</h1>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center gap-2 text-center">
              <span className="font-serif text-2xl text-cafe">{i + 1}</span>
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-foreground/70">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
