import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardChart = ({ data }) => {
  // Default data structure
  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Hospital Registrations',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'User Registrations',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      }
    ],
  };
  // Ensure data has the correct structure
  const chartData = {
    labels: data?.labels || defaultData.labels,
    datasets: data?.datasets || defaultData.datasets
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'System Analytics',
      },
    },
  };

  return (
    <Box sx={{ height: 300, p: 2 }}>
      <Line options={options} data={chartData} />
    </Box>
  );
};

export default DashboardChart;