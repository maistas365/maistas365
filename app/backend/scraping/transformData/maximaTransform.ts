import fs from "fs"

// Function to read JSON data from a file
function readJsonFromFile(filePath: string) {
    try {
        const jsonString = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(jsonString);
        return jsonData;
    } catch (error) {
        console.error("Error reading file:", error);
        return null;
    }
}

// Function to transform the data
function transformData(inputData: any) {
    const transformedItems = [];

    // Iterate over each product in the inputData object
    for (const key in inputData) {
        const item = inputData[key];

        // Construct the transformed item using the required fields
        const transformedItem = {
            id: item.id,
            name: item.title,
            categoryId: item.category_id,
            price: item.retail_price || item.price, // Ensure price is taken as a number, preferring retail price if available
            url: "https://www.barbora.lt/produktai/" + item.Url, // Complete URL
            image: item.big_image, // Using 'big_image' for a larger product image
            pricePer: item.comparative_unit_price|| null, // Correctly format price per unit
            unit: item.comparative_unit === "vnt."?"vnt": item.comparative_unit || null, // Adding units extracted from the 'units' field in the data
            shop: "maxima",
            available: item.status === "active"?true: false
        };
        transformedItems.push(transformedItem);
    }

    return transformedItems;
}


// Function to write JSON data to a file
function writeJsonToFile(filePath: string, data: any) {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonString, "utf8");
        console.log("Data written successfully to", filePath);
    } catch (error) {
        console.error("Error writing file:", error);
    }
}

// Main function to execute the read-transform-write process
function main() {
    const inputData = readJsonFromFile("../outputBarbora.json");
    if (inputData) {
        const transformedData = transformData(inputData);
        writeJsonToFile("../normalizedMaxima.json", transformedData);
    }
}

// Execute the main function
main();
