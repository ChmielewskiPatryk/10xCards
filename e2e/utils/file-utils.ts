import * as fs from "fs";
import * as path from "path";

/**
 * Reads and returns the content of a text file from the mocks directory
 *
 * @param fileName The name of the file to read
 * @returns The content of the file as a string
 */
export function readTestDataFile(fileName: string): string {
  const filePath = path.join("e2e", "mocks", fileName);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    console.error(`Error reading test data file ${fileName}:`, error);
    throw error;
  }
}
