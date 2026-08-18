import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendNewOrderEmail(order: {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  total: number | string;
}) {
  if (!resend || !process.env.VENDOR_EMAIL) {
    console.warn("[email] RESEND_API_KEY o VENDOR_EMAIL no configurado, se omite notificación.");
    return { skipped: true };
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Boutique Mex <pedidos@boutiquemex.mx>",
      to: process.env.VENDOR_EMAIL,
      subject: `Nuevo pedido #${order.id.slice(-8)} — Boutique Mex`,
      html: `
        <h2>Nuevo pedido recibido</h2>
        <p><strong>Cliente:</strong> ${order.contactName}</p>
        <p><strong>Email:</strong> ${order.contactEmail}</p>
        <p><strong>Teléfono:</strong> ${order.contactPhone}</p>
        <p><strong>Total:</strong> $${order.total}</p>
        <p>Revisa el detalle completo en el panel admin.</p>
      `,
    });
    return { skipped: false };
  } catch (err) {
    console.error("[email] fallo al enviar notificación de pedido:", err);
    return { skipped: true, error: err };
  }
}
