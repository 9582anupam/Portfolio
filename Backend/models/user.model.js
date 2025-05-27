import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        dateTime: {
            type: String,
        },
        ipDet: {
            type: Object,
        },
        ip: {
            type: String,
            unique: true,
            required: true,
        },
    },

    { timestamps: true }
);



const User = mongoose.model("User", userSchema);

export default User;