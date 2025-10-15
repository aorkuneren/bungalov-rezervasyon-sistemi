import React from 'react';
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  subtitle,
  color = 'gray',
  className = '' 
}) => {
  const colorClasses = {
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      value: 'text-gray-900',
      title: 'text-gray-700',
      subtitle: 'text-gray-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      value: 'text-green-900',
      title: 'text-green-700',
      subtitle: 'text-green-500'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      value: 'text-blue-900',
      title: 'text-blue-700',
      subtitle: 'text-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      value: 'text-yellow-900',
      title: 'text-yellow-700',
      subtitle: 'text-yellow-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      value: 'text-red-900',
      title: 'text-red-700',
      subtitle: 'text-red-500'
    }
  };

  const classes = colorClasses[color] || colorClasses.gray;

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${classes.title}`}>
            {title}
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className={`text-2xl font-bold ${classes.value}`}>
              {value}
            </p>
            {trend && trendValue && (
              <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className={`text-sm ${classes.subtitle} mt-1`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${classes.bg}`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
