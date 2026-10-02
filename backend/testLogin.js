const http = require("http");

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
                    body
                });
            });
        });

        req.on("error", reject);
        req.write(data);
        req.end();
    });
}

async function generateUserToken() {
    try {
        // ==============================
        // 1. User Login
        // ==============================

        const loginData = JSON.stringify({
            email: "user@smartqueue.com",
            password: "User@12345"
        });

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

        const loginResult = JSON.parse(loginResponse.body);

        console.log("Login Status:", loginResponse.status);

        if (!loginResult.success) {
            console.log(loginResponse.body);
            return;
        }

        const userToken = loginResult.token;

        console.log("User Login Successful");
        console.log("Role:", loginResult.user.role);

        // ==============================
        // 2. Get Active Queues
        // ==============================

        const queueResponse = await request(
            {
                hostname: "localhost",
                port: 5000,
                path: "/api/queues/active",
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${userToken}`
                }
            },
            ""
        );

        console.log("Queue Status:", queueResponse.status);

        const queueResult = JSON.parse(queueResponse.body);

        console.log("Active Queues:", queueResult.count);

        if (!queueResult.success || queueResult.queues.length === 0) {
            console.log("No active queue found.");
            return;
        }

        const queueId = queueResult.queues[0]._id;

        console.log("Using Queue:", queueResult.queues[0].name);
        console.log("Prefix:", queueResult.queues[0].prefix);

        // ==============================
        // 3. Generate Token
        // ==============================

        const tokenData = JSON.stringify({
            queueId: queueId
        });

        const tokenResponse = await request(
            {
                hostname: "localhost",
                port: 5000,
                path: "/api/tokens",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Length": Buffer.byteLength(tokenData)
                }
            },
            tokenData
        );

        console.log("Token Status:", tokenResponse.status);
        console.log("Token Response:");
        console.log(tokenResponse.body);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

generateUserToken();