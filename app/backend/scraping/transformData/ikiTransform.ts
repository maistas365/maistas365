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

    // Loop through each item in the inputData array
    for (const item of inputData) {
        // Construct the transformed item using the required fields
        const price = item.prc ? item.prc.ap : null
        const transformedItem = {
            id: item.id,
            name: item.name.lt, // Assuming you want the Lithuanian name version
            categoryId: item.categoryId,
            price: item.prc ? item.prc.ap : null, // Assuming 'prc.ap' is the price you want
            url: "https://lastmile.lt/product/IKI/" + item.slugs[0] || null,
            image: item.thumbUrl,
            pricePer: price !== null ? Math.round(price / item.conversionValue *100) / 100: null, // Assuming you need to calculate or it's not available directly
            unit: item.conversionMeasure.toLowerCase() || null,
            shop: "iki", // You can change this to the specific shop as needed
            available: item.isActive
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
    const inputData = readJsonFromFile("../outputIki.json");
    if (inputData) {
        const transformedData = transformData(inputData);
        writeJsonToFile("../normalizedIki.json", transformedData);
    }
}

// Execute the main function
main();
