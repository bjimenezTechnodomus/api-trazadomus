# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

# Trazadomus API

API para consumir datos de ciclos de esterilización de los equipos Laoken - provides REST endpoints to query plasma sterilization cycle data for technodomus.com.

## Quick Start Commands

### Development
- Install dependencies: `npm install`
- Build and start development server: `npm run dev` (watches src/ for changes)
- Build TypeScript to dist/: `npm run build` (runs lint + tsc)
- Start production server: `npm start`
- Lint code: `npm run lint`

### Testing
- Run tests: `npm test` (currently no tests specified)

## Environment Variables

Required for database connectivity (see `.env` file):
- `DB_HOST`: MySQL host IP/hostname
- `DB_USER`: MySQL username  
- `DB_PASS`: MySQL password
- `DB_NAME`: MySQL database name
- `DB_PORT`: MySQL port (default 3306)
- `PORT`: Application port (default 8080)

## High-Level Architecture

### Stack
- **TypeScript + Express.js**: REST API server
- **mysql2**: MySQL database connectivity with connection pooling
- **Google Cloud Run**: Docker-based deployment target
- **TSLint**: Code quality enforcement

### Request Flow
1. HTTP request → Express router
2. Query parameter parsing and validation
3. SQL query construction with parameterization
4. MySQL connection via pool
5. Response formatting and return

### Database Connection Pattern
The application uses a single mysql2 connection pool created at startup (`mysql.createPool().promise()`) for all database operations. All queries use parameterized statements for security.

## API Endpoints

### GET /
Health check - returns `{status: "API trazadomus"}`

### GET /ciclos
Fetch sterilization cycles with optional filtering:
- **Query Parameters:**
  - `size`: Number of cycles to return (default: 50)
  - `startDate`: Start date filter (YYYY-MM-DD format)
  - `endDate`: End date filter (YYYY-MM-DD format)
- **Returns:** Array of cycle objects with detailed telemetry data

### GET /ciclos/:idGRD  
Fetch cycles for specific equipment:
- **Path Parameters:**
  - `idGRD`: Equipment GRD identifier
- **Query Parameters:**
  - `size`: Number of cycles (default: 50)  
  - `start`: Start date filter (YYYY-MM-DD)
  - `end`: End date filter (YYYY-MM-DD)

### GET /equipos
List all equipment with locations:
- **Returns:** Array with `{id, idGRD, ubicacion}` objects

### GET /equipos/status/:idGRD?
Get equipment connection status:
- **Path Parameters:**
  - `idGRD`: (Optional) Specific equipment ID
- **Returns:** Status data including `{ultimaConexion, idGRD, ubicacion, activo}`

## Database Schema

### Key Tables
- **ciclos2**: Main sterilization cycles data
  - Contains detailed telemetry parameters (p1-p25)
  - Includes timing data, temperatures, pressures, error codes
  - See `estructura.md` for complete field documentation
- **equipos**: Equipment registry with GRD IDs
- **c_ubicacion**: Location/facility information
- **c_equipo_ubicacion**: Equipment-location relationships
- **reports**: Connection status tracking

### Query Patterns
The `queryCiclos()` function demonstrates the parameterized query approach:
- Dynamic WHERE clause building
- Parameter binding for security
- Consistent ordering (datefecha DESC)
- LIMIT clause for pagination

## Deployment (Google Cloud Run)

### Docker Build
The existing `Dockerfile` provides a simple Node.js container setup:
```bash
docker build -t trazadomus-api .
```

### Cloud Deployment
The `deploy.sh` script handles full deployment pipeline:
1. Builds Docker image
2. Pushes to Google Artifact Registry  
3. Deploys to Cloud Run with environment variables
4. Configures public access

**Key Configuration:**
- Project: `trazadomus`
- Service: `trazadomus-api` 
- Region: `us-central1`
- Domain: `trazadomus-api.technodomus.com`

## Development Guidelines

### Code Quality
- TSLint configuration in `tslint.json`
- TypeScript strict mode enabled
- All SQL queries must be parameterized

### Response Patterns
- Success: Return data array directly or `{status: "message"}`
- No data: `{status: "No hay datos"}`
- Errors: `{error: "Error description", message: error.message}` with 500 status

### TODOs (from README)
- [ ] Enable security/authentication
- [ ] Standardize query parameter naming (`end` vs `endDate`)
- [x] Support configurable record limits
- [x] Support date range filtering
- [x] Deploy to Technodomus domain

## File Structure

```
src/
  index.ts          # Main application entry point
dist/               # Compiled JavaScript output
deploy.sh          # Google Cloud Run deployment script  
Dockerfile         # Container configuration
estructura.md      # Database schema documentation
next.md           # Future feature planning
codigosP.md       # Additional documentation
```

## Key Implementation Details

- **Date Handling**: Uses MySQL DATE/TIME functions for proper formatting
- **Error Handling**: Try-catch blocks with structured error responses  
- **Pool Management**: Single connection pool shared across requests
- **Query Building**: Dynamic query construction based on optional parameters
- **Type Safety**: RowDataPacket typing for MySQL result sets

## Security Notes

- All database queries use parameterized statements
- No authentication currently implemented (TODO)
- CORS not configured (consider for production)
- Database credentials in plain `.env` file (use Secret Manager in production)