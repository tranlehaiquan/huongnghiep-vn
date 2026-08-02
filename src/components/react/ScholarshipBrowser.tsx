import React, { useState, useMemo } from 'react';
import {
  Search,
  GraduationCap,
  Award,
  DollarSign,
  ExternalLink,
  Sparkles,
  Filter,
  CheckCircle2,
  Building2,
  Tag,
  Coins,
  ChevronRight,
} from 'lucide-react';
import scholarshipData from '../../data/vietnamScholarships.json';

interface ScholarshipItem {
  id: string;
  title: string;
  schoolCode: string;
  schoolName: string;
  category: string;
  valuePct: number;
  valueRangeText?: string;
  monthlyAllowanceVND: number;
  allowanceRangeText?: string;
  oneTimeGrantVND?: number;
  eligibility: string;
  description: string;
  sourceUrl: string;
  tags: string[];
}

export default function ScholarshipBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const items = (scholarshipData as any).items as ScholarshipItem[];
  const categories = ['ALL', ...((scholarshipData as any).categories || [])];

  // Extract unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => {
      (item.tags || []).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchesTag = !selectedTag || (item.tags && item.tags.includes(selectedTag));

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.schoolName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.eligibility.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesTag && matchesQuery;
    });
  }, [items, selectedCategory, selectedTag, searchQuery]);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="glass-panel p-5 space-y-4 border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm học bổng theo trường, ngành, điểm THPT, IELTS, Bán dẫn..."
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 transition-all focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs font-semibold text-indigo-200 shrink-0">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Hiển thị <strong>{filteredItems.length}</strong> / {items.length} chương trình</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-indigo-500/40 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? '🌟 Tất Cả Quỹ Học Bổng' : cat}
            </button>
          ))}
        </div>

        {/* Tags Bar */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
              <Tag className="w-3 h-3 text-indigo-400" /> Từ khóa hot:
            </span>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[10px] text-indigo-400 hover:underline font-medium ml-1"
              >
                Xóa lọc từ khóa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scholarship Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel p-10 text-center space-y-3">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-base font-bold text-white">Không tìm thấy học bổng phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc bấm chọn "Tất Cả Quỹ Học Bổng" để xem đầy đủ danh sách.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedTag(null);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 border border-slate-800 transition-all group hover:shadow-2xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,27,75,0.4) 100%)',
              }}
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="badge badge-primary text-[11px] font-bold">
                    {item.category}
                  </span>
                  <div className="text-right">
                    {item.valuePct > 0 && (
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg inline-block">
                        Giảm {item.valuePct}% Học Phí
                      </span>
                    )}
                    {item.valueRangeText && (
                      <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-lg inline-block">
                        {item.valueRangeText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{item.schoolName}</span>
                  </div>
                </div>

                {/* Allowance Badge Banner if applicable */}
                {(item.monthlyAllowanceVND > 0 || item.allowanceRangeText || item.oneTimeGrantVND) && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                      Trợ cấp tiền mặt:
                    </span>
                    <span className="font-extrabold text-emerald-400 text-xs">
                      {item.allowanceRangeText ||
                        (item.monthlyAllowanceVND > 0 && `${formatVND(item.monthlyAllowanceVND)} / tháng`) ||
                        (item.oneTimeGrantVND && `${formatVND(item.oneTimeGrantVND)} / suất`)}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Eligibility criteria box */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Điều kiện xét chọn:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {item.eligibility}
                  </p>
                </div>
              </div>

              {/* Footer Tags & Official Source Link */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {(item.tags || []).slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 shrink-0"
                >
                  <span>Nguồn chính thức</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
