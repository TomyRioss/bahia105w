const POSITION = "23.228,-106.4189";

export function FooterMap() {
  return (
    <iframe
      src={`https://www.google.com/maps?q=${POSITION}&z=16&output=embed`}
      className="h-40 w-full rounded-md border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Lázaro Cárdenas 93, Zona Dorada"
    />
  );
}
