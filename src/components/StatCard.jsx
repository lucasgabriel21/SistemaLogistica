import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <Card className="overflow-hidden shadow-xl rounded-2xl hover:shadow-2xl transition-all hover:-translate-y-1 w-full">
    <CardContent className="p-0">
      <div className={`bg-gradient-to-br ${gradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-white text-3xl font-black">
              {value}
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
); // O erro estava aqui, faltava o parêntese de fechamento

export default StatCard;
