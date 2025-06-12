import Hotel from "../model/Hotel.js";
import User from "../model/User.js";

export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body;
        const owner = req.user._id;
        const hotel = await Hotel.findOne({owner})
        if (hotel) {
            return res.json({
                success: false,
                message: "Hotel already registered by this user"
            });
        }
        await Hotel.create({name, address, contact, owner, city});
        await User.findByIdAndUpdate(owner, { role: 'hotelOwner' });
        res.json({
            success: true,
            message: "Hotel registered successfully"
        });
    } catch (error) {
        console.error("Error registering hotel:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
