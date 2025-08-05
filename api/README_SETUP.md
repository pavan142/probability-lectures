# Dataset Setup Instructions

This setup script will create the required folder structure and extract the dataset files from the local `datasets.zip` file.

## Prerequisites

1. **Ensure you have Node.js and npm installed**
2. **Place the `datasets.zip` file in the api directory**

## Running the Setup

1. **Navigate to the api directory**:
   ```bash
   cd api
   ```

2. **Ensure `datasets.zip` is in the api directory**

3. **Run the setup script**:
   ```bash
   npm run setup
   ```

## What the Setup Does

1. **Creates folder structure**:
   ```
   datasets/
   ├── processed/
   │   ├── matches/
   │   └── players/
   ```

2. **Extracts dataset files** from `datasets.zip` to the `datasets` folder.

## Manual Setup (if extraction fails)

If the automatic extraction fails, you can manually:

1. Ensure `datasets.zip` is in the api directory
2. Extract the zip file manually:
   ```bash
   unzip datasets.zip -d datasets/
   ```

## Troubleshooting

- If you get "datasets.zip file not found" error, ensure the zip file is in the api directory
- If you get permission errors, ensure you have write permissions in the api directory
- If extraction fails, check that the zip file is not corrupted

## Folder Structure After Setup

```
api/
├── datasets.zip
├── datasets/
│   ├── processed/
│   │   ├── matches/
│   │   └── players/
│   └── [extracted dataset files]
├── src/
├── dist/
└── ...
``` 