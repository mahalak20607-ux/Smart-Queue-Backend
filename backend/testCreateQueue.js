const http = require("http");

const loginData = JSON.stringify({
    email: "admin@smartqueue.com",
    password: "Admin@12345"
});

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                resolve({
                    status: res.statusCode,
                    body: body
                });
            });
        });

        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

async function createQueue() {
    try {
        // ==============================
        // 1. Admin Login
        // ==============================
        const loginResponse = await request(
            {
                hostname: "localhost",
                port: 5000,
                path: "/api/auth/login",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(loginData)
                }
            },
            loginData
        );

        console.log("Login Status:", loginResponse.status);

        const loginResult = JSON.parse(loginResponse.body);

        if (!loginResult.success) {
            console.log("Login failed:");
            console.log(loginResponse.body);
            return;
        }

        const adminToken = loginResult.token;

        console.log("Admin login successful.");
        console.log("Admin role:", loginResult.user.role);

        // ==============================
        // 2. Create Queue
        // ==============================
        const queueData = JSON.stringify({
            name: "General Service",
            description: "General customer service queue",
            prefix: "GEN"
        });

        const queueResponse = await request(
            {
                hostname: "localhost",
                port: 5000,
                path: "/api/queues",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${adminToken}`,
                    "Content-Length": Buffer.byteLength(queueData)
                }
            },
            queueData
        );

        console.log("Queue Status:", queueResponse.status);
        console.log("Queue Response:");
        console.log(queueResponse.body);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

createQueue();