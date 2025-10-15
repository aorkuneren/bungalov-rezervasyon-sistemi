import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const CountdownTimer = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              Bu Rezervasyonu Onaylamak İçin Süreniz Var
            </h3>
            <p className="text-sm text-blue-700">
              Lütfen aşağıdaki süre dolmadan rezervasyonunuzu onaylayın
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
            <span className="text-2xl font-bold text-blue-900">
              {formatNumber(timeLeft.hours)}
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-900">:</span>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
            <span className="text-2xl font-bold text-blue-900">
              {formatNumber(timeLeft.minutes)}
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-900">:</span>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
            <span className="text-2xl font-bold text-blue-900">
              {formatNumber(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
