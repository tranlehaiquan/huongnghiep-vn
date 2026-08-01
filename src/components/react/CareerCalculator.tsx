import React, { useState, useEffect, useRef } from 'react';
import { VIETNAM_CAREER_DATA, EXAM_BLOCKS_INFO, type CareerField } from '../../data/vietnamCareerData';
import { Briefcase, GraduationCap, TrendingUp, Sparkles, BookOpen, Building, Award, CheckCircle2, ChevronDown } from 'lucide-react';
import Chart from 'chart.js/auto';

export default function CareerCalculator() {
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedCareerId, setSelectedCareerId] = useState<string>(VIETNAM_CAREER_DATA[0].id);
  const [yoe, setYoe] = useState<number>(3);
  
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Filtered careers
  const filteredCareers = selectedBlock === 'ALL' 
    ? VIETNAM_CAREER_DATA 
    : VIETNAM_CAREER_DATA.filter(c => c.primaryExamBlocks.includes(selectedBlock));

  const activeCareer: CareerField = VIETNAM_CAREER_DATA.find(c => c.id === selectedCareerId) || filteredCareers[0] || VIETNAM_CAREER_DATA[0];

  // Helper format currency
  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  // Calculate live salary based on YOE
  let currentSalary = activeCareer.salariesVND.entry;
  let tierLabel = 'Mới ra trường (0 - 2 năm)';
  let activeTierKey = 'entry';

  if (yoe <= 2) {
    currentSalary = activeCareer.salariesVND.entry;
    tierLabel = `Mới ra trường (${yoe} năm kinh nghiệm)`;
    activeTierKey = 'entry';
  } else if (yoe <= 5) {
    currentSalary = activeCareer.salariesVND.mid;
    tierLabel = `Kinh nghiệm (${yoe} năm - Mid Level)`;
    activeTierKey = 'mid';
  } else if (yoe <= 10) {
    currentSalary = activeCareer.salariesVND.senior;
    tierLabel = `Chuyên gia (${yoe} năm - Senior)`;
    activeTierKey = 'senior';
  } else {
    currentSalary = activeCareer.salariesVND.lead;
    tierLabel = `Quản lý cao cấp (${yoe}+ năm - Lead)`;
    activeTierKey = 'lead';
  }

  // Update Chart.js curve
  useEffect(() => {
    if (!chartRef.current) return;
    
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0-2 năm', '3-5 năm', '6-10 năm', '10+ năm'],
        datasets: [{
          label: 'Mức lương VNĐ/tháng',
          data: [
            activeCareer.salariesVND.entry,
            activeCareer.salariesVND.mid,
            activeCareer.salariesVND.senior,
            activeCareer.salariesVND.lead
          ],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: '#60a5fa',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Lương: ${formatVND(context.raw as number)} / tháng`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: '#9ca3af',
              callback: (value) => (Number(value) / 1000000) + 'M'
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: { color: '#9ca3af' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [activeCareer]);

  return (
    <div className="space-y-8">
      {/* Filter Panel Card */}
      <div className="glass-panel p-6 shadow-xl space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Chọn Khối Thi THPT Sở Trường:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedBlock('ALL'); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedBlock === 'ALL'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-white'
              }`}
            >
              Tất Cả Khối
            </button>
            {Object.keys(EXAM_BLOCKS_INFO).map((block) => (
              <button
                key={block}
                onClick={() => {
                  setSelectedBlock(block);
                  const firstMatching = VIETNAM_CAREER_DATA.find(c => c.primaryExamBlocks.includes(block));
                  if (firstMatching) setSelectedCareerId(firstMatching.id);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedBlock === block
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-white'
                }`}
              >
                {block}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
          <div>
            <label htmlFor="career-select-react" className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Nghề Nghiệp Mẫu:</span>
            </label>
            <div className="relative">
              <select
                id="career-select-react"
                value={selectedCareerId}
                onChange={(e) => setSelectedCareerId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm appearance-none cursor-pointer transition-all"
              >
                {filteredCareers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-900 text-gray-100 py-1">
                    {c.icon} {c.title} ({c.majorName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="yoe-slider-react" className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Số Năm Kinh Nghiệm:</span>
              </label>
              <span className="text-xs font-bold px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                {yoe} Năm Kinh Nghiệm
              </span>
            </div>
            <input
              id="yoe-slider-react"
              type="range"
              min="0"
              max="15"
              step="1"
              value={yoe}
              onChange={(e) => setYoe(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 cursor-pointer my-2"
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>0y (Mới ra trường)</span>
              <span>5y (Mid)</span>
              <span>10y (Senior)</span>
              <span>15y+ (Lead)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side Card */}
        <div className="glass-panel p-6 glass-panel-hover flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl">{activeCareer.icon}</span>
              <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 mb-1">
                  {activeCareer.category}
                </span>
                <h3 className="text-xl font-bold text-white">{activeCareer.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{activeCareer.description}</p>
              </div>
            </div>

            {/* Salary Calculation Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/30 border border-blue-500/30 rounded-xl p-5 text-center my-4">
              <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
                Mức Lương Dự Kiến Tại Việt Nam
              </span>
              <div className="text-3xl font-black text-blue-400 my-1">
                {formatVND(currentSalary)} <span className="text-sm font-normal text-gray-400">/ tháng</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {tierLabel}
              </span>
            </div>
          </div>

          {/* Salary Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border transition-all ${activeTierKey === 'entry' ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800/40 border-gray-700/50'}`}>
              <span className="text-xs text-gray-400 block">Mới ra trường (0-2y)</span>
              <span className="text-base font-bold text-white">{activeCareer.salariesVND.entry / 1000000}M VNĐ</span>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${activeTierKey === 'mid' ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800/40 border-gray-700/50'}`}>
              <span className="text-xs text-gray-400 block">Kinh nghiệm (3-5y)</span>
              <span className="text-base font-bold text-white">{activeCareer.salariesVND.mid / 1000000}M VNĐ</span>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${activeTierKey === 'senior' ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800/40 border-gray-700/50'}`}>
              <span className="text-xs text-gray-400 block">Chuyên gia (6-10y)</span>
              <span className="text-base font-bold text-white">{activeCareer.salariesVND.senior / 1000000}M VNĐ</span>
            </div>
            <div className={`p-3 rounded-lg border transition-all ${activeTierKey === 'lead' ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-800/40 border-gray-700/50'}`}>
              <span className="text-xs text-gray-400 block">Quản lý (10+y)</span>
              <span className="text-base font-bold text-white">{activeCareer.salariesVND.lead / 1000000}M VNĐ</span>
            </div>
          </div>
        </div>

        {/* Right Side Card: Chart & Requirements */}
        <div className="glass-panel p-6 glass-panel-hover flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Biểu Đồ Lương VNĐ Theo Năm Kinh Nghiệm</span>
            </h4>
            <div className="h-48 w-full">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block mb-1">📚 Khối Thi THPT Xét Tuyển:</span>
              <div className="flex flex-wrap gap-2">
                {activeCareer.primaryExamBlocks.map(b => (
                  <span key={b} className="px-2.5 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-md font-semibold">
                    Khối {b} ({EXAM_BLOCKS_INFO[b]?.subjects.join('-') || b})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-gray-400 font-semibold block mb-1">🎓 Trình Độ & Học Phí:</span>
              <span className="text-gray-200">
                {activeCareer.degreeType} — {activeCareer.durationYears} Năm đào tạo (Học phí ~ {formatVND(activeCareer.avgTuitionPerYearVND)} / năm)
              </span>
            </div>

            <div>
              <span className="text-gray-400 font-semibold block mb-1">🏫 Trường Đào Tạo Hàng Đầu Tại VN:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeCareer.topSchools.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High School Roadmap Card */}
      <div className="glass-panel p-6">
        <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Lộ Trình Ôn Tập Dành Cho Học Sinh Cấp 3 (Lớp 10 — 11 — 12)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
            <span className="inline-block px-2.5 py-1 text-xs font-extrabold bg-blue-600 text-white rounded">
              Lớp 10
            </span>
            <h5 className="font-semibold text-white text-sm">Xây Nền Tảng Môn Trọng Tâm</h5>
            <p className="text-xs text-gray-400">{activeCareer.highSchoolRoadmap.grade10}</p>
          </div>

          <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
            <span className="inline-block px-2.5 py-1 text-xs font-extrabold bg-blue-600 text-white rounded">
              Lớp 11
            </span>
            <h5 className="font-semibold text-white text-sm">Nâng Cao Năng Lực & Kỹ Năng</h5>
            <p className="text-xs text-gray-400">{activeCareer.highSchoolRoadmap.grade11}</p>
          </div>

          <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
            <span className="inline-block px-2.5 py-1 text-xs font-extrabold bg-blue-600 text-white rounded">
              Lớp 12
            </span>
            <h5 className="font-semibold text-white text-sm">Luyện Thi THPT Quốc Gia</h5>
            <p className="text-xs text-gray-400">{activeCareer.highSchoolRoadmap.grade12}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
