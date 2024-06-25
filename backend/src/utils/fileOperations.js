import fs from "fs";

/**
 * Reads content of the specified file path
 * @param {string} file path of the file to read from
 * @returns
 */
export const readFromFile = (file) => {
  try {
    return fs.readFileSync(file); // read synchronously (blocking)
  } catch (err) {
    console.error("error reading file:", err.message);
    return undefined;
  }
};

/**
 * Writes content into the specified file path
 * @param {string} content content to write into the file
 * @param {string} filepath path of the file to write into
 */
export const writeToFile = (content, filepath) => {
  try {
    fs.writeFileSync(filepath, content); // write synchronously (blocking)
  } catch (err) {
    console.error("error writing file:", err.message);
  }
};
