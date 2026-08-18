import Link from "next/link";

export function HeroVideo() {
  return (
    <section className="relative h-screen min-h-[560px] w-full overflow-hidden bg-cafe">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="https://videos.pexels.com/video-files/7679416/7679416-hd_1366_720_25fps.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center text-white">
        <h1 className="max-w-2xl text-balance font-serif text-4xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-6xl">
          Piezas hechas a mano en México
        </h1>
        <p className="max-w-md text-sm tracking-wide text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
          Bordado artesanal, una pieza a la vez.
        </p>
        <Link
          href="/categorias"
          className="mt-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-foreground transition hover:bg-white/90"
        >
          Ver colección
        </Link>
      </div>
    </section>
  );
}
