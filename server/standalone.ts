import { createServer } from "./index";

const app = createServer();
const port = 3001;

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
  console.log(`🔧 API endpoints: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
