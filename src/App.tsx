import Header from "./components/header";
import { Clock } from "./components/clock";

export const App = () => {
  return (
    <div className="font-roboto bg-background text-foreground mx-auto flex h-dvh w-full max-w-dvw flex-col p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Header />
        <Clock />
        {/* Progress Bar */}
      </div>
    </div>
  );
};

export default App;
