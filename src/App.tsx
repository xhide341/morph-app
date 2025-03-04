import Header from "./components/header";
import { Clock } from "./components/clock";

export const App = () => {
  return (
    <div className="font-roboto mx-auto flex h-dvh w-full max-w-dvw flex-col bg-gray-600 p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Header />
        <Clock />
        {/* Progress Bar */}
      </div>
    </div>
  );
};

export default App;
