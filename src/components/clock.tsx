export const Clock = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <nav className="flex flex-row gap-4">
        <ul className="flex flex-row gap-4">
          <li>
            <a href="/">Pomodoro</a>
          </li>
          <li>
            <a href="/">Short Break</a>
          </li>
          <li>
            <a href="/">Long Break</a>
          </li>
        </ul>
      </nav>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-[8rem] font-bold">00:00</h1>
        <div className="flex flex-row gap-2">
          <button className="rounded-md bg-blue-500 p-2 text-white">
            Start
          </button>
          <button className="rounded-md bg-red-500 p-2 text-white">Stop</button>
          <button className="rounded-md bg-green-500 p-2 text-white">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default Clock;
