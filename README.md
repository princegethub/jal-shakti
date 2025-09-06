# Jal Shakti Backend

A TypeScript backend application for the Jal Shakti project.

## Development

**Main Branch**: This repository uses `main` as the primary development branch.

### Prerequisites

- Node.js (v20 or higher)
- MongoDB
- npm

### Setup

1. Clone the repository:

```bash
git clone https://github.com/princegethub/jal-shakti.git
cd jal-shakti
```

2. Install dependencies:

```bash
npm ci
```

3. Set up environment variables:

```bash
cp .env.sample .env
```

4. Start the MongoDB service using Docker Compose:

```bash
docker-compose up -d
```

### Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run linting and formatting checks

### Database Migration

- `npm run migrate:dev` - Run migrations in development
- `npm run migrate:prod` - Run migrations in production

### Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm test` to ensure code quality
4. Submit a pull request to `main`

The CI/CD pipeline will automatically run linting and formatting checks on pull requests to the `main` branch.
