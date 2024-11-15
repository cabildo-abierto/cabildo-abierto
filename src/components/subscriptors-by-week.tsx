"use client"
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import {CategoryScale} from 'chart.js'; 
ChartJS.register(CategoryScale);

// Register the required components
ChartJS.register(LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);

export const SubscriptorsByDate = ({ data, name }: { name: string; data: { date: Date; count: number }[] }) => {
  // Prepare the data for the chart
  const chartData = {
    labels: data.map(item => item.date.toLocaleDateString()), // Formatting the date for display
    datasets: [
      {
        label: name,
        data: data.map(item => item.count),
        fill: false,
        borderColor: '#455dc0', // Primary color from your palette
        tension: 0.1, // Controls the smoothness of the line
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: name,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: name,
      },
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', height: '500px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};
