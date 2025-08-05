import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function setupFolders() {
  try {
    console.log("Setting up dataset folder structure...");

    const zipFilePath = path.join(process.cwd(), "datasets.zip");

    if (!fs.existsSync(zipFilePath)) {
      console.error(
        "Error: datasets.zip file not found in the current directory"
      );
      console.log("Please ensure datasets.zip is in the api directory");
      return;
    }

    try {
      console.log("Extracting datasets.zip file...");
      // Use unzip command to extract the file
      const extractCommand = `unzip -o "${zipFilePath}" -d "${process.cwd()}"`;
      const { stdout, stderr } = await execAsync(extractCommand);
      console.log("Extraction completed successfully");
      console.log("stdout:", stdout);
      if (stderr) console.log("stderr:", stderr);
    } catch (error) {
      console.error("Error extracting files:", error);
      console.log("Please ensure the datasets.zip file is not corrupted");
    }

    // Unzip all zipped folders in datasets/cricket
    console.log("Unzipping files in datasets/cricket folder...");
    await unzipCricketFolder();

    console.log("Setup completed successfully!");
  } catch (error) {
    console.error("Error during setup:", error);
    throw error;
  }
}

async function unzipCricketFolder() {
  try {
    const cricketFolderPath = path.join(process.cwd(), "datasets", "cricket");

    if (!fs.existsSync(cricketFolderPath)) {
      console.log(
        "datasets/cricket folder not found, skipping cricket folder extraction"
      );
      return;
    }

    // Get all files in the cricket folder
    const files = fs.readdirSync(cricketFolderPath);
    const zipFiles = files.filter((file) => file.endsWith(".zip"));

    if (zipFiles.length === 0) {
      console.log("No zip files found in datasets/cricket folder");
      return;
    }

    console.log(`Found ${zipFiles.length} zip files to extract:`);
    zipFiles.forEach((file) => console.log(`  - ${file}`));

    // Extract each zip file
    for (const zipFile of zipFiles) {
      const zipFilePath = path.join(cricketFolderPath, zipFile);
      const extractDir = path.join(
        cricketFolderPath,
        zipFile.replace(".zip", "")
      );

      console.log(`Extracting ${zipFile}...`);

      try {
        const extractCommand = `unzip -o "${zipFilePath}" -d "${extractDir}"`;
        const { stdout, stderr } = await execAsync(extractCommand);
        console.log(`Successfully extracted ${zipFile}`);
        if (stderr) console.log(`stderr for ${zipFile}:`, stderr);
      } catch (error) {
        console.error(`Error extracting ${zipFile}:`, error);
      }
    }

    console.log("Cricket folder extraction completed");
  } catch (error) {
    console.error("Error processing cricket folder:", error);
  }
}

export async function setup() {
  await setupFolders();
}

if (require.main === module) {
  setupFolders();
}
