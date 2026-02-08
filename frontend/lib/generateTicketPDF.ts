import jsPDF from "jspdf";
import QRCode from "qrcode";

interface TicketData {
  reservationId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  userEmail: string;
  status: string;
}

export async function generateTicketPDF(ticket: TicketData) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [210, 100],
  });

  const width = 210;
  const height = 100;

  // --- Background ---
  doc.setFillColor(17, 24, 39); // dark bg
  doc.rect(0, 0, width, height, "F");

  // --- Left accent bar ---
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 0, 6, height, "F");

  // --- Header ---
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("BILLET D'ENTRÉE", 14, 14);

  // --- Dotted separator line ---
  doc.setDrawColor(75, 85, 99);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(14, 18, 145, 18);
  doc.setLineDashPattern([], 0);

  // --- Event Title ---
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(ticket.eventTitle, 120);
  doc.text(titleLines, 14, 28);

  const titleEndY = 28 + titleLines.length * 7;

  // --- Event Info ---
  doc.setTextColor(156, 163, 175); // gray-400
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const formattedDate = new Date(ticket.eventDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.text(`📅  ${formattedDate}`, 14, titleEndY + 6);
  doc.text(`📍  ${ticket.eventLocation}`, 14, titleEndY + 13);

  // --- Participant Info ---
  doc.setDrawColor(75, 85, 99);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(14, titleEndY + 19, 145, titleEndY + 19);
  doc.setLineDashPattern([], 0);

  doc.setTextColor(209, 213, 219); // gray-300
  doc.setFontSize(8);
  doc.text("PARTICIPANT", 14, titleEndY + 25);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(ticket.userName, 14, titleEndY + 31);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(ticket.userEmail, 14, titleEndY + 36);

  // --- Reservation ID ---
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(6);
  doc.text(`Réf: ${ticket.reservationId}`, 14, height - 6);

  // --- Right section: vertical dashed line + QR ---
  doc.setDrawColor(75, 85, 99);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(155, 5, 155, height - 5);
  doc.setLineDashPattern([], 0);

  // QR Code
  const qrData = JSON.stringify({
    id: ticket.reservationId,
    event: ticket.eventTitle,
    date: ticket.eventDate,
    participant: ticket.userName,
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: { dark: "#ffffff", light: "#111827" },
    });
    doc.addImage(qrDataUrl, "PNG", 162, 12, 38, 38);
  } catch {
    // Fallback if QR fails
    doc.setFillColor(31, 41, 55);
    doc.rect(162, 12, 38, 38, "F");
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.text("QR Code", 174, 33);
  }

  // --- "SCAN ME" label ---
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(7);
  doc.text("SCANNER POUR VÉRIFIER", 163, 56);

  // --- Status badge ---
  const statusColors: Record<string, [number, number, number]> = {
    CONFIRMED: [34, 197, 94],
    PENDING: [234, 179, 8],
    REFUSED: [239, 68, 68],
    CANCELED: [107, 114, 128],
  };
  const color = statusColors[ticket.status] || [107, 114, 128];
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(165, 62, 32, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const statusLabel: Record<string, string> = {
    CONFIRMED: "CONFIRMÉ",
    PENDING: "EN ATTENTE",
    REFUSED: "REFUSÉ",
    CANCELED: "ANNULÉ",
  };
  doc.text(statusLabel[ticket.status] || ticket.status, 181, 67.5, {
    align: "center",
  });

  // --- Save ---
  const safeTitle = ticket.eventTitle
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 30);
  doc.save(`billet_${safeTitle}.pdf`);
}
