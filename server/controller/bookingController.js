import transporter from "../config/nodemailer.js";
import Booking from "../model/Booking.js"
import Hotel from "../model/Hotel.js";
import Room from "../model/Room.js";

// Check Availability of Rooms
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: new Date(checkOutDate) },
            checkOutDate: { $gte: new Date(checkInDate) }
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.error("Error checking room availability:", error);
        throw new Error("Internal server error");
    }
}

// API to Check Room Availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, room } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({
            success: true,
            isAvailable
        });
    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// API to Create Booking
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Room is not available for the selected dates"
            });
        }
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;
        // Calculate total price based on the number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        totalPrice *= nights;
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })
        // Send confirmation email to user
        const mailOptions = {
            from: '"Quick Stay" <no-reply@quickstay.com>',
            to: req.users.email,
            subject: "Booking Confirmation",
            html: `
                <h2>Your Booking Details</h2>
                <p>Dear: ${req.user.username},</p>
                <p>Thank you for booking with us! Here are your booking details: </p>
                <ul>
                    <li><strong>Booking ID:</strong> ${booking._id}</li>
                    <li><strong>Hotel:</strong> ${roomData.hotel.name}</li>
                    <li><strong>Location:</strong> ${roomData.hotel.address}</li>
                    <li><strong>Check-in Date:</strong> ${booking.checkInDate.toDateString()}</li>
                    <li><strong>Check-out Date:</strong> ${booking.checkOutDate.toDateString()}</li>
                    <li><strong>Total Price:</strong> $${booking.totalPrice.toFixed(2)}</li>
                </ul>
                <p>We look forward to welcoming you! If you have any question, please contact us.</p>
                <p>Best regards,</p>
            `
        }
        await transporter.sendMail(mailOptions)
        res.json({
            success: true,
            message: "Booking created successfully"
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// API to Get All Bookings of a User
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate("room hotel").sort({ createdAt: -1 });
        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }
        const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });
        // Total Bookings
        const totalBookings = bookings.length;
        // Total Revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);
        res.json({
            success: true,
            dashboardData: {
                totalBookings,
                totalRevenue,
                bookings,
            },
        });
    } catch (error) {
        console.error("Error fetching hotel bookings:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}