#!/usr/bin/env node

import { Command } from "commander";
import axios from "axios";
import dotenv from "dotenv";
import { spawn } from "child_process";
import open from "open";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const API_URL = "http://localhost:5000";
const UI_URL = "http://localhost:3000";
const program = new Command();

// Utility function to check if a service is running
async function isServiceRunning(url) {
  try {
    await axios.get(url);
    return true;
  } catch (error) {
<<<<<<< HEAD
    if (error.code === 'ECONNREFUSED') {
      return false;
    }
    // If we get any response from the server, even an error, it means it's running
    return error.response !== undefined;
=======
    return false;
>>>>>>> new-branch-name
  }
}

// Start backend server
async function startBackend() {
<<<<<<< HEAD
  if (await isServiceRunning(`${API_URL}/`)) {
=======
  if (await isServiceRunning(`${API_URL}/books/status`)) {
>>>>>>> new-branch-name
    console.log("Backend is already running");
    return;
  }

  console.log("Starting backend server...");
  const backend = spawn("npm", ["run", "start-backend"], {
    stdio: "inherit",
    shell: true,
  });

  // Wait for backend to start
  let attempts = 0;
<<<<<<< HEAD
  while (attempts < 30) { 
    if (await isServiceRunning(`${API_URL}/`)) {
      console.log("Backend server is ready");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }
  throw new Error("Failed to start backend server. Please check the server logs for more details.");
=======
  while (attempts < 15) {
    if (await isServiceRunning(`${API_URL}/books/status`)) {
      console.log("Backend server is ready");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }
  throw new Error("Failed to start backend server");
>>>>>>> new-branch-name
}

// Start frontend server
async function startFrontend() {
  console.log("Starting frontend server...");
  const frontend = spawn("npm", ["run", "start-frontend"], {
    stdio: "inherit",
    shell: true,
  });

  // Wait for frontend to start (looking for the "compiled successfully" message)
  return new Promise((resolve, reject) => {
    // Give it some time to start
    setTimeout(() => {
      console.log("Frontend server should be ready");
      resolve();
    }, 5000);
  });
}

// Start both servers and open browser
async function startServers() {
  try {
    await startBackend();
    await startFrontend();
    console.log("Opening web interface...");
    // Give the frontend a moment to be fully ready
    setTimeout(async () => {
      await open(UI_URL);
    }, 2000);
  } catch (error) {
    console.error("Error starting servers:", error.message);
    process.exit(1);
  }
}

program
  .name("ebook-classifier")
  .description("CLI tool to process and classify ebooks")
  .version("1.0.0");

// Command to process a Calibre library
program
  .command("process-library")
  .description("Process and classify books from a Calibre library")
  .requiredOption(
    "-p, --path <path>",
    "Specify the Calibre library directory path"
  )
  .option("-f, --force", "Force reprocessing of all books", false)
  .action(async (options) => {
    try {
      // Start both servers
      await startServers();

      console.log(`Processing Calibre library at: ${options.path}`);
      const response = await axios.post(`${API_URL}/books/fetch-calibre`, {
        libraryPath: options.path,
        force: options.force,
      });

      console.log("Library processing completed!");
      console.log(`Processed ${response.data.count} books`);
    } catch (error) {
      console.error("Error processing library:", error.message);
      process.exit(1);
    }
  });

// Command to classify a single book
program
  .command("classify")
  .description("Classify a single ebook file")
  .requiredOption("-f, --file <path>", "Path to the ebook file")
  .action(async (options) => {
    try {
      await startServers();

      console.log(`Classifying book: ${options.file}`);
      const response = await axios.post(`${API_URL}/books/classify`, {
        filePath: options.file,
      });

      console.log("\nClassification Results:");
      console.log("Genre:", response.data.genre);
      console.log("Confidence:", response.data.confidence);
      console.log("Tags:", response.data.tags.join(", "));
    } catch (error) {
      console.error("Error classifying book:", error.message);
      process.exit(1);
    }
  });

// Command to start the web interface
program
  .command("ui")
  .description("Start the web interface")
  .action(async () => {
    try {
      await startServers();
    } catch (error) {
      console.error("Error starting web interface:", error.message);
      process.exit(1);
    }
  });

// Command to check system status
program
  .command("status")
  .description("Check the status of the classification service")
  .action(async () => {
    try {
      const status = await axios.get(`${API_URL}/books/status`);
      console.log("Service Status:", status.data.status);
      console.log("Books Processed:", status.data.booksProcessed);
      console.log("API Version:", status.data.version);
    } catch (error) {
      console.error("Service is not running");
      process.exit(1);
    }
  });

program.parse(process.argv);
