import PDFDocument from "pdfkit-table";
import fs from "fs";
import path from "path";
import db from "../db/models";

interface SaleItem {
  price: number;
  quantity: number;
  discount: number;
  discount_type: "Fixed" | "Percentage";
}

interface Product {
  name: string;
  SaleItem: SaleItem;
}

interface Customer {
  name: string;
}

interface Sale {
  id: number;
  createdAt: Date;
  payment_method: string;
  Customer?: Customer;
  Products: Product[];
  discount: number;
  total_amount: number;
}

export const generateReceiptPdf = async (sale: Sale): Promise<Buffer> => {
  const settings = await db.Settings.findOne();
  const businessName = settings?.businessName || "Storyflix Pvt Ltd";
  const address =
    settings?.address || "No.09, Sunhill Gardens, Yatadola, Matugama.";
  const phone = settings?.phone || "+94706995585(WhatsApp) / +94712114841";
  const email = settings?.email || "digital@storyflix.lk";
  const footer = settings?.receiptFooter || "Thank you for your business!";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const buffers: Buffer[] = [];

    // Register Fonts
    let fontPathRegular = path.join(
      __dirname,
      "../fonts/NotoSansSinhala-Regular.ttf"
    );
    if (!fs.existsSync(fontPathRegular)) {
      fontPathRegular = path.join(
        __dirname,
        "../../fonts/NotoSansSinhala-Regular.ttf"
      );
    }

    let fontPathBold = path.join(
      __dirname,
      "../fonts/NotoSansSinhala-Bold.ttf"
    );
    if (!fs.existsSync(fontPathBold)) {
      fontPathBold = path.join(
        __dirname,
        "../../fonts/NotoSansSinhala-Bold.ttf"
      );
    }

    if (fs.existsSync(fontPathRegular)) {
      doc.registerFont("NotoSansSinhala", fontPathRegular);
    } else {
      console.warn(
        `Regular font not found at ${fontPathRegular}, falling back to Helvetica`
      );
      doc.registerFont("NotoSansSinhala", "Helvetica");
    }

    if (fs.existsSync(fontPathBold)) {
      doc.registerFont("NotoSansSinhala-Bold", fontPathBold);
    } else {
      console.warn(
        `Bold font not found at ${fontPathBold}, falling back to Helvetica-Bold`
      );
      doc.registerFont("NotoSansSinhala-Bold", "Helvetica-Bold");
    }

    doc.on("data", (buffer: any) => buffers.push(buffer));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err: any) => reject(err));

    const hasSinhala = (text: string) => /[\u0D80-\u0DFF]/.test(text);

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
      .text(businessName, 0, 20, { align: "center" });

    // Company Details
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#505050")
      .text(address, 0, 45, {
        align: "center",
      });

    let contactInfo = "";
    if (phone) contactInfo += `Tel: ${phone}`;
    if (phone && email) contactInfo += " | ";
    if (email) contactInfo += `Email: ${email}`;

    doc.text(contactInfo, 0, 58, { align: "center" });

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
    if (sale.Customer) {
      doc.font("Helvetica-Bold").text("Customer:", 14, yPos);
      const customerName = sale.Customer.name;
      const customerFont = hasSinhala(customerName)
        ? "NotoSansSinhala"
        : "Helvetica";
      doc.font(customerFont).text(customerName, 80, yPos);
      yPos += 15;
    }

    // Payment Method
    doc.font("Helvetica-Bold").text("Payment:", 14, yPos);
    doc.font("Helvetica").text(sale.payment_method, 80, yPos);
    yPos += 20;

    // --- Table Section ---
    const tableData = sale.Products.map((product) => {
      const saleItem = product.SaleItem;
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
      // <td>LKR ${(product.SaleItem.price * product.SaleItem.quantity).toFixed(2)}</td>
      // Yes, it shows gross total per line.

      return [
        product.name,
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
        doc.fontSize(10);
        if (indexColumn === 0) {
          const text = row[0];
          if (hasSinhala(text)) {
            doc.font("NotoSansSinhala");
          } else {
            doc.font("Helvetica");
          }
        } else {
          doc.font("Helvetica");
        }
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
    const subtotal = sale.Products.reduce((acc: number, product: any) => {
      const saleItem = product.SaleItem;
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
      // acc + product.SaleItem.price * product.SaleItem.quantity
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

    // Footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(footer, 0, doc.page.height - 50, {
        align: "center",
      });

    doc.end();
  });
};
