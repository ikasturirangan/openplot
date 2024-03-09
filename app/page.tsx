"use client" 
import React, { useState } from 'react';
import Papa from 'papaparse';
import { ModeToggle } from '@/components/toggle';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { ResponsiveContainer, Legend, Line, LineChart, Tooltip, XAxis, YAxis, Brush } from 'recharts';

const handleResetGraph = () => {
  window.location.reload();
}

export default function Home() {
  const [data, setData] = useState([]);

  const handleFileUpload = (event: { target: { files: any[]; }; }) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
         
          const parsedData = result.data.map((item: string[], _index: number) => ({
            
            name: item[0],
            pv: +item[1], 
          })).filter((_item, index) => index !== 0); 
          setData(parsedData);
        },
        header: false
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
       <header className="mt-5 flex items-center justify-center">
        <h1 className='font-bold tracking-tighter pr-4'>OpenPlot</h1>
        <ModeToggle/>
      </header>
      <main className="flex flex-1 flex-col items-center p-24 space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input id="csvFile" type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
        <div>
          <Card className='w-full'>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className='font-bold text-md'>Graph Plot View</CardTitle>
          </CardHeader>
              <CardContent>
              <ResponsiveContainer width={1200} height={400}>
                <LineChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                 
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#333", borderColor: "#777" }}
                    itemStyle={{ color: "#ddd" }}
                    cursor={{ stroke: '#555', strokeWidth: 2 }}
                  />
                  <Legend wrapperStyle={{ color: "#ccc" }} />
                  <Line
                    type="monotone"
                    dataKey="pv"
                    stroke="teal"
                    activeDot={{ r: 10, stroke: 'teal', strokeWidth: 2, fill: '#8884d8' }}
                  />
                    <Brush dataKey="name" height={30} stroke="teal" />
                </LineChart>
              </ResponsiveContainer>

              </CardContent>
              <CardFooter>
                <Button className='font-bold' onClick={handleResetGraph}><ReloadIcon className='mr-3 w-4 h-4'/> Reset Graph Plot</Button>
              </CardFooter>
            
          </Card>
        </div>
      </main>
      <footer className="w-full p-5 flex items-center justify-center">
        <a href="https://github.com/ikasturirangan" target="_blank" rel="noopener noreferrer" className="mr-4">
          <GitHubLogoIcon className='h-5 w-5'/>
        </a>
        <h1 className='font-bold text-sm text-gray-600'>2024 OpenPlot. All rights reserved.</h1>
      </footer>
    </div>
  );
}
