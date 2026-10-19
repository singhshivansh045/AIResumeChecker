const pdfParse = require("pdf-parse");
const ApiError = require("../utils/ApiError");

async function extractText(buffer) {
  try {
    // Safely resolve the parser function across different module export formats
    const parser =
      typeof pdfParse === "function"
        ? pdfParse
        : pdfParse && typeof pdfParse.default === "function"
          ? pdfParse.default
          : pdfParse && typeof pdfParse.PDF === "function"
            ? pdfParse.PDF
            : pdfParse && typeof pdfParse.pdf === "function"
              ? pdfParse.pdf
              : null;

    if (!parser) {
      throw new Error("pdf-parse export could not be resolved as a function");
    }

    const data = await parser(buffer);

    const text = (data.text || "").trim();
    if (!text || text.length < 50) {
      throw ApiError.badRequest(
        "Could not extract readable text - is this a scanned/image-only PDF?",
      );
    }

    return {
      text,
      meta: {
        numPages: data.numpages || null,
      },
    };
  } catch (err) {
    if (err.isOperational) throw err;
    throw ApiError.badRequest("Failed to parse PDF: " + err.message);
  }
}

module.exports = { extractText };
