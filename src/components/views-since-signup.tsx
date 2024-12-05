"use client"
import { Bar } from 'react-chartjs-2';

export const ViewsByDaySinceSignup = ({ viewsByDay }) => {
  const chartData = {
    labels: Array.from({ length: 60 }, (_, index) => `Día ${index + 1}`),
    datasets: [
      {
        label: 'Vistas por día',
        data: viewsByDay.slice(0, 60),
        backgroundColor: 'rgba(69, 93, 192, 0.6)', // Customize as needed
        borderColor: '#455dc0',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Días desde el registro',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Vistas',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', height: '400px' }}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};
