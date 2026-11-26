export interface KppbCourseCard {
  id: 'teknologi' | 'sejarah' | 'english';
  bahagianLabel: string;
  courseCode: string;
  courseName: string;
  shortLabel: string;
  title: string;
  colorScheme: 'lavender' | 'sky' | 'rose';
}

/**
 * Laluan fail foto bukti sebenar yang dilampirkan dalam /public/assets/aistudio/.
 * Fail di dalam /public disalin secara automatik ke dist/ semasa binaan dan penerbitan.
 */
export const KPPB_EVIDENCE_IMAGES = {
  sejarahMeet: '/assets/aistudio/temubual_sejatah_967be25a.jpg',
  englishPodcast: '/assets/aistudio/Screenshot_2026-11-26_144513_08464c8d.png',
} as const;

/**
 * Laluan fail PDF sebenar Tugasan 2 yang dilampirkan sebagai aset statik dalam /public/assets/aistudio/.
 * Fail di dalam /public disalin secara automatik ke dist/ semasa binaan dan penerbitan.
 */
export const KPPB_TUGASAN2_PDF_URL = '/assets/aistudio/infografik_pdf_d223fc6c.pdf';

export const KPPB_HERO = {
  title: 'JELAJAH KPPB',
  subtitle: 'Tiga Kursus, Satu Pembelajaran Bermakna',
  bigIdeaLabel: 'Big Idea',
  bigIdea:
    'Sejarah Pendidikan Wadah Negara Bangsa melalui Ulasan Kritis dan Inovasi Digital',
  intro:
    'Halaman ini memperlihatkan integrasi pembelajaran bermakna antara tiga kursus melalui pemahaman sejarah pendidikan, kemahiran ulasan kritis dan inovasi digital. Aktiviti Sejarah dan English ialah bukti tugasan pelajar guru, bukan aktiviti yang perlu dilaksanakan oleh murid Tahun 5.',
};

export const KPPB_COURSE_OVERVIEW: KppbCourseCard[] = [
  {
    id: 'teknologi',
    bahagianLabel: 'Bahagian 1',
    courseCode: 'EDUP6023',
    courseName: 'Teknologi Pengajaran dan Pembelajaran',
    shortLabel: 'Teknologi',
    title: 'Penghasilan Objek Pembelajaran Digital',
    colorScheme: 'lavender',
  },
  {
    id: 'sejarah',
    bahagianLabel: 'Bahagian 2',
    courseCode: 'EDUP6013',
    courseName: 'Sejarah Pendidikan di Malaysia',
    shortLabel: 'Sejarah',
    title: 'Temu Bual Sejarah Pendidikan melalui Google Meet',
    colorScheme: 'sky',
  },
  {
    id: 'english',
    bahagianLabel: 'Bahagian 3',
    courseCode: 'MPU6122',
    courseName: 'English Language Proficiency',
    shortLabel: 'English',
    title: 'The Ultimate Movie Debate – A Movie Critics Podcast',
    colorScheme: 'rose',
  },
];

export const KPPB_TEKNOLOGI_DATA = {
  bahagian: 'Bahagian 1',
  courseCode: 'EDUP6023',
  courseTitle: 'Teknologi Pengajaran dan Pembelajaran',
  title: 'Penghasilan Objek Pembelajaran Digital.',
  product: 'Suara Hati: Jejak Kasih Guru',
  target: 'Bahasa Melayu Tahun 5, Aspek Seni Bahasa',
  sk: 'SK 4.2: Menghayati keindahan dan kesantunan bahasa dalam bahan sastera.',
  sp: 'SP 4.2.2: Mendeklamasikan sajak dengan nada yang sesuai dan menyatakan maksud sajak.',
  description:
    'OPD ini menerapkan WHERETO dan gamifikasi melalui sajak "Guruku Pelita Hidup", penerokaan misi, kuiz, latihan deklamasi, rakaman suara, refleksi, penilaian kendiri dan peluang menambah baik persembahan. Aktiviti rakaman, penilaian dan penambahbaikan digital menyokong tahap Modification dalam model SAMR.',
  ctaLabel: 'Terokai OPD',
  tugasan2Card: {
    title: 'Bukti Perancangan Pengajaran — Tugasan 2',
    description:
      'Infografik Tugasan 2 ini menggunakan model WHERETO untuk merancang pembelajaran Bahasa Melayu Tahun 5 berasaskan SK 4.2 dan SP 4.2.2. Enam halaman infografik merangkumi Where & Why, Hook & Hold, Equip & Experience, Rethink & Revise, Evaluate, Tailor & Organize serta integrasi media, pentaksiran dan keselarasan PdP. Perancangan ini menjadi asas pembangunan OPD Suara Hati: Jejak Kasih Guru dalam Tugasan 3.',
    buttonLabel: 'LIHAT PDF TUGASAN 2',
    placeholderTitle: 'Fail PDF Tugasan 2 Belum Dilampirkan',
    placeholderText:
      'Placeholder aktif: Fail PDF sebenar (6 halaman infografik WHERETO) belum dilampirkan ke dalam projek. Setelah fail PDF dilampirkan, butang di atas akan membukanya dalam tab baharu.',
  },
};

export const KPPB_SEJARAH_DATA = {
  bahagian: 'Bahagian 2',
  courseCode: 'EDUP6013',
  courseTitle: 'Sejarah Pendidikan di Malaysia',
  title: 'Temu Bual Sejarah Pendidikan melalui Google Meet.',
  description:
    'Aktiviti temu bual dan perbincangan dalam talian membantu pelajar guru meneliti perkembangan pendidikan di Malaysia serta memahami peranan pendidikan dalam pembangunan masyarakat dan negara. Aktiviti ini menggalakkan komunikasi, kolaborasi dan pemikiran kritis.',
  opdConnection:
    'Kefahaman tentang kepentingan pendidikan dan sumbangan pendidik dikaitkan dengan nilai penghargaan kepada guru dalam sajak "Guruku Pelita Hidup".',
  evidenceCaption:
    'Bukti Pelaksanaan Temu Bual Sejarah Pendidikan di Malaysia melalui Google Meet',
  placeholderTitle: 'Ruang Foto Sebenar Sesi Google Meet',
  placeholderHint:
    'Foto sebenar sesi temu bual Google Meet akan dipaparkan di sini selepas dimuat naik.',
};

export const KPPB_ENGLISH_DATA = {
  bahagian: 'Bahagian 3',
  courseCode: 'MPU6122',
  courseTitle: 'English Language Proficiency',
  title: '"The Ultimate Movie Debate – A Movie Critics Podcast".',
  members: 'Louise, Haikal dan Aleeya',
  films: 'Coco, The Others, Parasite dan Barbie',
  finalDecision: 'Coco',
  description:
    'Podcast bahasa Inggeris melibatkan ulasan kritis terhadap tema, mesej, budaya, emosi dan nilai filem. Aktiviti ini mengukuhkan kemahiran komunikasi, kolaborasi, penghujahan dan pemikiran kritis.',
  opdConnection:
    'Kemahiran mentafsir mesej dan menyampaikan emosi dalam ulasan karya dihubungkan dengan penghayatan serta deklamasi sajak "Guruku Pelita Hidup".',
  evidenceCaption:
    'Bukti Pelaksanaan The Ultimate Movie Debate – A Movie Critics Podcast',
  placeholderTitle: 'Ruang Foto Sebenar Kumpulan Podcast',
  placeholderHint:
    'Foto sebenar kumpulan podcast akan dipaparkan di sini selepas dimuat naik.',
};

export const KPPB_INTEGRATION_DATA = {
  heading: 'Jalinan Pembelajaran Bermakna',
  subheading: 'Bagaimana ketiga-tiga kursus saling berhubung membentuk pengalaman pembelajaran bersepadu',
  nodes: [
    {
      id: 'sejarah',
      label: 'SEJARAH',
      courseCode: 'EDUP6013',
      role: 'Memahami perkembangan dan kepentingan pendidikan.',
      colorScheme: 'sky' as const,
    },
    {
      id: 'english',
      label: 'ENGLISH',
      courseCode: 'MPU6122',
      role: 'Mengembangkan komunikasi, kolaborasi dan ulasan kritis.',
      colorScheme: 'rose' as const,
    },
    {
      id: 'teknologi',
      label: 'TEKNOLOGI',
      courseCode: 'EDUP6023',
      role: 'Menghasilkan inovasi pembelajaran digital yang interaktif.',
      colorScheme: 'lavender' as const,
    },
  ],
  outcomesLabel: 'Hasil Integrasi',
  outcomes: [
    'Pemikiran Kritis',
    'Kreativiti',
    'Komunikasi',
    'Kolaborasi',
    'Penghargaan terhadap Guru',
  ],
  summaryTitle: 'Rumusan',
  summaryText:
    'Integrasi KPPB menghubungkan pemahaman sejarah pendidikan, kemahiran ulasan kritis dan inovasi digital dalam satu pengalaman pembelajaran bermakna. Melalui OPD Suara Hati: Jejak Kasih Guru, murid berpeluang menghayati jasa guru serta meningkatkan kemahiran bahasa dan ekspresi diri.',
};
