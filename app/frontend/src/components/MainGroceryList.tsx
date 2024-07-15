import { useEffect, useState } from "react";
import { sampleData } from "../sampleData";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { FaSearch } from "react-icons/fa";
import GroceryItem from "./GroceryItem";
import SearchItem from "./SearchItem";

export type Data = {
    id: string;
    name: string;
    categoryId: string;
    price: number | null;
    url: string;
    image: string;
    pricePer: number | null;
    unit: string;
    shop: string;
    available: boolean;
};
const data = sampleData;

type Items = {
    itemInfo: Data;
    quantity: number;
    id: string;
};

export default function MainGroceryList() {
    const [displayAmount, setDisplayAmount] = useState(10);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<Map<string, Items>>(new Map());
    const [searchQuery, setSearchQuery] = useState("");
    const [currentSearches, setCurrentSearches] = useState<JSX.Element[]>([]);

    useEffect(() => {
        let totalAmount = 0;
        items.forEach((item) => {
            if (item.itemInfo.price) totalAmount += item.itemInfo.price;
        });
        setTotal(totalAmount);
    }, [items]);

    useEffect(() => {
        const matchingSearches: Data[] = [];
        const regex = new RegExp(searchQuery, "i"); // 'i' makes the search case-insensitive

        data.forEach((dataPoint: Data) => {
            if (matchingSearches.length >= 5) return;
            if (regex.test(dataPoint.name)) {
                matchingSearches.push(dataPoint);
            }
        });
        const jsxSearches = matchingSearches.map((item) => (
            <SearchItem item={item} addItem={addItem} />
        ));
        setCurrentSearches(jsxSearches);
    }, [searchQuery, data]);

    const addItem = (item: Data) => {
        const newItem = {
            itemInfo: item,
            quantity: 1,
            id: item.id,
        };
        setItems((prevMap) => {
            const newMap = new Map(prevMap);
            if (newMap.has(item.id)) {
                // If the item already exists, update its quantity
                const existingItem = newMap.get(newItem.id);
                if (existingItem) {
                    newMap.set(newItem.id, {
                        ...existingItem,
                        quantity: existingItem.quantity + newItem.quantity,
                    });
                }
            } else {
                // If the item does not exist, add it to the Map
                newMap.set(newItem.id, newItem);
            }
            return newMap;
        });
    };

    const handleUpdate = (id: string) => {
        // Your update logic here
        console.log("Update item with id:", id);
    };

    const handleDelete = (id: string) => {
        // Your delete logic here
        console.log("Delete item with id:", id);
    };

    return (
        <div className="max-h-screen flex flex-row p-4 bg-gray-100">
            <div className="w-72 min-w-72 p-4">
                <div className="flex flex-col min-w-full  mb-4">
                    <div className="flex flex-row items-center">
                        <input
                            type="text"
                            placeholder="Search for an item..."
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex-col flex  mt-2 w-full">
                        {currentSearches}
                    </div>
                </div>
            </div>
            <div className="w-full p-4">
                <Table className="bg-white shadow-lg rounded-lg">
                    <TableCaption className="text-lg font-semibold">
                        A list of your current groceries
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">Store</TableHead>
                            <TableHead className="text-center">Price</TableHead>
                            <TableHead className="text-center">
                                Quantity
                            </TableHead>
                            <TableHead className="text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from(items.values()).map((item) => (
                            <GroceryItem
                                item={item.itemInfo}
                                quantity={item.quantity}
                            />
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} className="font-semibold">
                                Total
                            </TableCell>
                            <TableCell
                                className="text-center font-semibold"
                                colSpan={1}
                            >
                                ${total.toFixed(2)}
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                <div className="flex justify-center mt-4">
                    <Button
                        onClick={() => setDisplayAmount((prev) => prev + 10)}
                        className="bg-slate-700 text-white h-10 px-4 rounded-lg"
                    >
                        Load More
                    </Button>
                </div>
            </div>
        </div>
    );
}
