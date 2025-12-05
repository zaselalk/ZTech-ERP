import { useEffect, useState } from "react";

export const DateTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Mobile Menu Button */}

      <div className="hidden md:flex items-center text-xs sm:text-sm">
        Today is: {currentTime.toDateString()} | Time:{" "}
        {currentTime.toLocaleTimeString()}
      </div>
      <div className="md:hidden text-xs">
        {currentTime.toLocaleTimeString()}
      </div>
    </div>
  );
};
