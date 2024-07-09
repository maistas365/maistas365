import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

function App() {
    return (
        <div className="flex flex-col justify-center h-screen items-center">
            <div className="my-4">Pick a grocery</div>
            <div className="flex flex-row ml-2">
                <Input className="w-32 mx-2"/>
                <Button>Add</Button>
            </div>
        </div>
    );
}

export default App;
