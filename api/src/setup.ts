import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function setupFolders() {
  try {
    console.log("Setting up dataset folder structure...");

    console.log("Extracting datasets.zip file...");

    const zipFilePath = path.join(process.cwd(), "datasets.zip");

    if (!fs.existsSync(zipFilePath)) {
      console.error(
        "Error: datasets.zip file not found in the current directory"
      );
      console.log("Please ensure datasets.zip is in the api directory");
      return;
    }

    try {
      // Use unzip command to extract the file
      const extractCommand = `unzip -o "${zipFilePath}" -d "${datasetsPath}"`;
      const { stdout, stderr } = await execAsync(extractCommand);
      console.log("Extraction completed successfully");
      console.log("stdout:", stdout);
      if (stderr) console.log("stderr:", stderr);
    } catch (error) {
      console.error("Error extracting files:", error);
      console.log("Please ensure the datasets.zip file is not corrupted");
    }

    console.log("Setup completed successfully!");
  } catch (error) {
    console.error("Error during setup:", error);
    throw error;
  }
}

export function setup() {
  setupFolders();
}

if (require.main === module) {
  setupFolders();
}
