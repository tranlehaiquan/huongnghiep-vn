import React, { useEffect, useRef } from 'react';
import type { SalaryByYOE } from '../../data/vietnamCareerData';

interface Props {
  salaries: SalaryByYOE;
  title: string;
  color?: string;
}

export default function SalaryChartIsland({ salaries, title, color = '#4f6ef7' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chartInstance: any = null;
    let isMounted = true;

    async function initChart() {
      if (!canvasRef.current || !salaries) return;

      try {
        const { default: Chart } = await import('chart.js/auto');
        if (!isMounted || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(79, 110, 247, 0.35)');
        gradient.addColorStop(1, 'rgba(79, 110, 247, 0.02)');

        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['0–2 năm (Entry)', '3–5 năm (Mid)', '6–10 năm (Senior)', '10+ năm (Lead)'],
            datasets: [{
              label: 'Lương (VNĐ / tháng)',
              data: [salaries.entry || 0, salaries.mid || 0, salaries.senior || 0, salaries.lead || 0],
              borderColor: color,
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: color,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                titleColor: '#94a3b8',
                bodyColor: '#10d9a8',
                bodyFont: { weight: 'bold', size: 13 },
                callbacks: {
                  label: (ctx: any) => ` ${(ctx.raw / 1000000).toFixed(1)} triệu VNĐ / tháng`,
                },
              },
            },
            scales: {
              y: {
                ticks: {
                  color: '#64748b',
                  callback: (v: any) => `${(Number(v) / 1000000).toFixed(0)}M`,
                  font: { size: 11 },
                },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
              },
              x: {
                ticks: { color: '#94a3b8', font: { size: 11 } },
                grid: { display: false },
              },
            },
          },
        });
      } catch (err) {
        console.error('Failed to render salary chart:', err);
      }
    }

    initChart();

    return () => {
      isMounted = false;
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [salaries, color]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '260px' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
    </div>
  );
}
