import jsPDF from "jspdf";
import { formatCurrency } from "../utils";
import autoTable from "jspdf-autotable";
import { bookWithSaleItem } from "../types";

export const buildReceiptHtml = (sale: any) => {
  const doc = new jsPDF();
  let subTotal: number = 0;

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
  doc.text("267B, Pahala Yagoda, Ganemulla", 105, 32, { align: "center" });
  doc.text(
    "Tel: 0773549230 / 0762208912 | Email: storyflix2022@gmail.com",
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
  doc.text("SALES RECEIPT", 105, 57, { align: "center" });

  // Info section with better layout
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  let yPos = 68;

  // Left column
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice No:`, 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${String(sale.id).padStart(3, "0")}`, 45, yPos);

  // Right column
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice Date:`, 140, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(dateTime, 165, yPos);
  yPos += 7;

  // add bookshop name if exists
  if (sale.bookshop) {
    doc.setFont("helvetica", "bold");
    doc.text(`Customer:`, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${sale.bookshop.name}`, 45, yPos);
    yPos += 7;
  }

  // Payment Method
  doc.setFont("helvetica", "bold");
  doc.text(`Payment:`, 14, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(`${sale.payment_method}`, 45, yPos);
  yPos += 12;

  // Table
  const tableColumn = ["Item", "Qty", "Price", "Discount", "Total"];
  const tableRows: any[] = [];

  sale.books.forEach((book: bookWithSaleItem) => {
    if (!book.SaleItem) return;

    const saleItem = book.SaleItem;
    const quantity_price = parseFloat(saleItem.price) || 0;
    const quantity = saleItem.quantity || 0;

    let last_price = parseFloat(saleItem.price) || 0;

    // check if discount is applied
    const isDiscountApplied: boolean =
      parseFloat(saleItem.discount) > 0 ? true : false;

    // calculate last price after discount
    if (isDiscountApplied) {
      switch (saleItem.discount_type) {
        case "Fixed":
          last_price -= parseFloat(saleItem.discount);
          break;
        case "Percentage":
          last_price -= (last_price * parseFloat(saleItem.discount)) / 100;
          break;
      }
    }

    const total = last_price * quantity;
    subTotal += total;

    // format discount display
    const discount =
      isDiscountApplied && saleItem.discount
        ? `${saleItem.discount} ${
            saleItem.discount_type === "Fixed" ? "LKR" : "%"
          }`
        : "-";

    const row = [
      book.name,
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
