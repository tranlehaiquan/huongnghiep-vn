import React, { useState, useMemo } from 'react';

const REGIONS = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam'];
const TYPES = ['Tất cả', 'Đại học', 'Cao đẳng', 'Học viện'];

const regionMap: Record<string, string> = {
  'Miền Bắc': 'North',
  'Miền Trung': 'Central',
  'Miền Nam': 'South',
};

const ACCENT_MAP: Record<string, string> = {'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ắ':'a','ặ':'a','ằ':'a','ẳ':'a','ẵ':'a','â':'a','ấ':'a','ậ':'a','ầ':'a','ẩ':'a','ẫ':'a','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ế':'e','ệ':'e','ề':'e','ể':'e','ễ':'e','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ố':'o','ộ':'o','ồ':'o','ổ':'o','ỗ':'o','ơ':'o','ớ':'o','ợ':'o','ờ':'o','ở':'o','ỡ':'o','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ứ':'u','ự':'u','ừ':'u','ử':'u','ữ':'u','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y','đ':'d','À':'A','Á':'A','Ả':'A','Ã':'A','Ạ':'A','Ă':'A','Ắ':'A','Ặ':'A','Ằ':'A','Ẳ':'A','Ẵ':'A','Â':'A','Ấ':'A','Ậ':'A','Ầ':'A','Ẩ':'A','Ẫ':'A','È':'E','É':'E','Ẻ':'E','Ẽ':'E','Ẹ':'E','Ê':'E','Ế':'E','Ệ':'E','Ề':'E','Ể':'E','Ễ':'E','Ì':'I','Í':'I','Ỉ':'I','Ĩ':'I','Ị':'I','Ò':'O','Ó':'O','Ỏ':'O','Õ':'O','Ọ':'O','Ô':'O','Ố':'O','Ộ':'O','Ồ':'O','Ổ':'O','Ỗ':'O','Ơ':'O','Ớ':'O','Ợ':'O','Ờ':'O','Ở':'O','Ỡ':'O','Ù':'U','Ú':'U','Ủ':'U','Ũ':'U','Ụ':'U','Ư':'U','Ứ':'U','Ự':'U','Ừ':'U','Ử':'U','Ữ':'U','Ỳ':'Y','Ý':'Y','Ỷ':'Y','Ỹ':'Y','Ỵ':'Y','Đ':'D'};
function slugify(name: string): string {
  return name.split('').map(c => ACCENT_MAP[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}


interface Props {
  schools: any[];
}

export default function SchoolSearchIsland({ schools }: Props) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('Tất cả');
  const [type, setType] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const PER_PAGE = 24;

  const filtered = useMemo(() => {
    return schools.filter(s => {
      const matchQ = !query || s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.code?.toLowerCase().includes(query.toLowerCase()) ||
        s.province?.toLowerCase().includes(query.toLowerCase()) ||
        s.majors?.some((m: any) => m.name?.toLowerCase().includes(query.toLowerCase()));
      const matchR = region === 'Tất cả' || s.region === regionMap[region];
      const matchT = type === 'Tất cả' ||
        (type === 'Đại học' && (s.type === 'university' && !s.typeLabel?.includes('Học viện'))) ||
        (type === 'Cao đẳng' && s.type === 'college') ||
        (type === 'Học viện' && s.typeLabel?.includes('Học viện'));
      return matchQ && matchR && matchT;
    });
  }, [schools, query, region, type]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  const handleSearch = (v: string) => { setQuery(v); setPage(1); };
  const handleRegion = (v: string) => { setRegion(v); setPage(1); };
  const handleType = (v: string) => { setType(v); setPage(1); };

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-5">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Tìm trường theo tên, mã trường, tỉnh thành, ngành học..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          className="input-field pl-12 py-4 text-base"
        />
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1.5 mr-4">
          {REGIONS.map(r => (
            <button key={r} onClick={() => handleRegion(r)} className={`chip ${region === r ? 'active' : ''}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {TYPES.map(t => (
            <button key={t} onClick={() => handleType(t)} className={`chip ${type === t ? 'active' : ''}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500 mb-5">
        {filtered.length === 0
          ? 'Không tìm thấy trường nào'
          : `Hiển thị ${paginated.length} / ${filtered.length} trường`}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-slate-400">Không tìm thấy trường nào phù hợp.</div>
          <button
            onClick={() => { handleSearch(''); handleRegion('Tất cả'); handleType('Tất cả'); }}
            className="btn-secondary mt-4"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((school: any) => {
              const slug = slugify(school.name);
              const tuitionM = (school.avgTuitionPerYearVND / 1000000).toFixed(0);
              const isCollege = school.type === 'college';
              const isAcademy = school.typeLabel?.includes('Học viện');
              const badgeClass = isCollege ? 'badge-teal' : isAcademy ? 'badge-violet' : 'badge-primary';
              return (
                <a
                  key={school.id || school.name}
                  href={`/schools/${slug}`}
                  className="card card-hover p-4 flex flex-col group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">🏛️</span>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {school.vnurRank2025 && (
                        <span className="badge text-xs" style={{ background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                          🏆 #{school.vnurRank2025} VNUR
                        </span>
                      )}
                      <span className={`badge ${badgeClass} text-xs`}>
                        {isCollege ? 'Cao đẳng' : isAcademy ? 'Học viện' : 'Đại học'}
                      </span>
                      {school.code && (
                        <span className="badge badge-gold text-xs">{school.code}</span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug mb-2 flex-1 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {school.name}
                  </h3>
                  <div className="text-xs text-slate-500 mb-3">{school.province}</div>
                  <div className="divider mb-3"></div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{school.majors?.length || 0} ngành</span>
                    <span className="text-emerald-400 font-semibold">{tuitionM}M/năm</span>
                  </div>
                  {school.majors?.slice(0, 2).map((m: any) => (
                    <div key={m.code} className="mt-1.5 text-xs text-slate-600 truncate">· {m.name}</div>
                  ))}
                </a>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button onClick={() => setPage(p => p + 1)} className="btn-secondary">
                Xem thêm ({filtered.length - paginated.length} trường còn lại)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
