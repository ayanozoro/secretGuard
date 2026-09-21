import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB, disconnectDB } from "@secretguard/database";
import { logger } from "@secretguard/shared";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    logger.banner();
    logger.info("Initializing SecretGuard REST API Server...");

    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.success(`SecretGuard API running on http://localhost:${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      logger.warn(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info("HTTP server closed. Process exiting.");
        process.exit(0);
      });

      // Force shutdown if taking too long
      setTimeout(() => {
        logger.error("Forceful shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    return server;
  } catch (error) {
    logger.error(`Failed to start API server: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && (process.argv[1].endsWith("server.js") || process.argv[1].includes("server.js"))) {
  startServer();
}

export { startServer };
export default startServer;
