import jsPDF from "jspdf";
import { formatCurrency } from "../utils";
import autoTable from "jspdf-autotable";

const loadFont = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(",")[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
const hasSinhala = (text: string) => /[\u0D80-\u0DFF]/.test(text);

export const buildReceiptHtml = async (sale: any) => {
  const doc = new jsPDF();
  let subTotal: number = 0;

  try {
    const fontRegular = await loadFont("/fonts/NotoSansSinhala-Regular.ttf");
    const fontBold = await loadFont("/fonts/NotoSansSinhala-Bold.ttf");

    doc.addFileToVFS("NotoSansSinhala-Regular.ttf", fontRegular);
    doc.addFileToVFS("NotoSansSinhala-Bold.ttf", fontBold);

    doc.addFont("NotoSansSinhala-Regular.ttf", "NotoSansSinhala", "normal");
    doc.addFont("NotoSansSinhala-Bold.ttf", "NotoSansSinhala", "bold");
  } catch (error) {
    console.error("Error loading fonts:", error);
  }

  // Determine if this is a quotation or a sale
  const isQuotation = !!sale.status || !!sale.items;

  // construct date time string
  const dateTime: string = `${new Date(
    sale.createdAt
  ).toLocaleDateString()} - ${new Date(sale.createdAt).toLocaleTimeString()}`;

  // Load and add logo
  const img = new Image();
  img.src = "/logo/storyflix-logo.png";

  // Add logo (20x20 size at position 14, 15)
  doc.addImage(img, "PNG", 14, 15, 40, 25);

  // Company Header (right side of logo)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185); // Blue color
  doc.text("Storyflix Pvt Ltd", 105, 25, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(" No.09, Sunhill Gardens, Yatadola, Matugama.", 105, 32, {
    align: "center",
  });
  doc.text(
    "Tel: +94706995585(WhatsApp) / +94712114841 | Email: digital@storyflix.lk",
    105,
    37,
    { align: "center" }
  );

  // Separator line
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.8);
  doc.line(14, 45, 196, 45);

  // Receipt Title with background
  doc.setFillColor(41, 128, 185);
  doc.rect(70, 50, 70, 10, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(isQuotation ? "QUOTATION" : "SALES RECEIPT", 105, 57, {
    align: "center",
  });

  // Info section with better layout
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let yPos = 68;

  // Left column
  doc.setFont("helvetica", "bold");
  doc.text(isQuotation ? `Quotation No:` : `Invoice No:`, 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${String(sale.id).padStart(3, "0")}`, 45, yPos);

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text(`Date:`, 140, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(dateTime, 165, yPos);
  yPos += 7;

  if (sale.expiresAt) {
    doc.setFont("helvetica", "bold");
    doc.text(`Expires:`, 140, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(sale.expiresAt).toLocaleDateString(), 165, yPos);
    yPos += 7;
  }

  // add bookshop name if exists
  if (sale.bookshop) {
    doc.setFont("helvetica", "bold");
    doc.text(`Customer:`, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${sale.bookshop.name}`, 45, yPos);
    yPos += 7;
  }

  // Payment Method (Only for Sales)
  if (!isQuotation) {
    doc.setFont("helvetica", "bold");
    doc.text(`Payment:`, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${sale.payment_method}`, 45, yPos);
    yPos += 12;
  } else {
    yPos += 5;
  }

  // Table
  const tableColumn = ["Item", "Qty", "Price", "Discount", "Total"];
  const tableRows: any[] = [];

  // Handle both Sale (books array) and Quotation (items array) structures
  const items = sale.books || sale.items || [];

  items.forEach((item: any) => {
    // For Sale, item is bookWithSaleItem and has SaleItem property
    // For Quotation, item is QuotationItem and has book property

    const isSaleItem = !!item.SaleItem;
    const detailItem = isSaleItem ? item.SaleItem : item;
    const bookName = isSaleItem ? item.name : item.book?.name || "Unknown Book";

    const quantity_price = parseFloat(detailItem.price) || 0;
    const quantity = detailItem.quantity || 0;

    let last_price = parseFloat(detailItem.price) || 0;

    // check if discount is applied
    const isDiscountApplied: boolean =
      parseFloat(detailItem.discount) > 0 ? true : false;

    // calculate last price after discount
    if (isDiscountApplied) {
      switch (detailItem.discount_type) {
        case "Fixed":
          last_price -= parseFloat(detailItem.discount);
          break;
        case "Percentage":
          last_price -= (last_price * parseFloat(detailItem.discount)) / 100;
          break;
      }
    }

    const total = last_price * quantity;
    subTotal += total;

    // format discount display
    const discount =
      isDiscountApplied && detailItem.discount
        ? `${detailItem.discount} ${
            detailItem.discount_type === "Fixed" ? "LKR" : "%"
          }`
        : "-";

    const row = [
      bookName,
      quantity,
      formatCurrency(quantity_price),
      discount,
      formatCurrency(total),
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPos,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const text = data.cell.raw as string;
        if (hasSinhala(text)) {
          data.cell.styles.font = "NotoSansSinhala";
        } else {
          data.cell.styles.font = "helvetica";
        }
      } else {
        data.cell.styles.font = "helvetica";
      }
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: 14, right: 14 },
  });

  // Totals
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY || yPos;

  // Totals section with box
  const totalsStartY = finalY + 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Subtotal:`, 140, totalsStartY);
  doc.text(formatCurrency(subTotal), 195, totalsStartY, { align: "right" });

  doc.text(`Bill Discount:`, 140, totalsStartY + 7);
  doc.setTextColor(220, 53, 69); // Red for discount
  doc.text(`-${formatCurrency(sale.discount ?? 0)}`, 195, totalsStartY + 7, {
    align: "right",
  });

  // Total with background
  doc.setFillColor(41, 128, 185);
  doc.rect(135, totalsStartY + 12, 61, 10, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Total:`, 140, totalsStartY + 19);
  doc.text(formatCurrency(sale.total_amount), 195, totalsStartY + 19, {
    align: "right",
  });

  // Footer
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your business!", 105, totalsStartY + 35, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Please keep this receipt for your records.",
    105,
    totalsStartY + 41,
    {
      align: "center",
    }
  );

  // Promotional footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(14, totalsStartY + 48, 196, totalsStartY + 48);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Need a Tailored Software Solution? We’re Just a Call Away: 077 124 2254 (Asela)",
    105,
    totalsStartY + 54,
    {
      align: "center",
    }
  );

  return doc;
};
