import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VIETNAM_CAREER_DATA, EXAM_BLOCKS_INFO, type CareerField } from '../../data/vietnamCareerData';
import Chart from 'chart.js/auto';

const CAREER_COLORS = ['#4f6ef7', '#10d9a8', '#f5a623', '#f43f5e', '#8b5cf6'];

const RADAR_LABELS = ['Lương TB', 'Nhu Cầu', 'Dễ Học', 'Chi Phí Thấp', 'Cơ Hội Quốc Tế'];

// Score each career on radar axes (0-100)
function getRadarScores(career: CareerField) {
  const maxSalary = 120000000;
  const salaryScore = Math.min(100, (career.salariesVND.senior / maxSalary) * 100);
  const demandMap: Record<string, number> = {
    'Công nghệ Thông tin': 95, 'Y Dược & Sức Khỏe': 85, 'Kinh Tế & Quản Lý': 75,
    'Truyền Thông & Marketing': 70, 'Nghệ Thuật & Thiết Kế': 65, 'Cơ Khí & Kỹ Thuật': 72,
  };
  const demand = demandMap[career.category] || 70;
  const maxTuition = 400000000;
  const easyScore = Math.max(10, 100 - (career.durationYears / 6) * 60);
  const costScore = Math.max(10, 100 - (career.avgTuitionPerYearVND * career.durationYears / maxTuition) * 100);
  const intlMap: Record<string, number> = {
    'Công nghệ Thông tin': 90, 'Y Dược & Sức Khỏe': 60, 'Kinh Tế & Quản Lý': 75,
    'Truyền Thông & Marketing': 65, 'Nghệ Thuật & Thiết Kế': 70, 'Cơ Khí & Kỹ Thuật': 65,
  };
  const intl = intlMap[career.category] || 60;
  return [salaryScore, demand, easyScore, costScore, intl];
}

export default function FieldComparator({ preselectedId = '' }: { preselectedId?: string }) {
  const [selected, setSelected] = useState<string[]>(preselectedId ? [preselectedId] : []);
  const [yoe, setYoe] = useState(3);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const radarRef = useRef<HTMLCanvasElement>(null);
  const radarChartRef = useRef<Chart | null>(null);

  const selectedCareers = selected.map(id => VIETNAM_CAREER_DATA.find(c => c.id === id)!).filter(Boolean);

  const formatM = (n: number) => `${(n / 1000000).toFixed(0)}M`;

  const getSalaryAtYoe = (c: CareerField) => {
    if (yoe <= 2) return c.salariesVND.entry;
    if (yoe <= 5) return c.salariesVND.mid;
    if (yoe <= 10) return c.salariesVND.senior;
    return c.salariesVND.lead;
  };

  // Rebuild radar chart when selection changes
  useEffect(() => {
    if (!radarRef.current || selectedCareers.length === 0) return;
    if (radarChartRef.current) radarChartRef.current.destroy();

    const ctx = radarRef.current.getContext('2d');
    if (!ctx) return;

    radarChartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: RADAR_LABELS,
        datasets: selectedCareers.map((career, idx) => ({
          label: career.title,
          data: getRadarScores(career),
          borderColor: CAREER_COLORS[idx],
          backgroundColor: `${CAREER_COLORS[idx]}22`,
          pointBackgroundColor: CAREER_COLORS[idx],
          pointBorderColor: '#fff',
          pointRadius: 4,
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25, display: false },
            grid: { color: 'rgba(255,255,255,0.06)' },
            angleLines: { color: 'rgba(255,255,255,0.06)' },
            pointLabels: {
              color: '#64748b',
              font: { size: 11, family: "'Be Vietnam Pro', sans-serif" },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(8,13,28,0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#94a3b8',
            bodyColor: '#e2e8f0',
          },
        },
      },
    });

    return () => { radarChartRef.current?.destroy(); };
  }, [selected]);

  const toggleCareer = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const filteredPicker = VIETNAM_CAREER_DATA.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.majorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">
            {selected.length === 0
              ? 'Chọn ít nhất 2 ngành để bắt đầu so sánh'
              : `${selected.length}/3 ngành đã chọn`}
          </div>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="btn-ghost text-xs"
            >
              ✕ Xóa tất cả
            </button>
          )}
          <button
            onClick={() => setShowPicker(true)}
            disabled={selected.length >= 3}
            className="btn-primary text-sm"
          >
            + Thêm ngành
          </button>
        </div>
      </div>

      {/* Empty state */}
      {selected.length === 0 && (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🔀</div>
          <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Bắt đầu So Sánh Ngành Học
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            Chọn từ 2 đến 3 ngành học để xem biểu đồ radar, bảng so sánh lương và tổng chi phí đào tạo.
          </p>
          <button onClick={() => setShowPicker(true)} className="btn-primary">
            + Chọn ngành đầu tiên
          </button>
        </div>
      )}

      {/* Single career selected hint */}
      {selected.length === 1 && (
        <div className="flex items-center gap-3 p-4 card" style={{ borderColor: 'rgba(245,166,35,0.3)' }}>
          <span className="text-xl">💡</span>
          <span className="text-sm text-slate-400">
            Hãy thêm ít nhất 1 ngành nữa để xem biểu đồ so sánh.
          </span>
          <button onClick={() => setShowPicker(true)} className="btn-primary text-xs ml-auto shrink-0">
            + Thêm ngành
          </button>
        </div>
      )}

      {/* Selected career pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCareers.map((career, idx) => (
            <div
              key={career.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border"
              style={{ borderColor: `${CAREER_COLORS[idx]}60`, background: `${CAREER_COLORS[idx]}18`, color: CAREER_COLORS[idx] }}
            >
              <span>{career.icon}</span>
              <span>{career.title}</span>
              <button
                onClick={() => setSelected(s => s.filter(x => x !== career.id))}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main comparison view */}
      {selectedCareers.length >= 2 && (
        <>
          {/* YOE slider */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">📊 Năm kinh nghiệm để so sánh</span>
              <span className="badge badge-primary">{yoe} năm</span>
            </div>
            <input
              type="range" min="0" max="15" step="1" value={yoe}
              onChange={e => setYoe(+e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0y</span><span>Entry (2y)</span><span>Mid (5y)</span><span>Senior (10y)</span><span>Lead (15y)</span>
            </div>
          </div>

          {/* Salary Comparison bars */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-white mb-4">💰 Mức Lương Tại {yoe} Năm Kinh Nghiệm</h3>
            <div className="space-y-4">
              {selectedCareers.map((career, idx) => {
                const salary = getSalaryAtYoe(career);
                const maxAll = Math.max(...selectedCareers.map(getSalaryAtYoe));
                const pct = Math.round((salary / maxAll) * 100);
                return (
                  <div key={career.id}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span>{career.icon}</span>
                        <span className="font-semibold" style={{ color: CAREER_COLORS[idx] }}>{career.title}</span>
                      </div>
                      <span className="font-black" style={{ color: CAREER_COLORS[idx] }}>{formatM(salary)} VNĐ/tháng</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, background: CAREER_COLORS[idx], boxShadow: `0 0 8px ${CAREER_COLORS[idx]}60` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Radar + Table side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Radar Chart */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-white mb-4">🕸️ Biểu Đồ Radar Đa Chiều</h3>
              <div style={{ height: '280px', position: 'relative' }}>
                <canvas ref={radarRef}></canvas>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {selectedCareers.map((c, idx) => (
                  <div key={c.id} className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ background: CAREER_COLORS[idx] }}></div>
                    <span className="text-slate-400">{c.icon} {c.title.split('/')[0].trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-white mb-4">📋 Bảng So Sánh Chi Tiết</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left text-slate-500 pb-3 pr-4 font-semibold">Tiêu chí</th>
                      {selectedCareers.map((c, idx) => (
                        <th key={c.id} className="text-right pb-3 px-2 font-bold" style={{ color: CAREER_COLORS[idx] }}>
                          {c.icon}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {[
                      { label: 'Entry (0–2y)', vals: (c: CareerField) => formatM(c.salariesVND.entry) },
                      { label: 'Mid (3–5y)', vals: (c: CareerField) => formatM(c.salariesVND.mid) },
                      { label: 'Senior (6–10y)', vals: (c: CareerField) => formatM(c.salariesVND.senior) },
                      { label: 'Lead (10+y)', vals: (c: CareerField) => formatM(c.salariesVND.lead) },
                      { label: '―', vals: null },
                      { label: 'Thời gian học', vals: (c: CareerField) => `${c.durationYears} năm` },
                      { label: 'Học phí/năm', vals: (c: CareerField) => formatM(c.avgTuitionPerYearVND) },
                      { label: 'Tổng học phí', vals: (c: CareerField) => formatM(c.avgTuitionPerYearVND * c.durationYears) },
                      {
                        label: 'Hoàn vốn (ước)',
                        vals: (c: CareerField) => {
                          const total = c.avgTuitionPerYearVND * c.durationYears;
                          const diff = c.salariesVND.mid - c.salariesVND.entry;
                          if (diff <= 0) return '—';
                          return `${(total / diff / 12).toFixed(1)} năm`;
                        }
                      },
                    ].map((row, i) => (
                      row.vals === null
                        ? <tr key={i}><td colSpan={4} className="py-2"><div className="divider"></div></td></tr>
                        : (
                          <tr key={i} className="hover:bg-white/2">
                            <td className="text-slate-500 py-2 pr-4">{row.label}</td>
                            {selectedCareers.map((c, idx) => (
                              <td key={c.id} className="text-right py-2 px-2 font-semibold text-white">{row.vals!(c)}</td>
                            ))}
                          </tr>
                        )
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="card p-6" style={{ borderColor: 'rgba(16,217,168,0.2)' }}>
            <h3 className="text-sm font-bold text-white mb-4">💡 Nhận Xét & Gợi Ý</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(() => {
                const highestSalary = [...selectedCareers].sort((a, b) => b.salariesVND.lead - a.salariesVND.lead)[0];
                const lowestCost = [...selectedCareers].sort((a, b) =>
                  (a.avgTuitionPerYearVND * a.durationYears) - (b.avgTuitionPerYearVND * b.durationYears)
                )[0];
                const fastROI = [...selectedCareers].sort((a, b) => {
                  const ra = (a.avgTuitionPerYearVND * a.durationYears) / Math.max(1, a.salariesVND.mid - a.salariesVND.entry);
                  const rb = (b.avgTuitionPerYearVND * b.durationYears) / Math.max(1, b.salariesVND.mid - b.salariesVND.entry);
                  return ra - rb;
                })[0];
                return [
                  { icon: '💰', label: 'Lương cao nhất', career: highestSalary, note: `${formatM(highestSalary.salariesVND.lead)} VNĐ/tháng khi lead` },
                  { icon: '📉', label: 'Chi phí thấp nhất', career: lowestCost, note: `Tổng ${formatM(lowestCost.avgTuitionPerYearVND * lowestCost.durationYears)} VNĐ` },
                  { icon: '⚡', label: 'Hoàn vốn nhanh', career: fastROI, note: 'Thu hồi chi phí đào tạo sớm nhất' },
                ].map(({ icon, label, career, note }) => (
                  <div key={career.id} className="card-deep p-4">
                    <div className="text-xl mb-2">{icon}</div>
                    <div className="text-xs text-slate-500 mb-1">{label}</div>
                    <div className="text-sm font-bold text-white">{career.icon} {career.title.split('/')[0].trim()}</div>
                    <div className="text-xs text-slate-400 mt-1">{note}</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </>
      )}

      {/* Picker Modal */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowPicker(false); }}
        >
          <div className="card w-full max-w-lg max-h-[85vh] flex flex-col"
               style={{ background: 'rgba(8,13,28,0.97)', borderColor: 'rgba(79,110,247,0.25)' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Chọn Ngành Để So Sánh
                </h3>
                <p className="text-xs text-slate-500">{selected.length}/3 đã chọn</p>
              </div>
              <button onClick={() => setShowPicker(false)} className="btn-ghost text-lg p-1">✕</button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/5">
              <input
                type="text"
                placeholder="Tìm theo tên ngành, khối thi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field"
                autoFocus
              />
            </div>

            {/* Career list */}
            <div className="overflow-y-auto flex-1 p-3">
              {filteredPicker.map(career => {
                const isSelected = selected.includes(career.id);
                const idx = selected.indexOf(career.id);
                const disabled = !isSelected && selected.length >= 3;
                return (
                  <button
                    key={career.id}
                    onClick={() => !disabled && toggleCareer(career.id)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1.5 text-left transition-all ${
                      isSelected
                        ? 'border'
                        : disabled
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-white/5 border border-transparent'
                    }`}
                    style={isSelected ? {
                      background: `${CAREER_COLORS[idx]}15`,
                      borderColor: `${CAREER_COLORS[idx]}50`,
                    } : {}}
                  >
                    <span className="text-2xl shrink-0">{career.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{career.title}</div>
                      <div className="text-xs text-slate-500">{career.category} · {career.primaryExamBlocks.join(', ')}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                           style={{ background: CAREER_COLORS[idx] }}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-white/8">
              <button
                onClick={() => setShowPicker(false)}
                className="btn-primary w-full justify-center"
                disabled={selected.length < 2}
              >
                {selected.length < 2 ? `Chọn thêm ${2 - selected.length} ngành` : `So sánh ${selected.length} ngành →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
