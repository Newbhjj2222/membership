"use client";

import React, { useEffect, useState } from "react";

type CountdownProps = {
  targetDate: Date;
};

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(
    targetDate.getTime() - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetDate.getTime() - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft <= 0) return <p className="text-red-500 font-medium">Membership expired</p>;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <p className="text-blue-600 font-medium">
      Membership expires in: {days}d {hours}h {minutes}m {seconds}s
    </p>
  );
}
