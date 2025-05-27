import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            // Email validation pattern: matches a standard email format
            match: new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
        },
        subject: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        dateTime: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String, // The refresh token itself
            default: null,
        },
        ip: {
            type: String,
        },
        ipDet: {
            type: JSON
        }
    },

    { timestamps: true }
);



const User = mongoose.model("User", userSchema);

export default User;