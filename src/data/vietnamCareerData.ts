export interface SalaryByYOE {
  entry: number;      // 0-2 năm (VNĐ / tháng)
  mid: number;        // 3-5 năm (VNĐ / tháng)
  senior: number;     // 6-10 năm (VNĐ / tháng)
  lead: number;       // 10+ năm (VNĐ / tháng)
}

export interface CareerField {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  focusSubjects: string[];      // Các môn THPT cần giỏi: ["Toán", "Vật Lý", "Tiếng Anh"]
  primaryExamBlocks: string[];  // Khối thi THPT: ["A00", "A01", "D01"]
  majorName: string;            // Tên Ngành ĐH/CĐ
  degreeType: 'Đại học' | 'Cao đẳng' | 'Trường Nghề';
  durationYears: number;        // Số năm đào tạo: 1.5 - 6 năm
  avgTuitionPerYearVND: number; // Học phí trung bình / năm (VNĐ)
  salariesVND: SalaryByYOE;     // Thu nhập VNĐ/tháng theo kinh nghiệm
  topSchools: string[];         // Các trường ĐH/CĐ tiêu biểu
  highSchoolRoadmap: {
    grade10: string;
    grade11: string;
    grade12: string;
  };
  isHot2026?: boolean;          // Xu hướng nóng 2026
}

export const EXAM_BLOCKS_INFO: Record<string, { name: string; subjects: string[]; desc: string }> = {
  "A00": { name: "Khối A00", subjects: ["Toán", "Vật lý", "Hóa học"], desc: "Khối Tự nhiên truyền thống — Phù hợp Bán dẫn, CNTT, Kỹ thuật, Ô tô" },
  "A01": { name: "Khối A01", subjects: ["Toán", "Vật lý", "Tiếng Anh"], desc: "Khối Công nghệ & Quốc tế — Phù hợp AI, Bán dẫn, Fintech, Logistics" },
  "B00": { name: "Khối B00", subjects: ["Toán", "Hóa học", "Sinh học"], desc: "Khối Y Dược & Sinh học — Phù hợp Bác sĩ, Dược sĩ, Công nghệ Sinh học" },
  "C00": { name: "Khối C00", subjects: ["Ngữ văn", "Lịch sử", "Địa lý"], desc: "Khối Xã hội — Phù hợp Báo chí, Luật, Sư phạm, Truyền thông" },
  "D01": { name: "Khối D01", subjects: ["Toán", "Ngữ văn", "Tiếng Anh"], desc: "Khối Toàn diện phổ biến nhất — Phù hợp Kinh tế, E-commerce, Marketing, Luật" },
  "D07": { name: "Khối D07", subjects: ["Toán", "Hóa học", "Tiếng Anh"], desc: "Khối Hóa Anh — Phù hợp Công nghệ Bán dẫn, Fintech, Dược Quốc tế" },
  "H00": { name: "Khối H00", subjects: ["Ngữ văn", "Năng khiếu Vẽ 1", "Năng khiếu Vẽ 2"], desc: "Khối Nghệ thuật — Phù hợp Thiết kế Đồ họa, UI/UX, 3D Game Design" },
  "V00": { name: "Khối V00", subjects: ["Toán", "Vật lý", "Vẽ Mỹ thuật"], desc: "Khối Kiến trúc — Phù hợp Kỹ sư Kiến trúc, Thiết kế Nội thất" }
};

export const VIETNAM_CAREER_DATA: CareerField[] = [
  {
    id: "semiconductor-engineer",
    title: "Kỹ Sư Vi Mạch Bán Dẫn (Chip & IC Design)",
    category: "Công Nghệ Cao & Bán Dẫn",
    icon: "🔬",
    description: "Thiết kế, kiểm thử và đóng gói chip vi mạch bán dẫn — Ngành chiến lược quốc gia 2026 với nhu cầu 50,000 kỹ sư đến năm 2030.",
    focusSubjects: ["Toán", "Vật lý", "Tiếng Anh"],
    primaryExamBlocks: ["A00", "A01", "D07"],
    majorName: "Kỹ thuật Vi mạch Bán dẫn / Điện tử Viễn thông",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 38000000,
    salariesVND: {
      entry: 18000000,   // 18M/tháng
      mid: 38000000,     // 38M/tháng
      senior: 75000000,   // 75M/tháng
      lead: 130000000     // 130M/tháng
    },
    topSchools: ["ĐH Bách Khoa Hà Nội", "ĐH Bách Khoa TP.HCM", "ĐH Công nghệ - ĐHQGHN", "ĐH FPT"],
    highSchoolRoadmap: {
      grade10: "Rèn luyện tư duy Toán đại số & Vật lý Điện học. Học Tiếng Anh chuyên ngành căn bản.",
      grade11: "Tập trung phần Điện tử & Vật lý bán dẫn lớp 11. Đạt IELTS 6.0+.",
      grade12: "Luyện thi khối A00/A01 đạt tổng điểm 26.5+. Thi Đánh giá Năng lực ĐHQG."
    },
    isHot2026: true,
  },
  {
    id: "ai-data-engineer",
    title: "Kỹ Sư Trí Tuệ Nhân Tạo (AI) & Data Science",
    category: "Công nghệ Thông tin",
    icon: "🤖",
    description: "Nghiên cứu mô hình Generative AI, Machine Learning, xử lý dữ liệu lớn (Big Data) cho các tập đoàn công nghệ toàn cầu.",
    focusSubjects: ["Toán", "Vật lý", "Tiếng Anh"],
    primaryExamBlocks: ["A00", "A01", "D07"],
    majorName: "Trí tuệ Nhân tạo / Khoa học Dữ liệu",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 40000000,
    salariesVND: {
      entry: 18000000,
      mid: 40000000,
      senior: 80000000,
      lead: 140000000
    },
    topSchools: ["ĐH Bách Khoa Hà Nội", "ĐH Công nghệ Thông tin (UIT)", "ĐH Bách Khoa TP.HCM", "ĐH VinUni"],
    highSchoolRoadmap: {
      grade10: "Rèn luyện tư duy logic Toán học (Đại số tuyến tính, Xác suất thống kê cơ bản).",
      grade11: "Học ngôn ngữ lập trình Python/C++ cơ bản. Đạt chứng chỉ IELTS 6.5+.",
      grade12: "Tập trung tối đa cho kỳ thi THPT khối A01/D07 đạt tổng điểm 27+."
    },
    isHot2026: true,
  },
  {
    id: "cybersecurity-cloud",
    title: "Kỹ Sư An Ninh Mạng & Điện Toán Đám Mây (Cloud)",
    category: "Công nghệ Thông tin",
    icon: "🛡️",
    description: "Bảo vệ hệ thống dữ liệu doanh nghiệp, chống tấn công mạng và hạ tầng Cloud Security trong kỷ nguyên số 2026.",
    focusSubjects: ["Toán", "Vật lý", "Tiếng Anh"],
    primaryExamBlocks: ["A00", "A01", "D01"],
    majorName: "An toàn Thông tin / Kỹ thuật Đám mây",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 35000000,
    salariesVND: {
      entry: 14000000,
      mid: 30000000,
      senior: 65000000,
      lead: 110000000
    },
    topSchools: ["Học viện Kỹ thuật Mật mã", "ĐH Công nghệ Thông tin (UIT)", "Học viện Bưu chính Viễn thông"],
    highSchoolRoadmap: {
      grade10: "Tập trung môn Toán & Tiếng Anh. Tìm hiểu nguyên lý mạng máy tính.",
      grade11: "Thực hành Linux & tư duy bảo mật cơ bản. Học Tiếng Anh đọc tài liệu kỹ thuật.",
      grade12: "Thi THPT khối A00/A01 mục tiêu 25+ điểm."
    },
    isHot2026: true,
  },
  {
    id: "logistics-supply-chain",
    title: "Chuyên Viên Logistics & Chuỗi Cung Ứng Toàn Cầu",
    category: "Kinh Tế & Vận Tải",
    icon: "🚢",
    description: "Quản lý luồng hàng hóa, vận tải đa phương thức và tối ưu hóa chuỗi cung ứng cho các tập đoàn đa quốc gia tại VN.",
    focusSubjects: ["Toán", "Tiếng Anh", "Ngữ văn"],
    primaryExamBlocks: ["A00", "A01", "D01"],
    majorName: "Logistics & Quản lý Chuỗi cung ứng",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 30000000,
    salariesVND: {
      entry: 12000000,
      mid: 26000000,
      senior: 55000000,
      lead: 95000000
    },
    topSchools: ["ĐH Ngoại Thương", "ĐH Giao thông Vận tải", "ĐH Kinh tế TP.HCM (UEH)", "ĐH Hàng hải"],
    highSchoolRoadmap: {
      grade10: "Học giỏi môn Tiếng Anh và Toán. Tìm hiểu tổng quan về thương mại quốc tế.",
      grade11: "Đầu tư mạnh Tiếng Anh giao tiếp & IELTS (mục tiêu 6.5+).",
      grade12: "Luyện thi khối A01/D01 đạt 26+ điểm vào các trường top đầu."
    },
    isHot2026: true,
  },
  {
    id: "renewable-energy-esg",
    title: "Kỹ Sư Năng Lượng Tái Tạo & Chuyên Viên ESG",
    category: "Năng Lượng & Phát Triển Bền Vững",
    icon: "🌱",
    description: "Phát triển dự án điện gió, điện mặt trời, quản lý phát thải carbon và tư vấn chiến lược xanh (ESG) cho doanh nghiệp.",
    focusSubjects: ["Toán", "Vật lý", "Hóa học"],
    primaryExamBlocks: ["A00", "A01", "B00"],
    majorName: "Kỹ thuật Năng lượng / Môi trường & Bền vững",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 28000000,
    salariesVND: {
      entry: 13000000,
      mid: 28000000,
      senior: 60000000,
      lead: 105000000
    },
    topSchools: ["ĐH Bách Khoa Hà Nội", "ĐH Điện lực", "ĐH Bách Khoa TP.HCM", "ĐH Khoa học Tự nhiên"],
    highSchoolRoadmap: {
      grade10: "Xây nền tảng vững môn Vật lý & Hóa học.",
      grade11: "Tìm hiểu nguyên lý chuyển đổi năng lượng mặt trời/gió.",
      grade12: "Luyện thi khối A00/A01 mục tiêu 24.5+ điểm."
    },
    isHot2026: true,
  },
  {
    id: "software-engineer",
    title: "Kỹ Sư Lập Trình Phần Mềm / Web / App",
    category: "Công nghệ Thông tin",
    icon: "💻",
    description: "Xây dựng ứng dụng di động, trang web, hệ thống backend và phần mềm cho các công ty công nghệ trong & ngoài nước.",
    focusSubjects: ["Toán", "Vật lý", "Tiếng Anh"],
    primaryExamBlocks: ["A00", "A01", "D01"],
    majorName: "Công nghệ Thông tin / Kỹ thuật Phần mềm",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 35000000,
    salariesVND: {
      entry: 13000000,
      mid: 30000000,
      senior: 60000000,
      lead: 100000000
    },
    topSchools: ["ĐH Bách Khoa Hà Nội", "ĐH Bách Khoa TP.HCM", "ĐH Công nghệ Thông tin (UIT)", "ĐH FPT"],
    highSchoolRoadmap: {
      grade10: "Tập trung giải bài tập Toán đại số & Hình học. Bắt đầu làm quen Tiếng Anh căn bản.",
      grade11: "Ôn tập Vật lý chương Điện học. Học tư duy thuật toán lập trình Scratch/Python cơ bản.",
      grade12: "Luyện thi khối A00/A01 (Toán 8.5+, Lý 8+, Anh 8+). Thi chứng chỉ IELTS 6.0+ nếu có thể."
    },
    isHot2026: true,
  },
  {
    id: "doctor-medical",
    title: "Bác Sĩ Đa Khoa & Y Tế Số (Digital Health)",
    category: "Y Dược & Sức Khỏe",
    icon: "🩺",
    description: "Chẩn đoán, điều trị bệnh lý và ứng dụng công nghệ Y tế Số (Telemedicine, AI y khoa) tại các bệnh viện công lập & quốc tế.",
    focusSubjects: ["Toán", "Hóa học", "Sinh học"],
    primaryExamBlocks: ["B00"],
    majorName: "Y Đa khoa",
    degreeType: "Đại học",
    durationYears: 6,
    avgTuitionPerYearVND: 60000000,
    salariesVND: {
      entry: 11000000,
      mid: 28000000,
      senior: 65000000,
      lead: 120000000
    },
    topSchools: ["ĐH Y Hà Nội", "ĐH Y Dược TP.HCM", "ĐH Y Khoa Phạm Ngọc Thạch"],
    highSchoolRoadmap: {
      grade10: "Học giỏi đều Sinh học & Hóa học lớp 10. Xây dựng sự kiên trì và cẩn thận.",
      grade11: "Đạt điểm giỏi Hóa Hữu cơ & Sinh học di truyền.",
      grade12: "Luyện thi khối B00 mục tiêu 27.5+ điểm (Toán, Hóa, Sinh)."
    },
    isHot2026: true,
  },
  {
    id: "pharmacist",
    title: "Dược Sĩ Nghiên Cứu & Quản Lý Dược",
    category: "Y Dược & Sức Khỏe",
    icon: "💊",
    description: "Nghiên cứu công thức thuốc, thử nghiệm lâm sàng, bào chế dược phẩm và quản lý hệ thống nhà thuốc hiện đại.",
    focusSubjects: ["Toán", "Hóa học", "Sinh học", "Tiếng Anh"],
    primaryExamBlocks: ["A00", "B00"],
    majorName: "Dược học",
    degreeType: "Đại học",
    durationYears: 5,
    avgTuitionPerYearVND: 50000000,
    salariesVND: {
      entry: 12000000,
      mid: 25000000,
      senior: 50000000,
      lead: 85000000
    },
    topSchools: ["ĐH Dược Hà Nội", "ĐH Y Dược TP.HCM", "ĐH Y Hà Nội"],
    highSchoolRoadmap: {
      grade10: "Tập trung môn Hóa học & Toán học.",
      grade11: "Nắm vững Hóa vô cơ & hữu cơ.",
      grade12: "Thi THPT Quốc gia khối A00/B00 mục tiêu điểm số 25.5+."
    }
  },
  {
    id: "finance-fintech",
    title: "Chuyên Viên Tài Chính / Fintech & Blockchain",
    category: "Kinh Tế & Quản Lý",
    icon: "📊",
    description: "Phân tích đầu tư, công nghệ ngân hàng số (Fintech), quản lý rủi ro tài chính và mô hình tài chính số hóa.",
    focusSubjects: ["Toán", "Tiếng Anh", "Ngữ văn"],
    primaryExamBlocks: ["A00", "A01", "D01", "D07"],
    majorName: "Tài chính - Ngân hàng / Công nghệ Tài chính",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 32000000,
    salariesVND: {
      entry: 12000000,
      mid: 28000000,
      senior: 58000000,
      lead: 100000000
    },
    topSchools: ["ĐH Ngoại Thương", "ĐH Kinh tế Quốc dân (NEU)", "ĐH Kinh tế TP.HCM (UEH)"],
    highSchoolRoadmap: {
      grade10: "Rèn luyện tư duy con số với môn Toán. Đọc thêm sách kinh tế nhập môn.",
      grade11: "Đầu tư Tiếng Anh đạt tối thiểu IELTS 6.5.",
      grade12: "Luyện đề THPT khối A01/D01 đạt điểm sàn 26+."
    },
    isHot2026: true,
  },
  {
    id: "digital-marketing-ecommerce",
    title: "Chuyên Viên Growth Marketing & Thương Mại Điện Tử",
    category: "Truyền Thông & Marketing",
    icon: "🚀",
    description: "Xây dựng chiến dịch truyền thông đa kênh, tăng trưởng doanh số sàn E-commerce, tối ưu AI Ads & Content Creator.",
    focusSubjects: ["Ngữ văn", "Tiếng Anh", "Toán"],
    primaryExamBlocks: ["D01", "A01", "C00"],
    majorName: "Marketing / Thương mại Điện tử",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 28000000,
    salariesVND: {
      entry: 10000000,
      mid: 22000000,
      senior: 45000000,
      lead: 85000000
    },
    topSchools: ["ĐH Kinh tế Quốc dân", "ĐH Ngoại Thương", "Học viện Báo chí & Tuyên truyền", "ĐH Thương mại"],
    highSchoolRoadmap: {
      grade10: "Đọc sách đa dạng, rèn luyện kỹ năng viết lách Văn học.",
      grade11: "Tự quay dựng video ngắn, làm quen Tiếng Anh giao tiếp & viết lách.",
      grade12: "Ôn tập thi THPT khối D01 đạt 24.5+ điểm."
    },
    isHot2026: true,
  },
  {
    id: "graphic-ui-ux-designer",
    title: "Nhà Thiết Kế Đồ Họa / UI UX / 3D Design",
    category: "Nghệ Thuật & Thiết Kế",
    icon: "🎨",
    description: "Thiết kế nhận diện thương hiệu, trải nghiệm người dùng ứng dụng số (UI/UX), đồ họa 3D và sản phẩm truyền thông thị giác.",
    focusSubjects: ["Năng khiếu Vẽ", "Ngữ văn", "Tiếng Anh"],
    primaryExamBlocks: ["H00", "V00", "D01"],
    majorName: "Thiết kế Đồ họa / Truyền thông Thị giác",
    degreeType: "Đại học",
    durationYears: 4,
    avgTuitionPerYearVND: 32000000,
    salariesVND: {
      entry: 11000000,
      mid: 25000000,
      senior: 50000000,
      lead: 85000000
    },
    topSchools: ["ĐH Kiến trúc TP.HCM", "ĐH Mỹ thuật Công nghiệp", "ĐH Kiến trúc Hà Nội", "Cao đẳng FPT"],
    highSchoolRoadmap: {
      grade10: "Học hình họa cơ bản, hình khối và phối màu tại lò vẽ năng khiếu.",
      grade11: "Luyện vẽ trang trí màu & đầu tượng chuẩn bị cho thi năng khiếu.",
      grade12: "Tham gia kỳ thi Năng khiếu khối H00/V00 song song ôn Văn/Toán."
    }
  },
  {
    id: "automotive-ev-engineer",
    title: "Kỹ Sư Ô Tô Điện (EV) & Xe Tự Hành",
    category: "Cơ Khí & Kỹ Thuật",
    icon: "🚗",
    description: "Thiết kế, chế tạo, pin nhiên liệu và hệ thống xe điện thông minh (EV) — Ngành công nghiệp ô tô bùng nổ 2026.",
    focusSubjects: ["Toán", "Vật lý", "Hóa học"],
    primaryExamBlocks: ["A00", "A01"],
    majorName: "Công nghệ Kỹ thuật Ô tô / Xe Điện EV",
    degreeType: "Đại học",
    durationYears: 4.5,
    avgTuitionPerYearVND: 30000000,
    salariesVND: {
      entry: 11500000,
      mid: 24000000,
      senior: 48000000,
      lead: 80000000
    },
    topSchools: ["ĐH Bách Khoa Hà Nội", "ĐH Bách Khoa TP.HCM", "ĐH Sư phạm Kỹ thuật TP.HCM"],
    highSchoolRoadmap: {
      grade10: "Học tốt Vật lý cơ học & Toán đại số.",
      grade11: "Đọc thêm sách về máy móc, pin lithium, nguyên lý truyền động điện.",
      grade12: "Luyện thi THPT khối A00/A01 mục tiêu 25+ điểm."
    },
    isHot2026: true,
  }
];
