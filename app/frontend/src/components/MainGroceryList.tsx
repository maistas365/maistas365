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

const data = sampleData;

export default function MainGroceryList() {
    const [displayAmount, setDisplayAmount] = useState(10);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<JSX.Element[]>([]);

    const handleUpdate = (id) => {
        // Your update logic here
        console.log("Update item with id:", id);
    };

    const handleDelete = (id) => {
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
        const newItems = data.slice(0, displayAmount).map((item) => (
            <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.shop}</TableCell>
                <TableCell className="text-center">{item.price}</TableCell>
                <TableCell className="text-center">
                    <Button
                        onClick={() => handleUpdate(item.id)}
                        className="bg-blue-500 h-8 mx-1"
                    >
                        Update
                    </Button>
                    <Button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 h-8 mx-1"
                    >
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
        ));
        setItems(newItems);
    }, [displayAmount]);

    return (
        <div className="max-h-screen ">
            <Table>
                <TableCaption>A list of your current groceries</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-center">Store</TableHead>
                        <TableHead className="text-center">Price</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="max-h-64 overflow-y-scroll">
                    {items}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-center">{total}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <Button
                onClick={() => setDisplayAmount((prev) => prev + 10)}
                className="bg-slate-700 h-8 mt-2"
            >
                Load More
            </Button>
        </div>
    );
}
