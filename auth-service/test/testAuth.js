const http = require("http");

const TOTAL_REQUESTS = 100000;
const URL = "http://localhost:8080/auth";

async function sendRequest() {
    return new Promise((resolve, reject) => {
        http.get(URL, (res) => {
            res.on("data", () => { });
            res.on("end", () => resolve(res.statusCode));
        }).on("error", reject);
    });
}

async function run() {
    console.time("Execution Time");

    let success = 0;
    let failed = 0;

    for (let i = 1; i <= TOTAL_REQUESTS; i++) {
        try {
            const status = await sendRequest();

            if (status === 200) {
                success++;
            } else {
                failed++;
            }

            if (i % 1000 === 0) {
                console.log(`Completed ${i} requests`);
            }
        } catch (err) {
            failed++;
        }
    }

    console.timeEnd("Execution Time");
    console.log("-----------------------------");
    console.log(`Total Requests : ${TOTAL_REQUESTS}`);
    console.log(`Successful     : ${success}`);
    console.log(`Failed         : ${failed}`);
}

run();