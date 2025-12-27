import fs from "fs";
import path from "path";
import db from "../db/models";
import { ProductCreationAttributes } from "../types/models";

const CSV_FILE_PATH = path.join(__dirname, "../books.csv");

const parseCSVLine = (line: string): string[] => {
  // Split by comma, but ignore commas inside quotes
  // This regex handles:
  // 1. Quoted strings: "..."
  // 2. Non-quoted strings: ...
  // It splits by comma that is NOT followed by an odd number of quotes (lookahead)
  return line
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((val) => val.trim().replace(/^"|"$/g, ""));
};

const importBooks = async () => {
  try {
    console.log("Starting book import...");

    // Check if file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error(`File not found: ${CSV_FILE_PATH}`);
      process.exit(1);
    }

    // Read file
    const fileContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");
    const lines = fileContent
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      console.log("CSV file is empty.");
      return;
    }

    // Parse headers
    const headers = lines[0].split(",").map((h) => h.trim());
    console.log("Headers:", headers);

    // Validate headers
    const requiredHeaders = ["barcode", "name", "price"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      console.error(`Missing required headers: ${missingHeaders.join(", ")}`);
      process.exit(1);
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Connect to DB
    await db.sequelize.authenticate();
    console.log("Database connected.");

    // Process lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line);

      if (values.length !== headers.length) {
        console.warn(
          `Line ${i + 1}: Value count mismatch. Expected ${
            headers.length
          }, got ${values.length}. Skipping.`
        );
        skipCount++;
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Validate required fields
      if (!row.name) {
        console.warn(
          `Line ${
            i + 1
          }: Missing required fields (name). Skipping. Data: ${JSON.stringify(
            row
          )}`
        );
        skipCount++;
        continue;
      }

      try {
        // Prepare data
        const productData: ProductCreationAttributes = {
          barcode: row.barcode,
          name: row.name,
          brand: row.author, // Mapping author to brand
          supplier: row.publisher, // Mapping publisher to supplier
          category: row.genre, // Mapping genre to category
          quantity: parseInt(row.quantity) || 0,
          price: parseFloat(row.price),
          reorder_threshold: parseInt(row.reorder_threshold) || 10,
          discount: 0, // Default
          discount_type: "Percentage", // Default
        };

        // Upsert product (update if exists, insert if not)
        await db.Product.upsert(productData);
        successCount++;

        if (successCount % 100 === 0) {
          console.log(`Processed ${successCount} products...`);
        }
      } catch (err) {
        console.error(`Line ${i + 1}: Error importing product ${row.name}.`, err);
        errorCount++;
      }
    }

    console.log("Import completed.");
    console.log(`Success: ${successCount}`);
    console.log(`Skipped: ${skipCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Fatal error during import:", error);
  } finally {
    await db.sequelize.close();
  }
};

importBooks();
