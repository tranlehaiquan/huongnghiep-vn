import React, { useState } from 'react';
import schoolsData from '../../data/vietnamSchools.json';
import { Search, MapPin, GraduationCap, ExternalLink, School, ChevronDown } from 'lucide-react';

export default function SchoolSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [blockFilter, setBlockFilter] = useState('ALL');

  const formatVND = (val: number) => {
    if (!val) return 'Đang cập nhật';
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ / năm';
  };

  const filteredSchools = schoolsData.filter(school => {
    if (regionFilter !== 'ALL' && school.region !== regionFilter) return false;
    if (typeFilter !== 'ALL' && school.type !== typeFilter) return false;
    if (blockFilter !== 'ALL') {
      const hasBlock = school.majors.some(m => m.blocks.includes(blockFilter));
      if (!hasBlock) return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchSchool = school.name.toLowerCase().includes(term) || school.shortName.toLowerCase().includes(term);
      const matchCode = school.code && school.code.toLowerCase().includes(term);
      const matchProvince = school.province.toLowerCase().includes(term);
      const matchMajor = school.majors.some(m => m.name.toLowerCase().includes(term));
      if (!matchSchool && !matchCode && !matchProvince && !matchMajor) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="glass-panel p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="school-search-react" className="text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Tìm Trường / Ngành:</span>
            </label>
            <div className="relative">
              <input
                id="school-search-react"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên trường, mã trường, ngành học..."
                className="w-full bg-gray-900 border border-gray-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="region-filter-react" className="text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Khu Vực / Tỉnh:</span>
            </label>
            <div className="relative">
              <select
                id="region-filter-react"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2.5 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all"
              >
                <option value="ALL" className="bg-gray-900 text-gray-100 py-1">Tất Cả Khu Vực</option>
                <option value="North" className="bg-gray-900 text-gray-100 py-1">Miền Bắc (Hà Nội...)</option>
                <option value="Central" className="bg-gray-900 text-gray-100 py-1">Miền Trung (Đà Nẵng...)</option>
                <option value="South" className="bg-gray-900 text-gray-100 py-1">Miền Nam (TP.HCM...)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="type-filter-react" className="text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-purple-400" />
              <span>Loại Hình Trường:</span>
            </label>
            <div className="relative">
              <select
                id="type-filter-react"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2.5 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all"
              >
                <option value="ALL" className="bg-gray-900 text-gray-100 py-1">Tất Cả Loại Hình</option>
                <option value="university" className="bg-gray-900 text-gray-100 py-1">Đại học Công lập & Tư thục</option>
                <option value="college" className="bg-gray-900 text-gray-100 py-1">Cao đẳng Thực hành</option>
                <option value="vocational" className="bg-gray-900 text-gray-100 py-1">Trường Nghề</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="block-filter-react" className="text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Khối Thi THPT:</span>
            </label>
            <div className="relative">
              <select
                id="block-filter-react"
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3.5 py-2.5 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-all"
              >
                <option value="ALL" className="bg-gray-900 text-gray-100 py-1">Tất Cả Khối Thi</option>
                <option value="A00" className="bg-gray-900 text-gray-100 py-1">A00 (Toán-Lý-Hóa)</option>
                <option value="A01" className="bg-gray-900 text-gray-100 py-1">A01 (Toán-Lý-Anh)</option>
                <option value="B00" className="bg-gray-900 text-gray-100 py-1">B00 (Toán-Hóa-Sinh)</option>
                <option value="C00" className="bg-gray-900 text-gray-100 py-1">C00 (Văn-Sử-Địa)</option>
                <option value="D01" className="bg-gray-900 text-gray-100 py-1">D01 (Toán-Văn-Anh)</option>
                <option value="D07" className="bg-gray-900 text-gray-100 py-1">D07 (Toán-Hóa-Anh)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredSchools.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-3">
          <Search className="w-12 h-12 text-gray-600 mx-auto" />
          <h4 className="text-lg font-bold text-white">Không tìm thấy kết quả phù hợp</h4>
          <p className="text-sm text-gray-400">Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc khối thi / khu vực.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <div key={school.id} className="glass-panel p-5 glass-panel-hover flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-black text-xs">
                    {school.code || school.id}
                  </span>
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                      {school.typeLabel}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 leading-snug">{school.name}</h4>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-500" /> {school.province} ({school.regionLabel})
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex justify-between items-center text-xs mb-3">
                  <span className="text-gray-400">Học phí trung bình:</span>
                  <span className="font-bold text-emerald-400">{formatVND(school.avgTuitionPerYearVND)}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-400 block">Các Ngành Học Đào Tạo ({school.majors.length}):</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {school.majors.map((m, idx) => (
                      <div key={idx} className="bg-gray-900/60 p-2 rounded border border-gray-800 text-xs space-y-1">
                        <div className="font-semibold text-gray-200">{m.name}</div>
                        <div className="flex justify-between text-[11px] text-gray-400">
                          <span>⏱️ {m.years} năm</span>
                          <span className="text-blue-400">Khối: {m.blocks.join(', ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800">
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-gray-800/80 hover:bg-blue-600/30 hover:text-blue-300 text-gray-300 text-xs font-semibold rounded-lg transition-all border border-gray-700"
                >
                  <span>Trang Chủ Tuyển Sinh</span>
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
