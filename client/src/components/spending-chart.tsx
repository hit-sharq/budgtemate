import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from "@/types";

interface SpendingChartProps {
  data: {
    weekly: ChartData[];
    monthly: ChartData[];
    yearly: ChartData[];
  };
}

type Period = 'weekly' | 'monthly' | 'yearly';

export function SpendingChart({ data }: SpendingChartProps) {
  const [activePeriod, setActivePeriod] = useState<Period>('weekly');
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-neutral-700">Spending Analytics</h3>
          <Button variant="link" className="text-primary p-0 h-auto">View All</Button>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={activePeriod === 'weekly' ? 'default' : 'outline'}
            className={`px-3 py-1 h-auto text-xs rounded-full ${
              activePeriod === 'weekly' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'
            }`}
            onClick={() => setActivePeriod('weekly')}
          >
            Week
          </Button>
          <Button 
            variant={activePeriod === 'monthly' ? 'default' : 'outline'}
            className={`px-3 py-1 h-auto text-xs rounded-full ${
              activePeriod === 'monthly' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'
            }`}
            onClick={() => setActivePeriod('monthly')}
          >
            Month
          </Button>
          <Button 
            variant={activePeriod === 'yearly' ? 'default' : 'outline'}
            className={`px-3 py-1 h-auto text-xs rounded-full ${
              activePeriod === 'yearly' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'
            }`}
            onClick={() => setActivePeriod('yearly')}
          >
            Year
          </Button>
        </div>

        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data[activePeriod]}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9e9e9e' }}
              />
              <YAxis 
                hide={true}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(231, 48%, 48%)" 
                radius={[4, 4, 0, 0]} 
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
