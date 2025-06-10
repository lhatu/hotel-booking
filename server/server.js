import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express"
import clerkWebhooks from "./controller/clerkWebhooks.js";

connectDB()

const app = express()
app.use(cors())

// Middleware to parse JSON bodies
app.use(express.json());
app.use(clerkMiddleware());

// API to listen for Clerk webhooks
app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => res.send("API is running..."))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));