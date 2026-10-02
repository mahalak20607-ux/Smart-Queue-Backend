const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = "admin@smartqueue.com";
        const adminPassword = "Admin@12345";

        const existingAdmin = await User.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin account already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            adminPassword,
            12
        );

        const admin = await User.create({
            name: "Smart Queue Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isActive: true
        });

        console.log("================================");
        console.log("Admin account created successfully");
        console.log("Email:", admin.email);
        console.log("Password:", adminPassword);
        console.log("Role:", admin.role);
        console.log("================================");

        process.exit(0);

    } catch (error) {
        console.error(
            "Admin Creation Error:",
            error.message
        );

        process.exit(1);
    }
};

createAdmin();