# E-Commerce Backend Server

Backend server for MERN E-commerce application built with TypeScript, Express, and MongoDB.

## Features

- TypeScript for type safety
- Express.js for API routing
- MongoDB with Mongoose ODM
- JWT authentication
- Input validation with express-validator
- ESLint & Prettier for code quality
- Environment-based configuration

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v10.15.0)
- MongoDB

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration

## Available Scripts

- `pnpm dev` - Run development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── types/          # TypeScript types & interfaces
├── utils/          # Utility functions
├── validations/    # Input validation schemas
└── index.ts        # Application entry point
```

## Environment Variables

See `.env.example` for required environment variables.

## Development

Run the development server:
```bash
pnpm dev
```

The server will start on `http://localhost:5000`

## License

ISC

