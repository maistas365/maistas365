import { Data } from "./MainGroceryList";
import { Button } from "./ui/button";

type SearchItemProps = {
    item: Data;
    addItem: (item: Data) => void
};

export default function SearchItem({ item, addItem }: SearchItemProps) {
    return (
        <Button onClick={() => addItem(item)} className="m-1 p-2 font-bold text-gray-300 bg-zinc-800 hover:text-white overflow-hidden hover:bg-zinc-600 rounded-lg w-full text-center ">
            {item.name.split(" ").slice(0, 3).join(" ")}
        </Button>
    );
}
