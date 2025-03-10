import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Filler } from 'chart.js';

Chart.register(Filler);

const MonthlySalesChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
        datasets: [
          {
            label: 'Monthly Sales',
            data: [
              500000, 600000, 550000, 700000, 800000, 650000,
              700000, 900000, 1000000, 1200000, 1100000, 1500000
            ],
            fill: true, 
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.4,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointRadius: 5,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-[450px] md:h-[500px] lg:h-[600px] bg-white p-4 rounded-lg shadow-md">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MonthlySalesChart;
