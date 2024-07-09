import { sampleData } from "../sampleData";

const data = sampleData;

export default function MainGroceryList() {
    return (
        <div className="flex flex-col">
            {data.map((i) => (
                <div className="mx-2 my-2">{i.name}</div>
            ))}
        </div>
    );
}
