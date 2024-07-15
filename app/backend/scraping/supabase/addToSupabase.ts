import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises"; // Use fs/promises for async file operations
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
   
const supabase = createClient(supabaseUrl, supabaseKey);

const filePaths = ["../normalizedIki.json", "../normalizedRimi.json", "../normalizedMaxima.json"]; // Replace with your actual file paths
const BATCH_SIZE = 100;

async function readFiles() {
    try {
        const filePromises = filePaths.map((path) => fs.readFile(path, "utf-8"));
        const fileContents = await Promise.all(filePromises);
        return fileContents.map((content) => JSON.parse(content));
    } catch (error) {
        console.error("Error reading files:", error);
        throw error;
    }
}

async function insertRow(row: any) {
    try {
        const { data: insertedData, error } = await supabase
            .from("mainProducts") // Replace with your actual table name
            .insert([row]);

        if (error) {
            console.error("Error inserting row:", error);
        } else {
            console.log(`Row inserted successfully: ${JSON.stringify(insertedData)}`);
        }
    } catch (error) {
        console.error("Error inserting row:", error);
    }
}

async function insertDataInBatches(data: any) {
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        try {
            const { data: insertedData, error }: any = await supabase.from("mainProducts").insert(batch);

            if (error) {
                console.error("Batch insert error:", error);

                // Retry individual rows in the batch
                for (const row of batch) {
                    await insertRow(row);
                }
            } else {
                console.log(`Batch inserted successfully: ${insertedData.length} records`);
            }
        } catch (error) {
            console.error("Error inserting batch:", error);

            // Retry individual rows in the batch
            for (const row of batch) {
                await insertRow(row);
            }
        }
    }
}

async function main() {
    try {
        const fileData = await readFiles();
        const flattenedData = fileData.flat();

        await insertDataInBatches(flattenedData);
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

main();
