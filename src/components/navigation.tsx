export const Navigation = () => {
  return (
    <div className="flex h-full w-full flex-row items-center justify-center gap-6">
      <a href="/" className="hover:scale-105 hover:cursor-pointer">
        Change Timer
      </a>
      <div className="h-full w-[2px] rounded-full bg-white"></div>
      <a href="/" className="hover:scale-105 hover:cursor-pointer">
        Take a Break
      </a>
    </div>
  );
};

export default Navigation;
