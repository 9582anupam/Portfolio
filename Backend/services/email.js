import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

export const sendEmail = async (name, email, subject, message, ipDet) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );

        oAuth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN
        });

        // Get a fresh access token
        const { credentials } = await oAuth2Client.refreshAccessToken();
        const accessToken = credentials.access_token;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL}>`,
            to: process.env.EMAIL,
            subject: `Portfolio Contact: ${subject}`,
            text: `
                Name: ${name}
                Email: ${email}
                Subject: ${subject}
                Message: ${message}
            `,
            html: `
                <h3>New Portfolio Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message}</p>

                <h4>Visitor Info</h4>
                <p><strong>IP Address:</strong> ${ipDet?.ip || 'Unknown'}</p>
                <p><strong>Country:</strong> ${ipDet?.country_name || 'Unknown'} (${ipDet?.country_code || 'Unknown'})</p>
                <p><strong>Region:</strong> ${ipDet?.region_name || 'Unknown'}</p>
                <p><strong>City:</strong> ${ipDet?.city_name || 'Unknown'}</p>
                <p><strong>ZIP Code:</strong> ${ipDet?.zip_code || 'Unknown'}</p>
                <p><strong>Latitude:</strong> ${ipDet?.latitude || 'Unknown'}</p>
                <p><strong>Longitude:</strong> ${ipDet?.longitude || 'Unknown'}</p>
                <p><strong>Timezone:</strong> ${ipDet?.time_zone || 'Unknown'}</p>
                <p><strong>ISP:</strong> ${ipDet?.as || 'Unknown'}</p>
                <p><strong>Organization:</strong> ${ipDet?.as || 'Unknown'}</p>
                <p><strong>AS:</strong> ${ipDet?.asn || 'Unknown'}</p>
            `
            ,
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.error("Error while sending mail:", err);

        // If it's an OAuth2 error, provide more specific guidance
        if (err.message && err.message.includes('invalid_grant')) {
            throw new Error("OAuth2 credentials have expired. Please regenerate your refresh token.");
        }

        throw new Error("Failed to send email. Please try again later.");
    }
};