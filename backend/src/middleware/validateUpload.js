
const path = require("path");

const allowedTypes = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
};

async function validateUpload(file) {
  if (!file || !file.buffer) {
    throw new Error("No file provided");
  }

  const { fileTypeFromBuffer } = await import("file-type");
  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected) {
    throw new Error("Unknown file format");
  }

  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !allowedTypes[detected.mime] ||
    !allowedTypes[detected.mime].includes(extension)
  ) {
    throw new Error("File content does not match an allowed format");
  }

  return detected.mime;
}

module.exports = validateUpload;
