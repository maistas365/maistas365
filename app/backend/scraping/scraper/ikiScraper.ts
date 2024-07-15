// src/fetchDataAndAppendToFile.ts
import axios from "axios";
import fs from "fs/promises";
import path from "path";

async function fetchDataAndAppendToFile(url: string, totalIterations: number, filePath: string): Promise<void> {
    let fromIndex = 0;
    const fullFilePath = path.resolve(filePath);

    for (let i = 0; i < totalIterations; i++) {
        try {
            const response = await axios.post<{ data: any }>(url, {
                fromIndex,
                params: {
                    type: "view_products",
                    chainIds: ["CvKfTzV4TN5U8BTMF1Hl"],
                },
            });
            const newData = response.data.data;

            if (newData.length === 0) {
                console.log("No more data to fetch.");
                break;
            }

            await appendDataToFile(fullFilePath, newData);
            fromIndex += newData.length - 1;
            console.log(i);
        } catch (error) {
            console.error(`Error during fetching data for iteration ${i}:`, error);
            break;
        }
    }
}

async function appendDataToFile(filePath: string, dataToAppend: any): Promise<void> {
    try {
        let json: any = [];
        try {
            const data = await fs.readFile(filePath, "utf8");
            json = JSON.parse(data);
        } catch (err: any) {
            if (err.code !== "ENOENT") throw err; // Ignore file not found to start fresh
        }

        json = json.concat(dataToAppend);
        await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf8");
        console.log(`Successfully appended data to ${filePath}`);
    } catch (error) {
        console.error("Error handling the file:", error);
    }
}

// Example usage
const url = "https://search-dvbpbqktxq-lz.a.run.app/view_products"; // Your API endpoint
const totalIterations = 80;
const filePath = "../outputIki.json";

fetchDataAndAppendToFile(url, totalIterations, filePath);
