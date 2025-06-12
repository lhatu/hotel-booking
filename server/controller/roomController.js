import Hotel from "../model/Hotel.js";
import { v2 as cloundinary } from "cloudinary";
import Room from "../model/Room.js";

export const createRoom = async (req, res) =>  {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        const hotel = await Hotel.findOne({ owner:req.auth.userId })
        if (!hotel) {
            return res.json({
                success: false,
                message: "Hotel not found for this user"
            });
        }
        // Upload images to Cloudinary
        const uploadedImages = req.files.map(async (file) => {
            const response = await cloundinary.uploader.upload(file.path);
            return response.secure_url;
        })
        // Wait for all images to be uploaded
        const images = await Promise.all(uploadedImages)
        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities:  JSON.parse(amenities),
            images,
        })
        res.json({
            success: true,
            message: "Room created successfully"
        });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getRoom = async (req, res) =>  {
    try {
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 })
        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getOwnerRoom = async (req, res) =>  {
    try {
        const hotelData = await Hotel({ owner: req.auth.userId })
        const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel")
        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("Error fetching owner's rooms:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const toggleRoomAvailability = async (req, res) =>  {
    try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({
            success: true,
            message: "Room availability toggled successfully"
        });
    } catch (error) {
        console.error("Error toggling room availability:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}