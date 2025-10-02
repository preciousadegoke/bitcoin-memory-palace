 import React from 'react';
import { Users, Brain, TrendingUp, Zap } from 'lucide-react';

const StatsOverview = ({ fragmentCount, insightCount, isAIConnected }) => {
  const stats = [
    {
      icon: Users,
      label: 'Memory Fragments',
      value: fragmentCount,
      color: 'text-bitcoin',
      bgColor: 'bg-bitcoin/20'
    },
    {
      icon: Brain,
      label: 'AI Insights',
      value: insightCount,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: TrendingUp,
      label: 'Collective IQ',
      value: Math.min(100, (fragmentCount * 5) + (insightCount * 10)),
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      suffix: '%'
    },
    {
      icon: Zap,
      label: 'AI Status',
      value: isAIConnected ? 'Active' : 'Offline',
      color: isAIConnected ? 'text-green-400' : 'text-red-400',
      bgColor: isAIConnected ? 'bg-green-500/20' : 'bg-red-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="memory-card text-center">
          <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-3`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}{stat.suffix}
          </div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
