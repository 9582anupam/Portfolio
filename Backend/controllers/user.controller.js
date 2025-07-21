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
        console.log("Getting IP details for:", ip);
        if (!ip || ip === '::1' || ip === '127.0.0.1') {
            console.log("Local IP detected, returning default values");
            return {
                ip: ip || 'localhost',
                country_code: 'LOCAL',
                country_name: 'Local/Development',
                region_name: 'Local',
                city_name: 'Local',
                latitude: null,
                longitude: null,
                zip_code: null,
                time_zone: 'Asia/Kolkata',
                asn: null,
                as: 'Local Development',
                is_proxy: false
            };
        }

        const ipKey = process.env.IP_KEY;
        if (!ipKey) {
            console.error("IP_KEY environment variable not set");
            return null;
        }

        const response = await axios.get(`https://api.ip2location.io/?key=${ipKey}&ip=${ip}`);
        console.log("API Response:", response.data);
        
        // Manually create object from response.data with only specified fields
        const ipDetails = {
            ip: response.data.ip || ip,
            country_code: response.data.country_code || 'Unknown',
            country_name: response.data.country_name || 'Unknown',
            region_name: response.data.region_name || 'Unknown',
            city_name: response.data.city_name || 'Unknown',
            latitude: response.data.latitude || null,
            longitude: response.data.longitude || null,
            zip_code: response.data.zip_code || null,
            time_zone: response.data.time_zone || 'Asia/Kolkata',
            asn: response.data.asn || null,
            as: response.data.as || 'Unknown',
            is_proxy: response.data.is_proxy || false
        };
        
        console.log("Processed IP Details:", ipDetails);
        return ipDetails;
    } catch (error) {
        console.error("Error in getIpDetails:", error.message);
        // Return fallback object instead of null
        return {
            ip: ip || 'unknown',
            country_code: 'Unknown',
            country_name: 'Unknown',
            region_name: 'Unknown',
            city_name: 'Unknown',
            latitude: null,
            longitude: null,
            zip_code: null,
            time_zone: 'Asia/Kolkata',
            asn: null,
            as: 'Unknown',
            is_proxy: false
        };
    }
};

// add a new message
const putMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const now = new Date();
        const dateTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }); // IST timezone
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        console.log("Extracted IP:", ip);
        console.log("req.ip:", req.ip);
        console.log("req.connection.remoteAddress:", req.connection?.remoteAddress);
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
        const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        
        // Check if user with this IP already exists
        const existingUser = await User.findOne({ ip: ip });
        console.log("existingUser: ", existingUser);
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
        const dateTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }); // IST date and time
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