import { FaRotate } from "react-icons/fa6";
import { Data } from "./MainGroceryList";
import { Button } from "./ui/button";
import { TableCell, TableRow } from "./ui/table";
import { FaTrash } from "react-icons/fa";


type GrocerItemProps = {
    item: Data;
    quantity: number
};

export default function GroceryItem({item, quantity}: GrocerItemProps) {
    return (
        <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="text-center">{item.shop}</TableCell>
            <TableCell className="text-center">{item.price}</TableCell>
            <TableCell className="text-center">{quantity}</TableCell>
            <TableCell className="text-center">
                <Button className="bg-blue-500 h-8 mx-1">
                    <FaRotate />
                </Button>
                <Button className="bg-red-500 h-8 mx-1">
                    <FaTrash />
                </Button>
            </TableCell>
        </TableRow>
    );
}