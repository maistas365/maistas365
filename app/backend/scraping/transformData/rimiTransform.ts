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
const transformFunction = (pricePerString: string) => {
    if (pricePerString) {
        // Split the string by space to separate the price and the unit
        const splitString =  pricePerString.split(" ");
        if (splitString.length !== 2) return {pricePer: null, unit: null}
        let [price, unit]  = splitString

        // Replace the comma with a period and convert to float
        let pricePer = parseFloat(price.replace(",", "."));

        // Extract the unit (remove any leading symbols like €/)
        unit = unit.slice(2);

        if (unit[unit.length - 1] === ".") {
            unit = unit.slice(0, -1);
        }
        return { pricePer, unit };
    }
    return {pricePer: null, unit: null}; // or any default value/error handling
};

// Function to transform the data
function transformData(inputData: any) {
    const transformedItems = [];
    for (const key in inputData) {
        const item = inputData[key];
        const {pricePer, unit} = transformFunction(item.pricePer)
       
        const transformedItem = {
            id: item.id,
            name: item.name,
            categoryId: item.category,
            price: item.price,
            url: item.url,
            image: item.image,
            pricePer: pricePer,
            unit: unit,
            shop: "rimi",
            available: item.pricePer !== "Šiuo metu prekės nėra"
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
    const inputData = readJsonFromFile("../outputRimi.json");
    if (inputData) {
        const transformedData = transformData(inputData);
        writeJsonToFile("../normalizedRimi.json", transformedData);
    }
}

// Execute the main function
main();
