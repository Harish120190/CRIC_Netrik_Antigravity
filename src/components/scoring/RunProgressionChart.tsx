import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface OverData {
  over: number;
  runs: number;
  totalRuns: number;
  wickets: number;
}

interface RunProgressionChartProps {
  overData: OverData[];
}

const RunProgressionChart: React.FC<RunProgressionChartProps> = ({ overData }) => {
  if (overData.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Run Progression</h3>
      </div>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={overData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="runsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
            <XAxis 
              dataKey="over" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `Over ${label}`}
              formatter={(value: number, name: string) => {
                if (name === 'totalRuns') return [value, 'Total'];
                if (name === 'runs') return [value, 'This Over'];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="totalRuns"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#runsGradient)"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Per-over breakdown */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {overData.map((data) => (
            <div
              key={data.over}
              className={`flex-shrink-0 min-w-[36px] rounded-lg px-2 py-1.5 text-center ${
                data.wickets > 0 
                  ? 'bg-destructive/10 border border-destructive/20' 
                  : data.runs >= 10 
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/50 border border-border'
              }`}
            >
              <p className="text-[10px] text-muted-foreground">Ov {data.over}</p>
              <p className={`text-xs font-bold ${
                data.runs >= 10 ? 'text-primary' : 'text-foreground'
              }`}>
                {data.runs}
              </p>
              {data.wickets > 0 && (
                <p className="text-[10px] text-destructive">-{data.wickets}W</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RunProgressionChart;
