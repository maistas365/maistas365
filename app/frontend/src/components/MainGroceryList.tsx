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
import { FaTimesCircle, FaTrash, FaSearch } from "react-icons/fa";
import { FaRotate } from "react-icons/fa6";

const data = sampleData;

export default function MainGroceryList() {
    const [displayAmount, setDisplayAmount] = useState(10);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<JSX.Element[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const categories = [...new Set(data.map((item) => item.category))];

    const handleUpdate = (id: string) => {
        // Your update logic here
        console.log("Update item with id:", id);
    };

    const handleDelete = (id: string) => {
        // Your delete logic here
        console.log("Delete item with id:", id);
    };

    useEffect(() => {
        let totalAmount = 0;
        data.forEach((item) => {
            if (item.price) totalAmount += item.price;
        });
        setTotal(totalAmount);
    }, []);

    useEffect(() => {
        const filteredData = data.filter(
            (item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (selectedCategory === "" || item.category === selectedCategory)
        );

        const newItems = filteredData.slice(0, displayAmount).map((item) => (
            <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.shop}</TableCell>
                <TableCell className="text-center">{item.price}</TableCell>
                <TableCell className="text-center">
                    <Button
                        onClick={() => handleUpdate(item.id)}
                        className="bg-blue-500 h-8 mx-1"
                    >
                        <FaRotate />
                    </Button>
                    <Button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 h-8 mx-1"
                    >
                        <FaTrash />
                    </Button>
                </TableCell>
            </TableRow>
        ));
        setItems(newItems);
    }, [displayAmount, searchQuery, selectedCategory]);

    return (
        <div className="max-h-screen flex flex-row p-4 bg-gray-100">
            <div className="w-1/4 p-4">
                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search for an item..."
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FaSearch className="ml-2 text-gray-500" />
                </div>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                        Filter by Category
                    </h3>
                    <div className="flex flex-col">
                        <button
                            className={`p-2 mb-2 rounded-lg ${selectedCategory === "" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}
                            onClick={() => setSelectedCategory("")}
                        >
                            All Categories
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`p-2 mb-2 rounded-lg ${selectedCategory === category ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-3/4 p-4">
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
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="max-h-64 overflow-y-scroll">
                        {items}
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
