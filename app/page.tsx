"use client"
import React, { useState } from 'react';
import Papa from 'papaparse';
import { ModeToggle } from '@/components/toggle';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { ResponsiveContainer, Legend, Line, LineChart, Tooltip, XAxis, YAxis, Brush, ReferenceLine } from 'recharts';
import moment from 'moment';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Define the data item type
interface CGMSDataItem {
  [x: string]: any;
  timestamp: string;
  GlucoseLevel: number;
  day: string;
}

// Missing interface definition added here
interface DailyStats {
  day: string;
  peak: number;
  low: number;
  average: number;
}

const handleResetGraph = () => {
  window.location.reload();
}
export default function Home() {
  // Corrected: Removed duplicate state declarations
  const [chartData, setChartData] = useState<CGMSDataItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files ? files[0] : null;

    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (result) => {
          const dataWithDayChange: CGMSDataItem[] = [];
          const dailyStatsMap: { [day: string]: { peak: number, low: number, sum: number, count: number } } = {};
          let previousDay: string | null = null;

          result.data.forEach((item: any[1]) => {
            if (Array.isArray(item) && typeof item[0] === 'string' && typeof item[1] === 'string') {
              const timestamp = item[0];
              const day = moment(timestamp, "YYYY-MM-DD HH:mm").format('YYYY-MM-DD');
              const GlucoseLevel = Number(item[1]);

              if (!dailyStatsMap[day]) {
                dailyStatsMap[day] = { peak: GlucoseLevel, low: GlucoseLevel, sum: GlucoseLevel, count: 1 };
              } else {
                dailyStatsMap[day].peak = Math.max(dailyStatsMap[day].peak, GlucoseLevel);
                dailyStatsMap[day].low = Math.min(dailyStatsMap[day].low, GlucoseLevel);
                dailyStatsMap[day].sum += GlucoseLevel;
                dailyStatsMap[day].count += 1;
              }

              if (day !== previousDay && dataWithDayChange.length > 0) {
                dataWithDayChange[dataWithDayChange.length - 1].dayChange = true;
              }

              dataWithDayChange.push({ timestamp, GlucoseLevel, day });
              previousDay = day;
            }
          });

          const calculatedDailyStats = Object.keys(dailyStatsMap).map(day => ({
            day,
            peak: dailyStatsMap[day].peak,
            low: dailyStatsMap[day].low,
            average: dailyStatsMap[day].sum / dailyStatsMap[day].count,
          }));

          setChartData(dataWithDayChange);
          setDailyStats(calculatedDailyStats);
        },
      });
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <header className="mt-5 flex items-center justify-center">
        <h1 className='font-bold tracking-tighter pr-4'>OpenPlot</h1>
        <ModeToggle />
      </header>
      <main className="flex flex-1 flex-row items-start p-24 space-x-4">
        <div className="grid max-w-sm items-center gap-1.5"></div>

        <div className="flex-1">
          <Card className="w-full">
          <CardHeader className="flex justify-between items-center w-full">
  <div className="flex-1 justify-center hidden md:flex">
    <CardTitle className="font-bold text-md text-center">Graph Plot View</CardTitle>
  </div>
  <div className="flex-1 md:hidden">
    {/* This div remains empty to maintain the space on the left side for mobile, 
        ensuring the title stays centered when the screen size is small */}
  </div>
  <div className="flex justify-end flex-1">
    <Input id="csvFile" type="file" accept=".csv" onChange={handleFileUpload} className="text-right" />
  </div>
</CardHeader>


            <CardContent>
            <div className="text-center font-medium mb-4">
                {selectedDateRange.start} to {selectedDateRange.end}
              </div>
              <ResponsiveContainer width={1200} height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="timestamp" stroke="teal" />
                  <YAxis dataKey="GlucoseLevel" stroke="#ccc" />
                  <Tooltip 
                    content={({ payload, label }) => {
                      if (payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-white p-5 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground font-bold">
                                  Date and Time
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {label}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground font-bold">
                                  Glucose Level
                                </span>
                                <span className=" uppercase text-muted-foreground font-bold">
                                  {payload[0].value}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      
                      return <div />;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="GlucoseLevel" stroke="teal" dot={true} />

                    {chartData.map((entry, index) => 
                      entry.dayChange ? (
                        <ReferenceLine key={`ref-${index}`} x={entry.timestamp} stroke="gray" strokeDasharray="3 3" />
                      ) : null
                    )}

                    <Brush
                      dataKey="timestamp"
                      height={30}
                      stroke="teal"
                      travellerWidth={10}
                      onChange={(e) => {
                        if (e.startIndex !== undefined && e.endIndex !== undefined) {
                          const startDate = chartData[e.startIndex] ? moment(chartData[e.startIndex].timestamp).format('YYYY-MM-DD') : '';
                          const endDate = chartData[e.endIndex] ? moment(chartData[e.endIndex].timestamp).format('YYYY-MM-DD') : '';
                          setSelectedDateRange({ start: startDate, end: endDate });
                        }
                      }}
                    />
                </LineChart >
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <Button className="font-bold" onClick={handleResetGraph}>
                <ReloadIcon className="mr-3 w-4 h-4" /> Reset Graph Plot
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className='font-bold'>Daily Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[100px]">Peak</TableHead>
                    <TableHead className="w-[100px]">Low</TableHead>
                    <TableHead className="w-[100px]">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyStats.map(({ day, peak, low, average }) => (
                    <TableRow key={day}>
                      <TableCell>{day}</TableCell>
                      <TableCell>{peak}</TableCell>
                      <TableCell>{low}</TableCell>
                      <TableCell>{average.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="w-full p-5 flex items-center justify-center">
        <a href="https://github.com/ikasturirangan" target="_blank" rel="noopener noreferrer" className="mr-4">
          <GitHubLogoIcon className='h-5 w-5' />
        </a>
        <h1 className='font-bold text-sm text-gray-600'>2024 OpenPlot. All rights reserved.</h1>
      </footer>
    </div>
  );
}
