# Cloud Cost Explainer

Cloud Cost Explainer (Peekaboo) is an intelligent cloud management tool designed to monitor, explain, and optimize AWS infrastructure costs. It translates complex cloud billing metrics into readable, actionable insights for developers and teams.

---

## Dashboard Preview

![Cloud Cost Explainer Dashboard Preview](assets/dashboard_preview.png)

---

## Features

- **Automated Cost Summaries**: Generates plain-text summaries explaining cloud spending trends, anomalies, and breakdowns.
- **Dual Mode Operation**:
  - **Mock Mode**: Zero-configuration demo mode for quick local evaluation.
  - **Real AWS Mode**: Integrates directly with AWS APIs using Read-Only IAM roles.
- **SQLite Data Store**: Lightweight local database for tracking daily cost records and report history.
- **Modern Dashboard UI**: Built with Next.js and Tailwind CSS for interactive cost analysis.
- **RESTful API**: Go-powered HTTP server providing structured endpoints for cost reporting and AWS account connections.

---

## Tech Stack

### Backend
- **Language**: Go (Golang)
- **Database**: SQLite3
- **Router**: Native Go HTTP router with middleware support

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

---

## Repository Structure

```
.
├── assets/           # Application screenshots and visual assets
├── backend/
│   ├── api/          # HTTP handlers and router configuration
│   ├── awsclient/    # AWS API client implementations (Mock & Real)
│   ├── config/       # Environment configuration loader
│   ├── db/           # SQLite database initialization & repository queries
│   ├── explainer/    # Cost interpretation and natural language generation
│   ├── services/     # Core domain logic and cost analysis service
│   ├── go.mod        # Go dependencies
│   └── main.go       # Backend entry point
├── frontend/
│   ├── app/          # Next.js App Router pages and layout
│   ├── components/   # UI components
│   ├── lib/          # Helper utilities and API integration logic
│   ├── package.json  # Frontend dependencies and scripts
│   └── tsconfig.json # TypeScript configuration
└── README.md
```

---

## Prerequisites

Before running the application, ensure you have the following installed on your system:

- **Go**: v1.20 or later
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **Git**

---

## Quick Start & Setup Guide

### 1. Clone the Repository

```bash
git clone git@github.com:Anchalrawat/Cloud-Cost-Explainer.git
cd Cloud-Cost-Explainer
```

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Run the Go backend server (starts in Mock Mode by default on port 3000):
   ```bash
   go run main.go
   ```

3. The server will start on `http://localhost:3000`. You should see logs indicating database initialization and mock mode setup:
   ```text
   Starting Cloud Cost Explainer MVP Backend...
   SQLite database initialized successfully.
   Running in AWS MOCK MODE (Zero-config demo mode)
   Cloud Cost Explainer backend server running on http://localhost:3000
   ```

---

### 3. Frontend Setup

1. Open a new terminal tab and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3001` (or the URL displayed in terminal) in your browser to view the application.

---

## Configuration

The backend supports configuration via environment variables:

| Environment Variable | Description | Default Value |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `3000` |
| `DB_PATH` | Path to SQLite database file | `peekaboo.db` |
| `AWS_MOCK_MODE` | Enable zero-config mock data mode (`true`/`false`) | `true` |
| `AWS_REGION` | Default AWS region for API requests | `us-east-1` |

### Running in Real AWS Mode

To connect to actual AWS infrastructure, launch the backend with `AWS_MOCK_MODE=false`:

```bash
AWS_MOCK_MODE=false AWS_REGION=us-east-1 PORT=3000 go run main.go
```

Ensure standard AWS credentials or IAM role permissions are configured on your system when using Real AWS Mode.

---

## API Documentation

### System Endpoints

- **GET `/`**
  - Returns backend metadata and available routes.
- **GET `/health`**
  - Health check endpoint returning system status.

### Report & Cost Endpoints

- **GET `/api/reports/latest`**
  - Fetches the latest generated cost report summary in JSON format.
- **GET `/api/explainer/summary`**
  - Returns the plain-text natural language summary of cloud costs.
- **POST `/api/reports/run`**
  - Triggers a fresh cost analysis run for the authenticated user.

### AWS Account Management

- **POST `/api/aws/connect`**
  - Connects an AWS account using IAM Role ARN and External ID.
  - **Request Body**:
    ```json
    {
      "user_id": "usr-demo-1",
      "account_id": "123456789012",
      "role_arn": "arn:aws:iam::123456789012:role/PeekabooReadOnlyRole",
      "external_id": "optional-external-id"
    }
    ```

---

## Testing

### Backend Tests

To run Go unit tests:

```bash
cd backend
go test ./... -v
```

### Frontend Linting

To run ESLint on the frontend:

```bash
cd frontend
npm run lint
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
