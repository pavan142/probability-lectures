# TypeScript Node.js Backend

A simple TypeScript Node.js backend project with Express.js.

## Features

- TypeScript support
- Express.js web framework
- Basic API endpoints
- Health check endpoint
- Error handling middleware
- Development and production builds

## Setup

1. Install dependencies:
```bash
npm install
```

2. Development mode:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Start production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run watch` - Watch for changes and recompile

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/items` - Sample API endpoint

## Project Structure

```
├── src/
│   └── main.ts          # Main application file
├── dist/                # Compiled JavaScript (generated)
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
``` 