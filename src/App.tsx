import Header from "./components/header";

export const App = () => {
  return (
    <div className="p-4 flex flex-col h-dvh mx-auto w-full max-w-dvw bg-gray-600">
      <div className="flex flex-col w-full max-w-3xl mx-auto">
        <Header />
        {/* Clock UI */}
        {/* Progress Bar */}
      </div>
    </div>
  );
};

export default App;
