import User from "../models/user.model.js";
import { generateAccessAndRefreshToken } from "../helper/generateAccessAndRefreshToken.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/email.js";
import axios from 'axios';
import Message from "../models/message.model.js";

// export const getUserIpAddress = async () => {
//     try {
//         const response = await fetch('https://api.ipify.org?format=json');
//         const data = await response.json();
//         return data.ip;
//     } catch (error) {
//         console.error('Error fetching IP address:', error);
//         return null;
//     }
// };

export const getIpDetails = async (ip) => {
    try {
        const ipKey = process.env.IP_KEY;
        const response = await axios.get(`https://api.ip2location.io/?key=${ipKey}&ip=${ip}`);
        
        // Manually create object from response.data with only specified fields
        const ipDetails = {
            ip: response.data.ip || null,
            country_code: response.data.country_code || null,
            country_name: response.data.country_name || null,
            region_name: response.data.region_name || null,
            city_name: response.data.city_name || null,
            latitude: response.data.latitude || null,
            longitude: response.data.longitude || null,
            zip_code: response.data.zip_code || null,
            time_zone: response.data.time_zone || null,
            asn: response.data.asn || null,
            as: response.data.as || null,
            is_proxy: response.data.is_proxy || false
        };
        
        console.log("Processed IP Details:", ipDetails);
        return ipDetails;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// add a new message
const putMessage = async (req, res) => {
    try {
        const { name, email, subject, message, ip } = req.body;
        const now = new Date();
        const dateTime = now.toLocaleString(); // Local date and time
        // const ip = await getUserIpAddress();
        const ipDet = await getIpDetails(ip);
        console.log("ipDet here", ipDet);
        const data = new Message({ name, email, subject, message, dateTime, ip, ipDet });
        await data.save();
        await sendEmail(name, email, subject, message, ipDet);
        res.status(200).json({
            message: "Message Saved Successfully",
            success: true,
            status: 200,
        });

    } catch (error) {
        console.log("error on putMessage: ", error);
        res.status(500).json({
            message: "Error Occured",
            error: error.message,
            status: 500,
            success: false,
        });
    }
};


const newUser = async (req, res) => {

    try {
        const { ip } = req.body;
        
        // Check if user with this IP already exists
        const existingUser = await User.findOne({ ip: ip });
        
        if (existingUser) {
            return res.status(200).json({
                message: "user already exists with this IP",
                success: true,
                status: 200,
                isExisting: true,
            });
        }
        
        // If IP doesn't exist, create new user
        const ipDet = await getIpDetails(ip);
        const now = new Date();
        const dateTime = now.toLocaleString(); // Local date and time
        const user = new User({ipDet, dateTime, ip});
        await user.save();

        res.status(200).json({
            message: "user stored successfully",
            success: true,
            status: 200,
            isExisting: false,
        });
        
    } catch (error) {
        console.log("error in newUser: ", error);
        res.status(500).json({
            message: "error occured while adding new user details",
            error,
            status: 500,
            success: false,
        })
    }
};


export {
    putMessage,
    newUser
};