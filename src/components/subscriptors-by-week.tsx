"use client"
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';


export const SubscriptorsByWeek = ({data}: {data: {date: Date, count: number}[]}) => {

    const chartData = {
        labels: data.map(entry => 
          new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        ),
        datasets: [
          {
            label: 'Suscriptores por semana',
            data: data.map(entry => entry.count),
            borderColor: '#455dc0', // Customize color as desired
            backgroundColor: 'rgba(69, 93, 192, 0.2)', // Optional for a filled line chart
            fill: true, // Set true for a filled area under the line
            tension: 0.3, // Optional for a smooth line
          },
        ],
      };
    
      return (
        <div style={{ width: '100%', maxWidth: '800px', height: '500px' }}>
          <Line data={chartData} />
        </div>
    );
}