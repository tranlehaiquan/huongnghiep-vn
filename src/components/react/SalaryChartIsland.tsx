import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { SalaryByYOE } from '../../data/vietnamCareerData';

interface Props {
  salaries: SalaryByYOE;
  title: string;
  color?: string;
}

export default function SalaryChartIsland({ salaries, title, color = '#4f6ef7' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}05`);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0–2 năm', '3–5 năm', '6–10 năm', '10+ năm'],
        datasets: [{
          label: 'VNĐ/tháng',
          data: [salaries.entry, salaries.mid, salaries.senior, salaries.lead],
          borderColor: color,
          backgroundColor: gradient,
          fill: true,
          tension: 0.45,
          pointRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(8,13,28,0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#94a3b8',
            bodyColor: '#e2e8f0',
            callbacks: {
              label: (ctx) => ` ${(ctx.raw as number / 1000000).toFixed(1)}M VNĐ / tháng`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              color: '#64748b',
              callback: (v) => (Number(v) / 1000000) + 'M',
              font: { size: 11 },
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          x: {
            ticks: { color: '#64748b', font: { size: 11 } },
            grid: { display: false },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [salaries, color]);

  return (
    <div style={{ height: '220px', position: 'relative' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
