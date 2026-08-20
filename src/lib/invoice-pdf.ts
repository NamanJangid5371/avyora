import { jsPDF } from "jspdf";
import type { Order } from "@/store/shop-types";
import { formatINR } from "@/lib/format";

export const ORDER_FLOW: Order["status"][] = [
  "Pending Payment",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
];

export function orderStatusStep(status: Order["status"]) {
  if (status === "Cancelled" || status === "Refunded") return -1;
  if (status === "Return Requested") return ORDER_FLOW.indexOf("Delivered");
  return ORDER_FLOW.indexOf(status);
}

export function downloadOrderInvoicePdf(order: Order, customerName?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 48;
  let y = 56;

  const line = (text: string, size = 10, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(text, left, y);
    y += size + 6;
  };

  line("AVYORA", 18, true);
  line("Jewellery atelier · Bengaluru", 10);
  y += 8;
  line("TAX INVOICE", 14, true);
  y += 6;

  line(`Invoice / Order: ${order.id}`, 11, true);
  line(`Date: ${new Date(order.createdAt).toLocaleString("en-IN")}`);
  line(`Fulfilment status: ${order.status}`);
  line(`Payment: ${order.paymentMethod ?? "Razorpay"} · ${order.paymentStatus ?? "Success"}`);
  line(`Payment ID: ${order.paymentId}`);
  if (order.trackingId) line(`Tracking: ${order.trackingId}`);
  y += 10;

  line("Bill to", 11, true);
  line(customerName || order.address.name);
  if (order.customerEmail) line(order.customerEmail);
  line(`${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}`);
  line(`${order.address.city}, ${order.address.state} ${order.address.pincode}`);
  line(`Phone: ${order.address.phone}`);
  y += 10;

  line("Items", 11, true);
  order.items.forEach((item) => {
    line(`${item.name} (${item.sku})`);
    line(`  Qty ${item.quantity} × ${formatINR(item.price)} = ${formatINR(item.price * item.quantity)}`);
  });
  y += 8;

  line(`Subtotal: ${formatINR(order.subtotal)}`);
  line(`Discount: ${formatINR(order.discount)}`);
  line(`Shipping: ${order.shipping ? formatINR(order.shipping) : "Complimentary"}`);
  if (order.tax) line(`Tax: ${formatINR(order.tax)}`);
  if (order.coupon) line(`Coupon: ${order.coupon}`);
  line(`Total paid: ${formatINR(order.total)}`, 12, true);
  y += 14;

  line("Thank you for choosing Avyora.");
  line("This invoice is generated for your records.");

  doc.save(`${order.id}-invoice.pdf`);
}
