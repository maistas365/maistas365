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
    const [displayAmmount, setDisplayAmmount] = useState(10);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState<JSX.Element[]>([]);
    useEffect(() => {
        let totalAmmount = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].price !== null) totalAmmount += data[i].price as number;
        }
        setTotal(totalAmmount);
    }, []);
    useEffect(() => {
        const newItems = [];
        for (let i = 0; i < displayAmmount && i< data.length; i++) {
            
            newItems.push(
                <TableRow key={data[i].id}>
                    <TableCell className="font-medium">
                        {data[i].name}
                    </TableCell>
                    <TableCell className="text-center">
                        {data[i].shop}
                    </TableCell>
                    <TableCell className="text-center">
                        {data[i].price}
                    </TableCell>
                </TableRow>
            );
        }
        setItems(newItems);
    }, [displayAmmount]);

    return (
        <div className="">
            <Table>
                <TableCaption>A list of your current groceries.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="">Name</TableHead>
                        <TableHead className="text-center">Store</TableHead>
                        <TableHead className="text-center">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items}
                    <TableCell className="text-center" colSpan={4}>
                        <Button onClick={() => setDisplayAmmount(i=> i+10)} className="bg-slate-700 h-8">...</Button>
                    </TableCell>
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-center">{total}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}
