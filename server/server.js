import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express"
import clerkWebhooks from "./controller/clerkWebhooks.js";
import userRouter from "./route/userRoutes.js";
import hotelRouter from "./route/hotelRoutes.js";
import connectCloudinary from "./config/cloundinary.js";
import roomRouter from "./route/roomRoutes.js";
import bookingRouter from "./route/bookingRoutes.js";

connectDB()
connectCloudinary();

const app = express()
app.use(cors())

// Middleware to parse JSON bodies
app.use(express.json());
app.use(clerkMiddleware());

// API to listen for Clerk webhooks
app.use("/api/clerk", clerkWebhooks);

app.get("/", (req, res) => res.send("API is running..."))
app.use("/api/users", userRouter)
app.use("/api/hotels", hotelRouter)
app.use("/api/rooms", roomRouter)
app.use("/api/bookings", bookingRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));