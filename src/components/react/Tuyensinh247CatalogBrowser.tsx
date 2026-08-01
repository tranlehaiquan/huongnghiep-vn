import React, { useState } from 'react';
import tuyensinh247Data from '../../data/tuyensinh247Catalog.json';

export default function Tuyensinh247CatalogBrowser() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [expandedMajorId, setExpandedMajorId] = useState<number | null>(null);

  const groups = tuyensinh247Data.groups;

  const filteredGroups = groups.map(group => {
    if (selectedGroupId !== 'ALL' && group.id !== selectedGroupId) {
      return null;
    }
    const filteredMajors = group.majors.filter(m =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(search.toLowerCase())) ||
      m.description.toLowerCase().includes(search.toLowerCase())
    );
    if (search && filteredMajors.length === 0) return null;
    return { ...group, majors: filteredMajors };
  }).filter(Boolean) as typeof groups;

  const totalResults = filteredGroups.reduce((acc, g) => acc + g.majors.length, 0);

  return (
    <div className="space-y-6">

      {/* Header & Search */}
      <div className="card p-6" style={{ borderColor: 'rgba(79,110,247,0.25)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
              <span>🌐 Crawled Data</span>
              <span>•</span>
              <span>TuyểnSinh247.com 2026</span>
            </div>
            <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Danh Mục 506 Ngành Đào Tạo Đại Học 2026
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dữ liệu trực tiếp từ Tuyensinh247 — Phân loại 37 nhóm ngành chính thức của Bộ GD&ĐT
            </p>
          </div>

          <div className="badge badge-teal text-sm py-1.5 px-3">
            {totalResults} ngành tìm thấy
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Tìm 506 ngành đào tạo theo tên ngành, mã ngành..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12 py-3 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Group Selector Pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedGroupId('ALL')}
          className={`chip ${selectedGroupId === 'ALL' ? 'active' : ''}`}
        >
          Tất cả (37 nhóm)
        </button>
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={`chip ${selectedGroupId === g.id ? 'active' : ''}`}
          >
            {g.title} ({g.majorsCount})
          </button>
        ))}
      </div>

      {/* Group & Major Cards */}
      {filteredGroups.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <div>Không tìm thấy ngành nào phù hợp từ TuyểnSinh247.</div>
          <button onClick={() => { setSearch(''); setSelectedGroupId('ALL'); }} className="btn-secondary mt-4">
            Xóa tìm kiếm
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(group => (
            <div key={group.id} className="card p-6">
              <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h4 className="text-base font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {group.title}
                    </h4>
                    <span className="text-xs text-slate-500">{group.majors.length} ngành đào tạo</span>
                  </div>
                </div>
                <span className="badge badge-primary text-xs">Nhóm #{group.id}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.majors.map(major => {
                  const isExpanded = expandedMajorId === major.id;
                  return (
                    <div
                      key={major.id}
                      onClick={() => setExpandedMajorId(isExpanded ? null : major.id)}
                      className="card-deep p-4 cursor-pointer hover:border-indigo-500/40 border border-transparent transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 leading-snug">
                          {major.name}
                        </h5>
                        {major.code && (
                          <span className="badge badge-teal text-[10px] shrink-0 font-mono">
                            {major.code}
                          </span>
                        )}
                      </div>

                      {major.codeList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {major.codeList.slice(0, 3).map((code, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                              {code}
                            </span>
                          ))}
                          {major.codeList.length > 3 && (
                            <span className="text-[10px] text-slate-600">+{major.codeList.length - 3} mã</span>
                          )}
                        </div>
                      )}

                      {major.description && (
                        <p className={`text-xs text-slate-400 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {major.description}
                        </p>
                      )}

                      <div className="mt-2 text-[11px] text-indigo-400 font-semibold flex items-center justify-between">
                        <span>{isExpanded ? '▲ Thu gọn' : '▼ Xem mã tuyển sinh chi tiết'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
