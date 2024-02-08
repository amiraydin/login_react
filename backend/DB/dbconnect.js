const mongoose = require("mongoose");
const url = process.env.DB;
const connectDB = async () => {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("DB Connected! ✅")
    } catch (error) {
        console.error("DB not Connected! ⛔", error.message)
        // process.exit(1);
    }
}
module.exports = connectDB;