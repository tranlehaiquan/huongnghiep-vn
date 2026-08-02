import React, { useState } from 'react';
import { Calculator, DollarSign, Clock, Coins, ShieldCheck, Sparkles, ChevronDown, GraduationCap, TrendingDown } from 'lucide-react';

export default function TuitionROICalculator() {
  const [degreeYears, setDegreeYears] = useState<number>(4);
  const [tuitionPerYear, setTuitionPerYear] = useState<number>(30000000);
  const [livingPerMonth, setLivingPerMonth] = useState<number>(4000000);
  const [startingSalaryPerMonth, setStartingSalaryPerMonth] = useState<number>(12000000);
  const [scholarshipPct, setScholarshipPct] = useState<number>(0);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  const rawTuition = tuitionPerYear * degreeYears;
  const scholarshipSavings = rawTuition * (scholarshipPct / 100);
  const netTuition = rawTuition - scholarshipSavings;

  const totalLiving = livingPerMonth * 12 * degreeYears;
  const totalInvestment = netTuition + totalLiving;

  // Monthly savings dedicated for payback (assuming ~75% of starting salary)
  const monthlyPaybackAmount = startingSalaryPerMonth * 0.75;
  const breakEvenMonths = Math.ceil(totalInvestment / monthlyPaybackAmount);
  const breakEvenYears = (breakEvenMonths / 12).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form Card */}
      <div className="glass-panel p-6 shadow-xl space-y-5">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          <span>Nhập Thông Số Học Phí & Chi Phí</span>
        </h4>

        <div>
          <label htmlFor="degree-type-preset" className="text-xs font-semibold text-gray-300 mb-1.5 block">Loại Hình Học Mẫu:</label>
          <div className="relative">
            <select
              id="degree-type-preset"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'pub-uni') { setDegreeYears(4); setTuitionPerYear(30000000); }
                else if (val === 'med-uni') { setDegreeYears(6); setTuitionPerYear(60000000); }
                else if (val === 'pvt-uni') { setDegreeYears(4); setTuitionPerYear(70000000); }
                else if (val === 'college') { setDegreeYears(2.5); setTuitionPerYear(20000000); }
                else if (val === 'vocational') { setDegreeYears(2); setTuitionPerYear(12000000); }
              }}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2.5 pr-8 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 appearance-none cursor-pointer transition-all"
            >
              <option value="pub-uni" className="bg-gray-900 text-gray-100 py-1">Đại học Công lập (4 Năm — ~30Tr/năm)</option>
              <option value="med-uni" className="bg-gray-900 text-gray-100 py-1">Đại học Y Khoa (6 Năm — ~60Tr/năm)</option>
              <option value="pvt-uni" className="bg-gray-900 text-gray-100 py-1">Đại học Tư thục / Quốc tế (4 Năm — ~70Tr/năm)</option>
              <option value="college" className="bg-gray-900 text-gray-100 py-1">Cao đẳng Thực hành (2.5 Năm — ~20Tr/năm)</option>
              <option value="vocational" className="bg-gray-900 text-gray-100 py-1">Trường Đào tạo Nghề (2 Năm — ~12Tr/năm)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <label htmlFor="tuition-slider-react" className="font-semibold text-gray-300">Học Phí Trung Bình / Năm:</label>
            <span className="font-bold text-amber-400">{formatVND(tuitionPerYear)}</span>
          </div>
          <input
            id="tuition-slider-react"
            type="range"
            min="10000000"
            max="120000000"
            step="2000000"
            value={tuitionPerYear}
            onChange={(e) => setTuitionPerYear(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Scholarship Input Section */}
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="scholarship-slider-react" className="font-semibold text-indigo-200 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Học Bổng / Hỗ Trợ Học Phí Dự Kiến:</span>
            </label>
            <span className="font-extrabold text-indigo-400 text-sm">{scholarshipPct}% Học phí</span>
          </div>

          <div className="flex gap-1.5">
            {[0, 25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setScholarshipPct(pct)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all border ${
                  scholarshipPct === pct
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-gray-900/60 border-gray-700/60 text-gray-300 hover:border-indigo-500/50'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <input
            id="scholarship-slider-react"
            type="range"
            min="0"
            max="100"
            step="5"
            value={scholarshipPct}
            onChange={(e) => setScholarshipPct(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
          />

          {scholarshipSavings > 0 && (
            <div className="text-xs text-indigo-300 font-medium flex items-center justify-between pt-1">
              <span>Tiết kiệm nhờ Học bổng:</span>
              <span className="font-bold text-emerald-400">-{formatVND(scholarshipSavings)}</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <label htmlFor="years-slider-react" className="font-semibold text-gray-300">Thời Gian Đào Tạo (Số Năm):</label>
            <span className="font-bold text-amber-400">{degreeYears} Năm</span>
          </div>
          <input
            id="years-slider-react"
            type="range"
            min="1"
            max="6"
            step="0.5"
            value={degreeYears}
            onChange={(e) => setDegreeYears(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <label htmlFor="living-slider-react" className="font-semibold text-gray-300">Chi Phí Trọ & Ăn Ở (Mỗi Tháng):</label>
            <span className="font-bold text-amber-400">{formatVND(livingPerMonth)} / tháng</span>
          </div>
          <input
            id="living-slider-react"
            type="range"
            min="0"
            max="10000000"
            step="500000"
            value={livingPerMonth}
            onChange={(e) => setLivingPerMonth(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <label htmlFor="starting-salary-slider-react" className="font-semibold text-gray-300">Mức Lương Ra Trường Dự Kiến:</label>
            <span className="font-bold text-emerald-400">{formatVND(startingSalaryPerMonth)} / tháng</span>
          </div>
          <input
            id="starting-salary-slider-react"
            type="range"
            min="6000000"
            max="40000000"
            step="1000000"
            value={startingSalaryPerMonth}
            onChange={(e) => setStartingSalaryPerMonth(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Output Results Card */}
      <div className="glass-panel p-6 shadow-xl flex flex-col justify-between space-y-6">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-emerald-400" />
            <span>Phân Tích ROI Đầu Tư Học Tập</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
              <span className="text-xs text-gray-400 block">
                {scholarshipPct > 0 ? 'Học Phí Thực Trả (Đã trừ HB)' : 'Tổng Học Phí Toàn Khóa'}
              </span>
              <span className="text-base font-bold text-white">{formatVND(netTuition)}</span>
              {scholarshipPct > 0 && (
                <span className="text-[11px] text-indigo-400 block mt-0.5 line-through">
                  {formatVND(rawTuition)}
                </span>
              )}
            </div>

            <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
              <span className="text-xs text-gray-400 block">Tổng Sinh Hoạt Phí</span>
              <span className="text-base font-bold text-white">{formatVND(totalLiving)}</span>
            </div>
          </div>

          {scholarshipSavings > 0 && (
            <div className="bg-indigo-900/30 border border-indigo-500/40 p-3 rounded-xl mb-4 flex items-center justify-between text-xs">
              <span className="text-indigo-200 font-medium flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                Tiết kiệm từ Học bổng ({scholarshipPct}%):
              </span>
              <span className="font-extrabold text-emerald-400 text-sm">
                -{formatVND(scholarshipSavings)}
              </span>
            </div>
          )}

          <div className="bg-gradient-to-r from-amber-950/40 to-yellow-900/30 border border-amber-500/30 p-4 rounded-xl mb-4">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block">
              TỔNG VỐN ĐẦU TƯ THỰC TẾ
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {formatVND(totalInvestment)}
            </div>
          </div>
        </div>

        {/* Break Even Highlight Banner */}
        <div className="bg-gradient-to-r from-emerald-950/50 to-teal-900/40 border border-emerald-500/30 p-5 rounded-xl flex items-start gap-4">
          <Clock className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
          <div>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Thời Gian Hoàn Vốn Đầu Tư (Break-Even)
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 my-0.5">
              {breakEvenYears} Năm làm việc ({breakEvenMonths} tháng)
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Với mức lương ra trường {formatVND(startingSalaryPerMonth)}/tháng, bạn sẽ hoàn toàn thu hồi lại tổng số vốn đầu tư thực tế {formatVND(totalInvestment)} sau khoảng {breakEvenMonths} tháng làm việc{scholarshipPct > 0 ? ` (đã giảm thời gian nhờ học bổng ${scholarshipPct}%)` : ''}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

