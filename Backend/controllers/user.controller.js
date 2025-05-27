import User from "../models/user.model.js";
import { generateAccessAndRefreshToken } from "../helper/generateAccessAndRefreshToken.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/email.js";
import axios from 'axios';

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
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        console.log(response.data);
        return response.data;
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
        const data = new User({ name, email, subject, message, dateTime, ip, ipDet });
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

export {
    putMessage
};