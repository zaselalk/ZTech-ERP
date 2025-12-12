import PDFDocument from "pdfkit-table";
import fs from "fs";
import path from "path";

interface SaleItem {
  price: number;
  quantity: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
}

interface Book {
  name: string;
  SaleItem: SaleItem;
}

interface Bookshop {
  name: string;
}

interface Sale {
  id: number;
  createdAt: Date;
  payment_method: string;
  bookshop?: Bookshop;
  books: Book[];
  discount: number;
  total_amount: number;
}

export const generateReceiptPdf = (sale: Sale): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (buffer: any) => buffers.push(buffer));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err: any) => reject(err));

    // --- Header Section ---
    // Logo
    const logoPath = path.join(
      __dirname,
      "../../client/public/logo/storyflix-logo.png"
    );

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 14, 15, { width: 40, height: 25 });
    }

    // Company Name
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor("#2980b9") // Blue color
      .text("Storyflix Pvt Ltd", 0, 20, { align: "center" });

    // Company Details
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#505050")
      .text("267B, Pahala Yagoda, Ganemulla", 0, 45, { align: "center" });
    doc.text(
      "Tel: 0773549230 / 0762208912 | Email: storyflix2022@gmail.com",
      0,
      58,
      { align: "center" }
    );

    // Separator Line
    doc
      .moveTo(14, 75)
      .lineTo(580, 75) // A4 width is ~595. 595-15=580 approx
      .strokeColor("#2980b9")
      .lineWidth(0.8)
      .stroke();

    // Receipt Title Box
    doc.rect(220, 85, 155, 20).fill("#2980b9");
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text("SALES RECEIPT", 0, 90, { align: "center" });

    // --- Info Section ---
    doc.fillColor("#000000").fontSize(10).font("Helvetica");
    let yPos = 120;

    const dateTime = `${new Date(
      sale.createdAt
    ).toLocaleDateString()} - ${new Date(sale.createdAt).toLocaleTimeString()}`;

    // Left Column
    doc.font("Helvetica-Bold").text("Invoice No:", 14, yPos);
    doc.font("Helvetica").text(String(sale.id).padStart(3, "0"), 80, yPos);

    // Right Column
    doc.font("Helvetica-Bold").text("Invoice Date:", 400, yPos);
    doc.font("Helvetica").text(dateTime, 470, yPos);

    yPos += 15;

    // Customer (if exists)
    if (sale.bookshop) {
      doc.font("Helvetica-Bold").text("Customer:", 14, yPos);
      doc.font("Helvetica").text(sale.bookshop.name, 80, yPos);
      yPos += 15;
    }

    // Payment Method
    doc.font("Helvetica-Bold").text("Payment:", 14, yPos);
    doc.font("Helvetica").text(sale.payment_method, 80, yPos);
    yPos += 20;

    // --- Table Section ---
    const tableData = sale.books.map((book) => {
      const saleItem = book.SaleItem;
      const price = parseFloat(String(saleItem.price));
      const qty = saleItem.quantity;

      let discountText = "-";
      if (saleItem.discount > 0) {
        discountText = `${saleItem.discount} ${
          saleItem.discount_type === "Fixed" ? "LKR" : "%"
        }`;
      }

      const total = price * qty; // Note: Logic in client seemed to ignore item discount for row total display?
      // Checking client code:
      // <td>LKR ${(book.SaleItem.price * book.SaleItem.quantity).toFixed(2)}</td>
      // Yes, it shows gross total per line.

      return [
        book.name,
        String(qty),
        `LKR ${price.toFixed(2)}`,
        discountText,
        `LKR ${total.toFixed(2)}`,
      ];
    });

    const table = {
      headers: ["Item", "Qty", "Price", "Discount", "Total"],
      rows: tableData,
    };

    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: (
        row: any,
        indexColumn?: number,
        indexRow?: number,
        rectRow?: any,
        rectCell?: any
      ) => {
        doc.font("Helvetica").fontSize(10);
        return doc;
      },
      x: 14,
      y: yPos,
      width: 560,
      padding: [5, 5, 5, 5],
      columnSpacing: 5,
      columnsSize: [200, 50, 100, 100, 100],
    });

    // --- Totals Section ---
    // Calculate subtotal (logic from client)
    const subtotal = sale.books.reduce((acc: number, book: any) => {
      const saleItem = book.SaleItem;
      let itemPrice = parseFloat(saleItem.price) || 0;
      const qty = saleItem.quantity || 0;

      // Apply item level discount logic again to get accurate subtotal (Wait, client code for subtotal calculation was complex)
      // Client code:
      // if (parseFloat(saleItem.discount) > 0) {
      //   if (saleItem.discount_type === "Fixed") {
      //     itemPrice -= parseFloat(saleItem.discount);
      //   } else if (saleItem.discount_type === "Percentage") {
      //     itemPrice -= (itemPrice * parseFloat(saleItem.discount)) / 100;
      //   }
      // }
      // return acc + itemPrice * qty;

      // However, the HTML generation in server/routes/sales.ts used:
      // acc + book.SaleItem.price * book.SaleItem.quantity
      // which is GROSS subtotal.

      // And ReceiptBuilder.ts used:
      // let last_price = parseFloat(saleItem.price) || 0;
      // if (parseFloat(saleItem.discount) > 0) ... logic ...
      // subTotal += last_price * quantity;

      // So ReceiptBuilder calculates NET subtotal (after item discounts).

      let price = parseFloat(saleItem.price) || 0;
      if (parseFloat(String(saleItem.discount)) > 0) {
        if (saleItem.discount_type === "Fixed") {
          price -= parseFloat(String(saleItem.discount));
        } else if (saleItem.discount_type === "Percentage") {
          price -= (price * parseFloat(String(saleItem.discount))) / 100;
        }
      }
      return acc + price * qty;
    }, 0);

    // Move down after table
    // doc.y is updated by doc.table
    const finalY = doc.y + 20;

    doc.fontSize(10);

    // Align to right
    const rightX = 400;
    const valueX = 500;

    doc.font("Helvetica").text("Subtotal:", rightX, finalY);
    doc.text(`LKR ${subtotal.toFixed(2)}`, valueX, finalY, {
      align: "right",
      width: 80,
    });

    doc.text("Cart Discount:", rightX, finalY + 15);
    doc.text(
      `LKR ${parseFloat(String(sale.discount)).toFixed(2)}`,
      valueX,
      finalY + 15,
      { align: "right", width: 80 }
    );

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Total:", rightX, finalY + 35);
    doc.text(
      `LKR ${parseFloat(String(sale.total_amount)).toFixed(2)}`,
      valueX,
      finalY + 35,
      { align: "right", width: 80 }
    );

    doc.end();
  });
};
