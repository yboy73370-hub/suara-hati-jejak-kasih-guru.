import {
  EmotionChoice,
  GlossaryWordItem,
  KbatQuestionItem,
  MagicBookItem,
  MeaningMatchItem,
  Mission5ChecklistItem,
  Mission5RubricAspect,
  MissionLocation,
  PerformanceStyleOption,
  PoemStanza,
  Quiz4Question,
  QuizQuestion,
  SelfAssessmentAspect,
  StanzaPracticeItem,
  TechniqueCardItem,
} from '../types/game';

export const ASSETS = {
  fantasyBackdrop: '/src/assets/images/fantasy_home_backdrop_1795451853571.jpg',
  fantasyCharacters: '/src/assets/images/fantasy_characters_hero_1795451853492.jpg',
  fantasyIslandsMap: '/src/assets/images/fantasy_islands_map_1795451852523.jpg',
  pelitaEmblem: '/src/assets/images/pelita_emblem_1795451240948.jpg',
  mission1Gate: '/src/assets/images/mission1_gate_clean_1795452845501.jpg',
  mission2Garden: '/src/assets/images/mission2_bisikan_hati_1795483940865.jpg',
  mission3Library: '/src/assets/images/mission3_rahsia_pelita_1795485137673.jpg',
  mission4Studio: '/src/assets/images/mission4_studio_suara_1795486906474.jpg',
  mission5Stage: '/src/assets/images/mission5_pentas_kasih_1795494732890.jpg',
  mission6Palace: '/src/assets/images/mission6_istana_pelita_1795495663166.jpg',
} as const;

export const APP_INFO = {
  shortTitle: 'SUARA HATI',
  fullTitle: 'SUARA HATI',
  subtitle: 'JEJAK KASIH GURU',
  tagline: 'Pengembaraan Dunia Sajak Tahun 5',
  slogan: 'Hayati Makna, Hidupkan Rasa, Ungkapkan Kasih!',
  subject: 'Bahasa Melayu Tahun 5',
  aspect: 'Seni Bahasa',
  standardKandungan: '4.2 – Menghayati keindahan dan kesantunan bahasa dalam bahan sastera.',
  standardPembelajaran:
    '4.2.2 – Mendeklamasikan sajak dengan nada yang sesuai dan menyatakan maksud sajak.',
  mainText: 'Guruku Pelita Hidup',
  targetUser: 'Murid sekolah rendah berumur 11 tahun',
};

export const INTRO_STORY_PARAGRAPHS = [
  'Selamat datang, Wira Suara Hati!',
  'Cahaya Pelita Kasih semakin malap. Hanya suara yang penuh penghayatan dan penghargaan mampu menghidupkannya semula.',
  'Terokai keindahan sajak Guruku Pelita Hidup, fahami setiap rangkap dan kuasai seni deklamasi untuk mengembalikan cahaya kasih guru!',
];

export const LEARNING_OBJECTIVES = [
  {
    number: 1,
    title: 'Memahami Maksud Sajak',
    text: 'Menyatakan maksud sekurang-kurangnya tiga daripada empat rangkap sajak dengan tepat.',
  },
  {
    number: 2,
    title: 'Menguasai Seni Deklamasi',
    text: 'Mendeklamasikan sajak menggunakan nada, intonasi dan sebutan yang sesuai.',
  },
  {
    number: 3,
    title: 'Berkarya Dengan Yakin',
    text: 'Menghasilkan video deklamasi sajak secara kreatif dan yakin serta menambah baik persembahan berdasarkan maklum balas.',
  },
];

export const GAME_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Kenali Dunia Suara Hati',
    description:
      'Baca kisah Pelita Kasih di Halaman Utama dan semak Objektif Pembelajaran sebelum memulakan perjalanan kamu.',
  },
  {
    step: 2,
    title: 'Buka Peta Misi',
    description:
      'Tekan butang MULA PENGEMBARAAN atau menu Misi di bahagian atas untuk melihat enam pulau pengembaraan yang dihubungkan jambatan pelangi.',
  },
  {
    step: 3,
    title: 'Terokai Setiap Pulau Secara Tertib',
    description:
      'Pilih mana-mana pulau daripada Misi 1 hingga Misi 6 pada peta atau kad pulau untuk melihat penerangan dan persediaan aktiviti.',
  },
  {
    step: 4,
    title: 'Kawal Muzik, Animasi & Kemajuan',
    description:
      'Gunakan butang Muzik dan Animasi di bahagian atas mengikut keselesaan kamu. Kemajuan misi disimpan secara automatik di dalam pelayar.',
  },
];

export const MISSION_LOCATIONS: MissionLocation[] = [
  {
    id: 1,
    code: 'Misi 1',
    title: 'GERBANG KASIH',
    islandLandmark: 'Pintu gerbang istana ajaib',
    shortDesc: 'Pintu gerbang istana ajaib untuk mengenali rangkap sajak Guruku Pelita Hidup.',
    upcomingFocus: 'Mengenal hala tuju pembelajaran, objektif, kriteria kejayaan dan sajak Guruku Pelita Hidup.',
    icon: 'door',
    colorScheme: 'lavender',
    mapX: 17,
    mapY: 64,
  },
  {
    id: 2,
    code: 'Misi 2',
    title: 'BISIKAN HATI',
    islandLandmark: 'Taman bunga yang bercahaya',
    shortDesc: 'Taman bunga yang bercahaya untuk menghayati maksud setiap rangkap sajak.',
    upcomingFocus: 'Memadankan rangkap sajak dengan maksud yang tepat dan memilih nilai kasih sayang.',
    icon: 'heart',
    colorScheme: 'rose',
    mapX: 31,
    mapY: 43,
  },
  {
    id: 3,
    code: 'Misi 3',
    title: 'RAHSIA PELITA',
    islandLandmark: 'Perpustakaan ajaib dengan buku terapung',
    shortDesc: 'Perpustakaan ajaib dengan buku terapung bagi meneroka nada, jeda dan intonasi.',
    upcomingFocus: 'Mengenali tanda jeda, penekanan kata dan nada suara yang sesuai bagi setiap baris.',
    icon: 'flame',
    colorScheme: 'sky',
    mapX: 50,
    mapY: 22,
  },
  {
    id: 4,
    code: 'Misi 4',
    title: 'STUDIO SUARA HATI',
    islandLandmark: 'Menara mikrofon dan gelombang suara',
    shortDesc: 'Menara mikrofon dan gelombang suara untuk latihan sebutan jelas dan beremosi.',
    upcomingFocus: 'Latihan vokal berpandu, kawalan tempo dan penyampaian suara dengan sebutan baku.',
    icon: 'mic',
    colorScheme: 'violet',
    mapX: 65,
    mapY: 46,
  },
  {
    id: 5,
    code: 'Misi 5',
    title: 'PENTAS KASIH GURU',
    islandLandmark: 'Pentas persembahan fantasi',
    shortDesc: 'Pentas persembahan fantasi untuk mendeklamasikan sajak dengan penuh keyakinan.',
    upcomingFocus: 'Persembahan deklamasi penuh dengan gaya, mimik muka dan penghayatan kreatif.',
    icon: 'theater',
    colorScheme: 'amber',
    mapX: 84,
    mapY: 71,
  },
  {
    id: 6,
    code: 'Misi 6',
    title: 'CAHAYA PENGHARGAAN',
    islandLandmark: 'Istana pelita emas dan sijil penghargaan',
    shortDesc: 'Istana pelita emas dan sijil penghargaan untuk menyalakan semula cahaya kasih guru.',
    upcomingFocus: 'Refleksi kendiri, penambahbaikan persembahan dan kad ucapan penghargaan guru.',
    icon: 'sun',
    colorScheme: 'gold',
    mapX: 85,
    mapY: 20,
  },
];

export const MISSION1_INFO = {
  code: 'Misi 1',
  title: 'GERBANG KASIH',
  location: 'Pintu Gerbang Istana Ajaib',
  whereto: 'W – Where & Why',
  purpose:
    'Memperkenalkan hala tuju pembelajaran, objektif, kriteria kejayaan dan sajak Guruku Pelita Hidup.',
  welcomeDialog: [
    'Selamat datang, Wira Suara Hati!',
    'Pelita Kasih memerlukan bantuanmu. Untuk menghidupkan cahayanya, kamu perlu memahami keindahan sajak dan belajar mendeklamasikannya dengan penuh perasaan.',
    'Adakah kamu bersedia memulakan pengembaraan?',
  ],
  finalProduct: 'Video Deklamasi Sajak Guruku Pelita Hidup',
  successCriteria: [
    'Memahami maksud sajak.',
    'Menggunakan nada dan intonasi yang sesuai.',
    'Menyebut perkataan dengan jelas.',
    'Mendeklamasikan sajak dengan yakin dan penuh penghayatan.',
  ],
  completionLines: [
    'TAHNIAH, WIRA SUARA HATI!',
    'Kamu telah berjaya membuka Gerbang Kasih dan memperoleh Cahaya Pertama!',
    'Teruskan pengembaraan ke Misi 2: Bisikan Hati.',
  ],
};

export const GURUKU_PELITA_HIDUP_TITLE = 'GURUKU PELITA HIDUP';

export const GURUKU_PELITA_HIDUP_STANZAS: PoemStanza[] = [
  {
    number: 1,
    label: 'Rangkap 1',
    lines: [
      'Pagi menjelma membawa cahaya,',
      'Langkahku menuju gerbang sekolah,',
      'Guruku menyambut penuh mesra,',
      'Membuka pintu dunia ilmu.',
    ],
    illustrationType: 'morning-gate',
  },
  {
    number: 2,
    label: 'Rangkap 2',
    lines: [
      'Guruku ibarat pelita bercahaya,',
      'Menerangi jalan dalam kegelapan,',
      'Setiap nasihat menjadi panduan,',
      'Membimbing aku mengejar impian.',
    ],
    illustrationType: 'glowing-lantern',
  },
  {
    number: 3,
    label: 'Rangkap 3',
    lines: [
      'Walau penat tidak kau hiraukan,',
      'Sabar mengajar penuh keikhlasan,',
      'Saat aku jatuh dan kehilangan arah,',
      'Kau hulurkan semangat untuk melangkah.',
    ],
    illustrationType: 'heart-support',
  },
  {
    number: 4,
    label: 'Rangkap 4',
    lines: [
      'Wahai guru insan berjasa,',
      'Jasamu terpahat sepanjang masa,',
      'Akan kugenggam segala ilmu,',
      'Demi masa depan yang gemilang.',
    ],
    illustrationType: 'bright-future',
  },
];

export const MISSION1_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Apakah tajuk sajak yang akan dipelajari?',
    options: [
      { id: 'A', text: 'Guruku Pelita Hidup' },
      { id: 'B', text: 'Alam Kita' },
      { id: 'C', text: 'Sahabat Sejati' },
    ],
    correctAnswer: 'A',
    successFeedback:
      'Syabas! Tepat sekali — tajuk sajak utama pengembaraan kita ialah Guruku Pelita Hidup.',
    hint: 'Petunjuk: Cuba ingat semula tajuk sajak yang dipaparkan di bahagian atas skrol dalam Babak 3 tadi.',
  },
  {
    id: 2,
    question: 'Apakah tema utama sajak?',
    options: [
      { id: 'A', text: 'Persahabatan' },
      { id: 'B', text: 'Penghargaan terhadap jasa guru' },
      { id: 'C', text: 'Keindahan alam' },
    ],
    correctAnswer: 'B',
    successFeedback:
      'Hebat! Sajak ini mengangkat tema penghargaan terhadap pengorbanan dan jasa guru yang tidak ternilai.',
    hint: 'Petunjuk: Perhatikan rangkap yang menyebut guru membimbing dengan sabar, ikhlas dan berjasa sepanjang masa.',
  },
  {
    id: 3,
    question: 'Apakah produk akhir pengembaraan ini?',
    options: [
      { id: 'A', text: 'Poster makanan' },
      { id: 'B', text: 'Model bangunan' },
      { id: 'C', text: 'Video deklamasi sajak' },
    ],
    correctAnswer: 'C',
    successFeedback:
      'Cemerlang! Kamu akan menghasilkan Video Deklamasi Sajak Guruku Pelita Hidup di penghujung pengembaraan.',
    hint: 'Petunjuk: Semak semula matlamat akhir yang telah ditunjukkan dalam Babak 2 sebelum ini.',
  },
];

export const MISSION2_INFO = {
  code: 'Misi 2',
  title: 'BISIKAN HATI',
  location: 'Taman Bunga Bercahaya',
  purpose:
    'Menarik minat terhadap seni deklamasi melalui perbandingan suara dan mengenali perasaan dalam setiap rangkap sajak.',
  welcomeDialog: [
    'Selamat datang ke Taman Bisikan, Wira Suara Hati!',
    'Tahukah kamu bahawa setiap rangkap sajak mempunyai perasaan yang berbeza?',
    'Suara yang penuh penghayatan mampu menjadikan kata-kata lebih bermakna.',
    'Mari kita dengar, hayati dan kenali suara hati dalam sajak Guruku Pelita Hidup!',
  ],
  completionLines: [
    'TAHNIAH, WIRA SUARA HATI!',
    'Kamu berjaya mengenali perasaan dalam sajak dan memperoleh Cahaya Kedua!',
    'Teruskan pengembaraan ke Misi 3: Rahsia Pelita.',
  ],
};

export const MISSION2_STANZA2_TEXT = [
  'Guruku ibarat pelita bercahaya,',
  'Menerangi jalan dalam kegelapan,',
  'Setiap nasihat menjadi panduan,',
  'Membimbing aku mengejar impian.',
];

export const MISSION2_AUDIO_COMPARE = {
  question: 'Antara kedua-dua bacaan, yang manakah lebih sesuai untuk mendeklamasikan sajak?',
  options: [
    { id: 'A' as const, label: 'Bacaan A', detail: 'Bacaan mendatar tanpa perubahan nada yang ketara.' },
    { id: 'B' as const, label: 'Bacaan B', detail: 'Bacaan dengan nada kagum, penuh harapan dan intonasi yang sesuai.' },
  ],
  correctAnswer: 'B' as const,
  successFeedback:
    'Bacaan B lebih sesuai kerana nada dan intonasinya membantu pendengar menghayati maksud sajak.',
  hint: 'Petunjuk: Dengar semula perbezaan antara suara yang mendatar (A) dengan suara yang bernada kagum serta penuh harapan (B).',
};

// Susunan dipaparkan dalam urutan bercampur supaya murid berfikir sebelum memadankan
export const MISSION2_EMOTION_CHOICES: EmotionChoice[] = [
  {
    id: 'emosi-2',
    stanzaNumber: 2,
    label: 'Kagum dan penuh harapan.',
    iconKey: 'sparkles',
    colorScheme: 'sky',
    explanation:
      'Tepat! Rangkap 2 mengagumi peranan guru sebagai pelita yang menyuluh jalan dan memberi harapan untuk mengejar impian.',
    hint: 'Petunjuk: Perasaan ini sesuai dengan rangkap yang membandingkan guru dengan pelita bercahaya.',
  },
  {
    id: 'emosi-4',
    stanzaNumber: 4,
    label: 'Bangga, berterima kasih dan bersemangat.',
    iconKey: 'flame',
    colorScheme: 'violet',
    explanation:
      'Hebat! Rangkap 4 menunjukkan tekad dan semangat murid untuk menggenggam ilmu sebagai tanda terima kasih kepada guru.',
    hint: 'Petunjuk: Perasaan ini sesuai dengan rangkap yang berjanji menggenggam ilmu demi masa depan gemilang.',
  },
  {
    id: 'emosi-1',
    stanzaNumber: 1,
    label: 'Gembira dan bersyukur.',
    iconKey: 'smile',
    colorScheme: 'amber',
    explanation:
      'Syabas! Rangkap 1 menggambarkan pagi yang ceria ketika murid melangkah ke sekolah dan disambut mesra oleh guru.',
    hint: 'Petunjuk: Perasaan ini sesuai dengan suasana pagi yang ceria di gerbang sekolah.',
  },
  {
    id: 'emosi-3',
    stanzaNumber: 3,
    label: 'Terharu dan menghargai.',
    iconKey: 'heart',
    colorScheme: 'rose',
    explanation:
      'Betul! Rangkap 3 menyentuh hati kerana guru sanggup mengetepikan rasa penat dan sentiasa memberi semangat.',
    hint: 'Petunjuk: Perasaan ini sesuai dengan rangkap yang menceritakan kesabaran guru walau penat.',
  },
];

export const MISSION2_REFLECTION_QUESTIONS = [
  {
    id: 1,
    question: 'Mengapakah guru diibaratkan sebagai pelita?',
    placeholder: 'Tulis jawapan ringkas kamu di sini... (Contoh: Kerana guru menyinari hidup dengan ilmu...)',
  },
  {
    id: 2,
    question: 'Apakah perasaan kamu apabila mengenangkan jasa guru?',
    placeholder: 'Kongsi perasaan kamu terhadap guru...',
  },
  {
    id: 3,
    question: 'Bagaimanakah nada suara membantu pendengar memahami maksud sajak?',
    placeholder: 'Terangkan bagaimana nada suara membantu pendengar...',
  },
];

export const MISSION3_INFO = {
  code: 'Misi 3',
  title: 'RAHSIA PELITA',
  location: 'Perpustakaan Ajaib dengan Buku Terapung',
  purpose:
    'Menyatakan maksud rangkap sajak dengan tepat, mengenal pasti ungkapan kiasan dan menghubungkan mesej sajak dengan amalan menghargai guru.',
  objectives: [
    'Menyatakan maksud sekurang-kurangnya tiga daripada empat rangkap sajak dengan tepat.',
    'Mengenal pasti maksud ungkapan kiasan dalam sajak.',
    'Menghubungkan mesej sajak dengan amalan menghargai guru.',
  ],
  welcomeDialog: [
    'Hebat, Wira Suara Hati!',
    'Kamu telah berjaya memperoleh dua cahaya pelita.',
    'Kini, empat buku ajaib sedang menantimu di Perpustakaan Rahsia Pelita.',
    'Setiap buku menyimpan maksud dan pengajaran daripada sajak Guruku Pelita Hidup.',
    'Bolehkah kamu membongkar semua rahsia untuk memperoleh Cahaya Ketiga?',
  ],
  criticalQuestion:
    'Jika kamu ingin membalas jasa guru, apakah satu tindakan yang boleh kamu lakukan? Jelaskan sebabnya.',
  completionLines: [
    'TAHNIAH, WIRA SUARA HATI!',
    'Kamu telah berjaya membongkar rahsia empat rangkap sajak Guruku Pelita Hidup!',
    'Cahaya Ketiga kini menjadi milikmu!',
    'Teruskan pengembaraan ke Misi 4: Studio Suara Hati.',
  ],
};

export const MISSION3_MAGIC_BOOKS: MagicBookItem[] = [
  {
    id: 1,
    bookTitle: 'BUKU 1 – CAHAYA PERTAMA',
    stanzaLabel: 'Rangkap 1',
    lines: [
      'Pagi menjelma membawa cahaya,',
      'Langkahku menuju gerbang sekolah,',
      'Guruku menyambut penuh mesra,',
      'Membuka pintu dunia ilmu.',
    ],
    meaning:
      'Penyajak menggambarkan suasana pergi ke sekolah dan guru yang menyambut murid dengan mesra serta memberikan peluang untuk menimba ilmu.',
    value: 'Kasih sayang dan menghargai ilmu.',
    briefNote:
      'Ungkapan "membuka pintu dunia ilmu" bermaksud memberi peluang kepada murid memperoleh pengetahuan baharu.',
    colorScheme: 'lavender',
  },
  {
    id: 2,
    bookTitle: 'BUKU 2 – PELITA HARAPAN',
    stanzaLabel: 'Rangkap 2',
    lines: [
      'Guruku ibarat pelita bercahaya,',
      'Menerangi jalan dalam kegelapan,',
      'Setiap nasihat menjadi panduan,',
      'Membimbing aku mengejar impian.',
    ],
    meaning:
      'Guru diibaratkan sebagai pelita yang memberikan ilmu, nasihat dan bimbingan untuk membantu murid mencapai cita-cita.',
    value: 'Menghormati guru dan menghargai bimbingan.',
    briefNote:
      'Kiasan "pelita bercahaya" melambangkan ilmu dan tunjuk ajar guru yang memandu kehidupan murid.',
    colorScheme: 'sky',
  },
  {
    id: 3,
    bookTitle: 'BUKU 3 – PENGORBANAN GURU',
    stanzaLabel: 'Rangkap 3',
    lines: [
      'Walau penat tidak kau hiraukan,',
      'Sabar mengajar penuh keikhlasan,',
      'Saat aku jatuh dan kehilangan arah,',
      'Kau hulurkan semangat untuk melangkah.',
    ],
    meaning:
      'Guru tetap sabar dan ikhlas mendidik walaupun menghadapi keletihan serta sentiasa memberikan semangat apabila murid menghadapi kesukaran.',
    value: 'Kesabaran, keikhlasan dan kegigihan.',
    briefNote:
      'Rangkap ini menyerlahkan ketabahan guru yang sentiasa menyokong murid bangkit ketika berdepan cabaran.',
    colorScheme: 'rose',
  },
  {
    id: 4,
    bookTitle: 'BUKU 4 – JANJI SEORANG MURID',
    stanzaLabel: 'Rangkap 4',
    lines: [
      'Wahai guru insan berjasa,',
      'Jasamu terpahat sepanjang masa,',
      'Akan kugenggam segala ilmu,',
      'Demi masa depan yang gemilang.',
    ],
    meaning:
      'Penyajak berterima kasih kepada guru dan berazam menggunakan ilmu yang dipelajari untuk mencapai kejayaan pada masa hadapan.',
    value: 'Kesyukuran, mengenang jasa dan berusaha mencapai kejayaan.',
    briefNote:
      'Menggenggam ilmu dan bersungguh-sungguh belajar ialah cara terbaik membalas jasa guru.',
    colorScheme: 'mint',
  },
];

export const MISSION3_MEANING_MATCHES: MeaningMatchItem[] = [
  {
    id: 'makna-1',
    stanzaNumber: 1,
    meaningText: 'Guru menyambut murid dengan mesra dan membuka peluang menimba ilmu.',
    hint: 'Petunjuk: Cari rangkap yang menceritakan suasana pagi menuju ke gerbang sekolah.',
  },
  {
    id: 'makna-2',
    stanzaNumber: 2,
    meaningText: 'Guru membimbing murid melalui ilmu dan nasihat untuk mencapai impian.',
    hint: 'Petunjuk: Cari rangkap yang menyebut guru ibarat pelita bercahaya dan memberi panduan.',
  },
  {
    id: 'makna-3',
    stanzaNumber: 3,
    meaningText: 'Guru sabar, ikhlas dan memberikan semangat kepada murid.',
    hint: 'Petunjuk: Cari rangkap yang menyebut guru tidak menghiraukan rasa penat dan menghulurkan semangat.',
  },
  {
    id: 'makna-4',
    stanzaNumber: 4,
    meaningText: 'Murid menghargai jasa guru dan berazam mencapai kejayaan.',
    hint: 'Petunjuk: Cari rangkap terakhir yang berjanji menggenggam segala ilmu demi masa depan gemilang.',
  },
];

export const MISSION3_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Apakah maksud guru diibaratkan sebagai pelita?',
    options: [
      { id: 'A', text: 'Guru memberikan cahaya lampu.' },
      { id: 'B', text: 'Guru memberikan ilmu dan panduan dalam kehidupan.' },
      { id: 'C', text: 'Guru membina pelita untuk murid.' },
    ],
    correctAnswer: 'B',
    successFeedback:
      'Tepat sekali! Pelita melambangkan ilmu dan bimbingan guru yang menerangi jalan hidup murid.',
    hint: 'Petunjuk: Fikirkan makna kiasan pelita yang "menerangi jalan dalam kegelapan" melalui ilmu dan nasihat.',
  },
  {
    id: 2,
    question: 'Apakah nilai utama yang ditonjolkan dalam rangkap ketiga?',
    options: [
      { id: 'A', text: 'Kesabaran dan keikhlasan.' },
      { id: 'B', text: 'Keberanian berlawan.' },
      { id: 'C', text: 'Sikap mementingkan diri.' },
    ],
    correctAnswer: 'A',
    successFeedback:
      'Syabas! Rangkap ketiga jelas menyebut guru "sabar mengajar penuh keikhlasan" walaupun penat.',
    hint: 'Petunjuk: Imbas kembali baris kedua dalam Rangkap 3 (Buku 3 – Pengorbanan Guru).',
  },
  {
    id: 3,
    question: 'Apakah maksud ungkapan "membuka pintu dunia ilmu"?',
    options: [
      { id: 'A', text: 'Membuka pintu kelas.' },
      { id: 'B', text: 'Memberikan peluang untuk memperoleh pengetahuan.' },
      { id: 'C', text: 'Membina perpustakaan baharu.' },
    ],
    correctAnswer: 'B',
    successFeedback:
      'Betul! Ungkapan kiasan ini bermaksud guru memberi peluang kepada murid meneroka pelbagai pengetahuan.',
    hint: 'Petunjuk: Ini adalah ungkapan kiasan, bukan sekadar membuka pintu fizikal.',
  },
  {
    id: 4,
    question: 'Mengapakah penyajak berazam untuk menggenggam segala ilmu?',
    options: [
      { id: 'A', text: 'Untuk melupakan guru.' },
      { id: 'B', text: 'Untuk bersaing dengan rakan.' },
      { id: 'C', text: 'Untuk mencapai masa depan yang gemilang.' },
    ],
    correctAnswer: 'C',
    successFeedback:
      'Hebat! Penyajak berazam mengamalkan ilmu yang dipelajari demi masa depan yang gemilang.',
    hint: 'Petunjuk: Lihat baris terakhir dalam Rangkap 4 (Buku 4 – Janji Seorang Murid).',
  },
  {
    id: 5,
    question: 'Apakah tindakan terbaik untuk menghargai jasa guru?',
    options: [
      { id: 'A', text: 'Mengabaikan nasihat guru.' },
      { id: 'B', text: 'Belajar bersungguh-sungguh dan mengamalkan ilmu.' },
      { id: 'C', text: 'Tidak menyiapkan tugasan.' },
    ],
    correctAnswer: 'B',
    successFeedback:
      'Cemerlang! Menghargai guru dibuktikan melalui kesungguhan belajar dan mengamalkan ilmu dengan baik.',
    hint: 'Petunjuk: Pilih amalan positif yang menggambarkan janji seorang murid dalam Rangkap 4.',
  },
];

export const MISSION4_INFO = {
  code: 'Misi 4',
  title: 'STUDIO SUARA HATI',
  location: 'Menara Mikrofon Ajaib',
  purpose:
    'Mengaplikasikan teknik deklamasi yang betul, menghasilkan rakaman awal, menilai kekuatan serta kelemahan persembahan dan membuat rakaman penambahbaikan.',
  welcomeDialog: [
    'Selamat datang ke Menara Mikrofon Ajaib, Wira Suara Hati!',
    'Kamu sudah memahami maksud dan perasaan di sebalik sajak Guruku Pelita Hidup.',
    'Kini tiba masanya suara kamu bersinar! Sebelum merakam deklamasi, mari kita pelajari lima teknik emas di Akademi Suara Ajaib.',
    'Selepas rakaman pertama, kamu akan mendengar semula suaramu, menilai dengan jujur di Cermin Refleksi, dan menghasilkan rakaman penambahbaikan yang lebih mantap!',
  ],
  objectives: [
    'Mengaplikasikan teknik deklamasi yang betul (nada, intonasi, sebutan, jeda dan ekspresi).',
    'Menghasilkan rakaman awal deklamasi sajak Guruku Pelita Hidup.',
    'Menilai kekuatan dan kelemahan persembahan diri serta mencatat cadangan penambahbaikan.',
    'Menghasilkan rakaman kedua yang lebih baik berdasarkan refleksi diri.',
  ],
  completionLines: [
    'TAHNIAH, WIRA SUARA HATI!',
    'Kamu telah berani merakam, menilai diri dengan jujur dan menambah baik deklamasi sajakmu!',
    'Cahaya Keempat kini menjadi milikmu!',
    'Teruskan pengembaraan ke Misi 5: Pentas Kasih Guru.',
  ],
};

export const MISSION4_TECHNIQUE_CARDS: TechniqueCardItem[] = [
  {
    id: 1,
    code: 'KAD 1 – NADA',
    title: 'Nada Suara Mengikut Perasaan',
    summary:
      'Nada ialah corak perasaan suara ketika mendeklamasikan sajak. Tukar nada suara supaya sepadan dengan suasana setiap rangkap.',
    exampleTip:
      'Contoh: Gunakan nada gembira dan mesra pada Rangkap 1, nada kagum pada Rangkap 2, lembut dan terharu pada Rangkap 3, serta bersemangat pada Rangkap 4.',
    iconKey: 'music',
    colorScheme: 'lavender',
  },
  {
    id: 2,
    code: 'KAD 2 – INTONASI',
    title: 'Turun Naik Suara yang Hidup',
    summary:
      'Intonasi ialah alunan tinggi dan rendah suara semasa menyebut baris sajak agar penyampaian tidak mendatar atau membosankan.',
    exampleTip:
      'Contoh: Naikkan sedikit suara pada kata penting seperti "pelita bercahaya" dan turunkan nada dengan lembut di akhir rangkap.',
    iconKey: 'sparkles',
    colorScheme: 'sky',
  },
  {
    id: 3,
    code: 'KAD 3 – SEBUTAN',
    title: 'Sebutan Jelas & Bahasa Baku',
    summary:
      'Setiap huruf vokal dan konsonan perlu disebut dengan terang, tepat dan tidak terlalu laju supaya pendengar mudah memahami kata-kata sajak.',
    exampleTip:
      'Contoh: Sebut perkataan seperti "menjelma", "kegelapan", "keikhlasan" dan "gemilang" dengan jelas hingga ke hujung suku kata.',
    iconKey: 'mic',
    colorScheme: 'rose',
  },
  {
    id: 4,
    code: 'KAD 4 – JEDA',
    title: 'Hentian Seketika yang Tepat',
    summary:
      'Jeda ialah hentian pendek di pertengahan atau hujung baris untuk mengambil nafas dan memberi ruang pendengar meresap makna sajak.',
    exampleTip:
      'Contoh: Berhenti seketika selepas tanda koma (,) dan tarik nafas dengan tenang sebelum memulakan rangkap baharu.',
    iconKey: 'pause',
    colorScheme: 'amber',
  },
  {
    id: 5,
    code: 'KAD 5 – EKSPRESI',
    title: 'Penghayatan Jiwa & Mimik Wajah',
    summary:
      'Ekspresi memancarkan keikhlasan hati melalui riak wajah, pandangan mata dan gerakan tangan yang lembut serta bersahaja.',
    exampleTip:
      'Contoh: Senyum manis ketika menyebut "Guruku menyambut penuh mesra" dan letakkan tangan di dada ketika menghayati pengorbanan guru.',
    iconKey: 'heart',
    colorScheme: 'mint',
  },
];

export const MISSION4_STANZA_PRACTICE: StanzaPracticeItem[] = [
  {
    number: 1,
    label: 'Rangkap 1',
    lines: [
      'Pagi menjelma membawa cahaya,',
      'Langkahku menuju gerbang sekolah,',
      'Guruku menyambut penuh mesra,',
      'Membuka pintu dunia ilmu.',
    ],
    recommendedTone: 'Nada ceria, mesra dan penuh rasa syukur',
    pauseHint: 'Jeda pendek di hujung setiap baris (tanda koma), hentian penuh selepas "ilmu."',
    expressionTip:
      'Mulakan dengan senyuman manis dan suara yang terang bagi menggambarkan suasana pagi yang indah.',
  },
  {
    number: 2,
    label: 'Rangkap 2',
    lines: [
      'Guruku ibarat pelita bercahaya,',
      'Menerangi jalan dalam kegelapan,',
      'Setiap nasihat menjadi panduan,',
      'Membimbing aku mengejar impian.',
    ],
    recommendedTone: 'Nada kagum, hormat dan penuh harapan',
    pauseHint: 'Berhenti sejenak selepas "pelita bercahaya," dan tekankan kata "panduan" serta "impian".',
    expressionTip:
      'Naikkan intonasi sedikit pada ungkapan "pelita bercahaya" dan bayangkan cahaya ilmu menerangi masa depan.',
  },
  {
    number: 3,
    label: 'Rangkap 3',
    lines: [
      'Walau penat tidak kau hiraukan,',
      'Sabar mengajar penuh keikhlasan,',
      'Saat aku jatuh dan kehilangan arah,',
      'Kau hulurkan semangat untuk melangkah.',
    ],
    recommendedTone: 'Nada lembut, syahdu, terharu dan menghargai',
    pauseHint: 'Perlahankan sedikit tempo pada baris ketiga, berhenti sekejap sebelum baris keempat.',
    expressionTip:
      'Lembutkan suara untuk menunjukkan rasa terharu atas kesabaran guru, kemudian kuatkan sedikit semangat pada "melangkah".',
  },
  {
    number: 4,
    label: 'Rangkap 4',
    lines: [
      'Wahai guru insan berjasa,',
      'Jasamu terpahat sepanjang masa,',
      'Akan kugenggam segala ilmu,',
      'Demi masa depan yang gemilang.',
    ],
    recommendedTone: 'Nada bangga, berterima kasih dan bertekad tinggi',
    pauseHint: 'Tekankan "Wahai guru / insan berjasa," dan tutup baris akhir dengan nada yang yakin dan mantap.',
    expressionTip:
      'Tegakkan postur badan, sebut baris terakhir dengan lantang, jelas dan penuh azam seorang murid cemerlang.',
  },
];

export const MISSION4_ASSESSMENT_ASPECTS: SelfAssessmentAspect[] = [
  {
    id: '1',
    number: 1,
    label: 'Sebutan jelas',
    description: 'Setiap perkataan dan suku kata disebut dengan terang serta bahasa baku yang tepat.',
  },
  {
    id: '2',
    number: 2,
    label: 'Nada sesuai',
    description: 'Nada suara berubah mengikut perasaan setiap rangkap (ceria, kagum, terharu, bersemangat).',
  },
  {
    id: '3',
    number: 3,
    label: 'Intonasi menarik',
    description: 'Alunan tinggi dan rendah suara kedengaran hidup, tidak mendatar dan menyeronokkan.',
  },
  {
    id: '4',
    number: 4,
    label: 'Jeda sesuai',
    description: 'Hentian seketika dilakukan pada tanda koma dan akhir baris untuk nafas serta penekanan makna.',
  },
  {
    id: '5',
    number: 5,
    label: 'Ekspresi dan penghayatan',
    description: 'Suara kedengaran tulus dari hati dan mampu menyampaikan rasa kasih sayang terhadap guru.',
  },
];

export const MISSION4_RATING_SCALE = [
  { value: 1, label: '1 – Perlu Bimbingan', shortLabel: '1 · Perlu Bimbingan' },
  { value: 2, label: '2 – Memuaskan', shortLabel: '2 · Memuaskan' },
  { value: 3, label: '3 – Baik', shortLabel: '3 · Baik' },
  { value: 4, label: '4 – Cemerlang', shortLabel: '4 · Cemerlang' },
] as const;

export const MISSION5_INFO = {
  code: 'Misi 5',
  title: 'PENTAS KASIH GURU',
  location: 'Pentas Persembahan Fantasi',
  purpose:
    'Mendeklamasikan empat rangkap sajak dengan sebutan, nada dan intonasi yang sesuai, menghasilkan persembahan akhir audio atau video, menilai persembahan serta menjelaskan maksud sajak.',
  welcomeDialog: [
    'Selamat datang ke Pentas Kasih Guru, Wira Suara Hati!',
    'Kamu telah berjaya mengumpulkan empat cahaya pelita.',
    'Kini tiba masanya untuk mempersembahkan sajak Guruku Pelita Hidup dengan penuh keyakinan!',
    'Gunakan ilmu, latihan dan pengalaman daripada misi terdahulu.',
    'Ingat, persembahan yang hebat bukan hanya tentang suara yang kuat, tetapi juga tentang penghayatan yang menyentuh hati!',
  ],
  successCriteria: [
    'Sebutan jelas dan lancar.',
    'Nada sesuai dengan maksud rangkap.',
    'Intonasi dan jeda berkesan.',
    'Ekspresi menunjukkan penghayatan.',
    'Persembahan yakin dan kreatif.',
  ],
  completionLines: [
    'TAHNIAH, WIRA SUARA HATI!',
    'Kamu telah berjaya mempersembahkan sajak Guruku Pelita Hidup dengan penuh keberanian dan penghayatan!',
    'Setiap usaha dan latihan telah membawa kamu ke pentas kejayaan.',
    'Cahaya Kelima kini menjadi milikmu!',
  ],
};

export const MISSION5_STYLES: PerformanceStyleOption[] = [
  {
    id: 'klasik',
    code: 'A',
    title: 'Deklamasi Klasik',
    summary: 'Penekanan kepada suara, nada dan ekspresi.',
    guideTips: [
      'Berdiri atau duduk dengan postur tegak serta tenang sebelum memulakan baris pertama.',
      'Fokuskan kekuatan persembahan pada kejelasan sebutan bahasa baku, kawalan jeda dan turun naik intonasi.',
      'Gunakan nada ceria, kagum, terharu dan bersemangat mengikut perubahan empat rangkap.',
    ],
    colorScheme: 'lavender',
  },
  {
    id: 'kreatif',
    code: 'B',
    title: 'Deklamasi Kreatif',
    summary: 'Menggunakan gerak tangan, gaya dan latar yang sesuai.',
    guideTips: [
      'Padankan baris sajak dengan gerak tangan yang lembut dan mimik wajah yang tulus.',
      'Kamu boleh memilih ruang yang kemas atau meletakkan hiasan ringkas bertemakan penghargaan guru sebagai latar.',
      'Pastikan gaya gerakan membantu menyampaikan maksud sajak dan tidak mengganggu kelancaran suara.',
    ],
    colorScheme: 'rose',
  },
  {
    id: 'multimedia',
    code: 'C',
    title: 'Deklamasi Multimedia',
    summary: 'Menggunakan rakaman video dengan visual sokongan yang sesuai.',
    guideTips: [
      'Rakam persembahan dalam bentuk video (atau muat naik video yang telah disunting dengan visual/muzik lembut).',
      'Pastikan pencahayaan terang ke wajah dan suara deklamasi tetap lebih jelas berbanding bunyi latar.',
      'Jika kamera tidak tersedia, kamu masih boleh memuat naik video yang dirakam melalui peranti lain atau memilih rakaman audio.',
    ],
    colorScheme: 'sky',
  },
];

export const MISSION5_CHECKLIST: Mission5ChecklistItem[] = [
  { id: 'c1', text: 'Saya telah memahami maksud empat rangkap.' },
  { id: 'c2', text: 'Saya telah berlatih sebutan dan intonasi.' },
  { id: 'c3', text: 'Saya tahu perasaan yang sesuai bagi setiap rangkap.' },
  { id: 'c4', text: 'Saya telah menyediakan tempat rakaman yang sesuai.' },
  { id: 'c5', text: 'Saya bersedia untuk membuat persembahan.' },
];

export const MISSION5_STANZA_EXPRESSION_GUIDES = [
  { stanzaNumber: 1, label: 'Rangkap 1', cue: 'Ceria dan mesra.' },
  { stanzaNumber: 2, label: 'Rangkap 2', cue: 'Kagum dan penuh harapan.' },
  { stanzaNumber: 3, label: 'Rangkap 3', cue: 'Terharu dan menghargai.' },
  { stanzaNumber: 4, label: 'Rangkap 4', cue: 'Yakin dan bersemangat.' },
] as const;

export const MISSION5_RUBRIC_ASPECTS: Mission5RubricAspect[] = [
  {
    id: '1',
    number: 1,
    label: 'Sebutan dan kelancaran',
    levelDescriptions: {
      1: 'Banyak perkataan kurang jelas dan bacaan kerap terhenti-henti.',
      2: 'Kebanyakan perkataan jelas tetapi masih ada beberapa keraguan atau tersangkut.',
      3: 'Sebutan jelas, lancar dan mudah difahami dari awal hingga akhir.',
      4: 'Sebutan sangat tepat, baku, terang serta amat lancar tanpa teragak-agak.',
    },
  },
  {
    id: '2',
    number: 2,
    label: 'Nada',
    levelDescriptions: {
      1: 'Nada suara mendatar dan belum membezakan suasana setiap rangkap.',
      2: 'Ada sedikit perubahan nada tetapi belum tekal pada semua rangkap.',
      3: 'Nada sesuai dengan perasaan ceria, kagum, terharu dan bersemangat.',
      4: 'Nada amat tepat, menyentuh hati dan bertukar dengan sangat semula jadi.',
    },
  },
  {
    id: '3',
    number: 3,
    label: 'Intonasi dan jeda',
    levelDescriptions: {
      1: 'Bacaan terlalu laju atau tiada hentian pada tempat yang sesuai.',
      2: 'Intonasi dan jeda digunakan pada beberapa baris namun perlu lebih teratur.',
      3: 'Turun naik suara menarik dan jeda diletakkan di tempat yang sesuai.',
      4: 'Alunan intonasi dan jeda sangat berkesan serta menghidupkan makna sajak.',
    },
  },
  {
    id: '4',
    number: 4,
    label: 'Ekspresi dan penghayatan',
    levelDescriptions: {
      1: 'Ekspresi belum menunjukkan penghayatan emosi sajak.',
      2: 'Penghayatan mula kelihatan pada sebahagian rangkap.',
      3: 'Ekspresi wajah dan suara jelas memancarkan rasa kasih dan hormat.',
      4: 'Penghayatan amat mendalam, tulus dan mampu menyentuh perasaan pendengar.',
    },
  },
  {
    id: '5',
    number: 5,
    label: 'Keyakinan dan kreativiti',
    levelDescriptions: {
      1: 'Kelihatan gementar dan kurang yakin sepanjang persembahan.',
      2: 'Berani membuat persembahan dengan keyakinan asas.',
      3: 'Yakin, tenang dan menggunakan gaya persembahan yang sesuai.',
      4: 'Sangat yakin, berkarisma serta kreatif menonjolkan gaya pilihan.',
    },
  },
];

export const MISSION5_REFLECTION_QUESTIONS = [
  {
    id: 'q1' as const,
    number: 1,
    question: 'Apakah peningkatan yang kamu rasai berbanding rakaman latihan dalam Misi 4?',
    placeholder:
      'Contoh: Suara saya kini lebih lancar, jeda saya lebih teratur dan saya lebih yakin menukar nada pada setiap rangkap.',
  },
  {
    id: 'q2' as const,
    number: 2,
    question: 'Apakah perasaan yang paling berjaya kamu sampaikan melalui deklamasi?',
    placeholder:
      'Contoh: Saya paling berjaya menyampaikan perasaan terharu dan berterima kasih kepada guru pada Rangkap 3 dan 4.',
  },
  {
    id: 'q3' as const,
    number: 3,
    question: 'Apakah maksud atau pengajaran utama sajak Guruku Pelita Hidup?',
    placeholder:
      'Contoh: Sajak ini mengajar kita supaya sentiasa menghargai pengorbanan guru yang membimbing dengan sabar dan ikhlas serta berusaha menimba ilmu.',
  },
];

export const MISSION6_INFO = {
  code: 'Misi 6',
  title: 'CAHAYA PENGHARGAAN',
  location: 'Istana Pelita Emas',
  purpose:
    'Menjelaskan maksud serta pengajaran sajak, mengaplikasikan pengetahuan teknik deklamasi, menghasilkan kad ucapan penghargaan guru dan membuat refleksi keseluruhan pengembaraan.',
  objectives: [
    'Menjelaskan maksud dan pengajaran sajak dengan tepat.',
    'Mengaplikasikan pengetahuan tentang teknik deklamasi.',
    'Menghasilkan mesej penghargaan yang bermakna kepada guru.',
    'Membuat refleksi terhadap perkembangan pembelajaran.',
  ],
  welcomeDialog: [
    'Selamat datang ke Istana Pelita Emas, Wira Suara Hati!',
    'Kamu telah berjaya menempuh lima misi dan mengumpulkan lima cahaya kasih.',
    'Kini hanya tinggal satu cahaya terakhir!',
    'Untuk melengkapkan pengembaraan, kamu perlu membuktikan kefahaman tentang sajak, menyampaikan penghargaan kepada guru dan merenung kembali perjalanan pembelajaranmu.',
    'Bersediakah kamu menjadi Wira Pelita Kasih?',
  ],
  letterIntro: [
    'Setiap guru telah menyumbangkan ilmu, masa dan kasih sayang kepada muridnya.',
    'Kini giliran kamu menyampaikan penghargaan.',
    'Tuliskan ucapan yang ikhlas kepada seorang guru yang kamu hargai.',
  ],
  letterGuides: [
    'Nyatakan perkara yang kamu hargai tentang guru.',
    'Ceritakan satu pengalaman atau nasihat yang bermakna.',
    'Akhiri dengan ucapan terima kasih atau harapan.',
  ],
  ceremonyLines: [
    'TAHNIAH, WIRA SUARA HATI!',
    'Kamu telah berjaya menamatkan keenam-enam misi dalam pengembaraan Suara Hati: Jejak Kasih Guru!',
    'Kamu telah mempelajari keindahan sajak, memahami maksudnya, menguasai teknik deklamasi dan mempersembahkan sajak dengan penuh penghayatan.',
    'Semoga cahaya ilmu dan kasih guru terus menerangi perjalanan hidupmu.',
    'CAHAYA KEENAM KINI MENJADI MILIKMU!',
  ],
};

export const MISSION6_QUIZ_QUESTIONS: Quiz4Question[] = [
  {
    id: 1,
    question: 'Apakah maksud ungkapan "membuka pintu dunia ilmu"?',
    options: [
      { id: 'A', text: 'Membuka pintu kelas setiap pagi.' },
      { id: 'B', text: 'Memberikan peluang untuk memperoleh pengetahuan.' },
      { id: 'C', text: 'Membina pintu sekolah yang baharu.' },
      { id: 'D', text: 'Menyimpan buku di dalam bilik.' },
    ],
    correctAnswer: 'B',
    successFeedback:
      'Betul! Ungkapan kiasan ini bermaksud guru membuka peluang kepada murid meneroka dan memperoleh pelbagai ilmu pengetahuan.',
    hint: 'Petunjuk pembelajaran: Fikirkan makna kiasan "dunia ilmu" — bukan pintu fizikal, tetapi peluang belajar dan mengetahui perkara baharu.',
  },
  {
    id: 2,
    question: 'Apakah maksud guru diibaratkan sebagai pelita bercahaya?',
    options: [
      { id: 'A', text: 'Guru membawa lampu ke sekolah.' },
      { id: 'B', text: 'Guru suka menghias kelas.' },
      { id: 'C', text: 'Guru memberikan panduan dan ilmu dalam kehidupan.' },
      { id: 'D', text: 'Guru bekerja pada waktu malam.' },
    ],
    correctAnswer: 'C',
    successFeedback:
      'Tepat sekali! Seperti pelita yang menerangi kegelapan, guru membimbing murid dengan ilmu dan nasihat berguna.',
    hint: 'Petunjuk pembelajaran: Imbas Rangkap 2 yang menyatakan "Setiap nasihat menjadi panduan, Membimbing aku mengejar impian."',
  },
  {
    id: 3,
    question: 'Nilai murni yang paling jelas dalam rangkap ketiga ialah...',
    options: [
      { id: 'A', text: 'Kesabaran dan keikhlasan.' },
      { id: 'B', text: 'Keberanian dan persaingan.' },
      { id: 'C', text: 'Kemewahan dan kebanggaan.' },
      { id: 'D', text: 'Kepantasan dan ketangkasan.' },
    ],
    correctAnswer: 'A',
    successFeedback:
      'Syabas! Rangkap 3 jelas menonjolkan guru yang tetap sabar dan ikhlas mendidik walaupun berasa penat.',
    hint: 'Petunjuk pembelajaran: Ingat baris "Walau penat tidak kau hiraukan, Sabar mengajar penuh keikhlasan."',
  },
  {
    id: 4,
    question: 'Apakah nada yang sesuai untuk mendeklamasikan rangkap ketiga?',
    options: [
      { id: 'A', text: 'Marah dan kasar.' },
      { id: 'B', text: 'Lucu dan mengejek.' },
      { id: 'C', text: 'Terharu dan menghargai.' },
      { id: 'D', text: 'Takut dan cemas.' },
    ],
    correctAnswer: 'C',
    successFeedback:
      'Cemerlang! Nada lembut, terharu dan menghargai sangat sesuai untuk menggambarkan pengorbanan guru.',
    hint: 'Petunjuk pembelajaran: Rangkap ketiga bercerita tentang guru yang menghulurkan semangat ketika kita jatuh — apakah perasaan yang paling sesuai?',
  },
  {
    id: 5,
    question: 'Mengapakah intonasi dan jeda penting semasa mendeklamasikan sajak?',
    options: [
      { id: 'A', text: 'Supaya sajak dapat dibaca dengan sangat laju.' },
      { id: 'B', text: 'Supaya pendengar dapat memahami maksud dan menghayati perasaan.' },
      { id: 'C', text: 'Supaya semua perkataan disebut dengan nada yang sama.' },
      { id: 'D', text: 'Supaya murid tidak perlu memahami sajak.' },
    ],
    correctAnswer: 'B',
    successFeedback:
      'Hebat! Turun naik suara (intonasi) dan hentian seketika (jeda) membantu pendengar meresap makna serta emosi sajak.',
    hint: 'Petunjuk pembelajaran: Dalam Misi 2 dan Misi 4, kita belajar bahawa suara yang mendatar sukar menyentuh perasaan pendengar.',
  },
  {
    id: 6,
    question: 'Apakah pengajaran utama sajak Guruku Pelita Hidup?',
    options: [
      { id: 'A', text: 'Kita perlu belajar tanpa mendengar nasihat.' },
      { id: 'B', text: 'Kita hanya perlu menghargai guru ketika peperiksaan.' },
      { id: 'C', text: 'Kita perlu menghargai jasa guru dan menggunakan ilmu dengan baik.' },
      { id: 'D', text: 'Kita perlu menghafal sajak tanpa memahami maksudnya.' },
    ],
    correctAnswer: 'C',
    successFeedback:
      'Tahniah! Sajak ini mengajar kita menghargai pengorbanan guru sepanjang masa dan menggenggam ilmu demi masa depan gemilang.',
    hint: 'Petunjuk pembelajaran: Lihat Rangkap 4 — "Jasamu terpahat sepanjang masa, Akan kugenggam segala ilmu."',
  },
];

export const MISSION6_REFLECTION_QUESTIONS = [
  {
    id: 'q1' as const,
    number: 1,
    question: 'Apakah perkara baharu yang kamu pelajari tentang sajak?',
    placeholder:
      'Contoh: Saya belajar bahawa setiap rangkap sajak mempunyai maksud, nilai murni dan perasaan tersendiri yang perlu dihayati.',
  },
  {
    id: 'q2' as const,
    number: 2,
    question:
      'Bagaimanakah kemahiran deklamasi kamu bertambah baik selepas latihan dan rakaman?',
    placeholder:
      'Contoh: Sebutan saya semakin jelas, saya tahu berhenti pada tempat jeda yang betul dan berani mempelbagaikan nada suara.',
  },
  {
    id: 'q3' as const,
    number: 3,
    question: 'Mengapakah kita perlu menghargai jasa guru?',
    placeholder:
      'Contoh: Kerana guru mendidik kita dengan sabar dan ikhlas serta membimbing kita mencapai cita-cita masa depan.',
  },
  {
    id: 'q4' as const,
    number: 4,
    question: 'Apakah kemahiran yang ingin kamu tingkatkan selepas ini?',
    placeholder:
      'Contoh: Saya ingin meningkatkan lagi keyakinan berdiri di atas pentas sekolah serta mempelbagaikan ekspresi wajah.',
  },
];

export const MISSION6_REFLECTION_CHECKLIST = [
  { id: 'r1', text: 'Saya memahami maksud sajak.' },
  { id: 'r2', text: 'Saya boleh memilih nada yang sesuai.' },
  { id: 'r3', text: 'Saya boleh menggunakan intonasi dan jeda.' },
  { id: 'r4', text: 'Saya berani mempersembahkan sajak.' },
  { id: 'r5', text: 'Saya menghargai jasa guru.' },
] as const;

export const MISSION6_CERTIFICATE_TEXT = {
  heading: 'SIJIL PENGHARGAAN',
  subheading: 'WIRA SUARA HATI',
  line1: 'Dengan ini diperakui bahawa',
  line2: 'telah berjaya menamatkan keenam-enam misi pembelajaran digital',
  programName: 'SUARA HATI: JEJAK KASIH GURU',
  line3:
    'serta menunjukkan usaha dalam memahami, menghayati dan mendeklamasikan sajak Guruku Pelita Hidup.',
};

export const DIFFERENTIATED_GLOSSARY: GlossaryWordItem[] = [
  {
    word: 'Menjelma',
    meaning: 'Muncul atau tiba (pagi yang mula menyingsing membawa cahaya baharu).',
    stanzaRef: 'Rangkap 1',
    toneExample: 'Nada ceria dan segar: sebut dengan senyuman ringan.',
  },
  {
    word: 'Pelita',
    meaning: 'Lampu yang menerangi kegelapan; kiasan bagi guru yang memberi ilmu dan panduan hidup.',
    stanzaRef: 'Rangkap 2',
    toneExample: 'Nada kagum dan hormat: perlahankan sedikit pada kata "pelita bercahaya".',
  },
  {
    word: 'Keikhlasan',
    meaning: 'Ketulusan hati tanpa mengharapkan balasan ketika mendidik murid.',
    stanzaRef: 'Rangkap 3',
    toneExample: 'Nada lembut dan terharu: lembutkan suara pada hujung kata.',
  },
  {
    word: 'Hulurkan',
    meaning: 'Memberikan bantuan, dorongan atau sokongan semangat ketika murid hampir berputus asa.',
    stanzaRef: 'Rangkap 3',
    toneExample: 'Nada menghargai: naikkan sedikit keyakinan pada "untuk melangkah".',
  },
  {
    word: 'Terpahat',
    meaning: 'Melekat kukuh dalam ingatan dan hati sepanjang masa, tidak mudah dilupakan.',
    stanzaRef: 'Rangkap 4',
    toneExample: 'Nada berterima kasih dan mantap: beri penekanan jelas pada kata "terpahat".',
  },
  {
    word: 'Kugenggam',
    meaning: 'Menjaga, menghargai dan mengamalkan segala ilmu yang diajar dengan bersungguh-sungguh.',
    stanzaRef: 'Rangkap 4',
    toneExample: 'Nada berazam tinggi: suara teguh dan yakin hingga akhir baris "gemilang".',
  },
];

export const DIFFERENTIATED_KBAT_QUESTIONS: KbatQuestionItem[] = [
  {
    id: 'k1',
    number: 1,
    focus: 'Mesej Tersirat',
    question:
      'Mengapakah penyajak mengibaratkan guru sebagai "pelita bercahaya" dan bukan sekadar pemberi nota pelajaran? Huraikan kaitan pelita dengan cabaran kehidupan seorang murid.',
    placeholder:
      'Contoh: Pelita bukan sahaja menerangi bilik darjah tetapi menunjuk arah dalam gelap; guru juga membimbing murid membuat pilihan baik dalam kehidupan.',
    modelIdea:
      'Panduan Idea KBAT: Pelita memberi cahaya ketika manusia keliru atau berada dalam kegelapan. Begitu juga guru yang bukan hanya menyampaikan fakta, malah membentuk adab, memberi nasihat dan memupuk keyakinan murid menghadapi cabaran hidup.',
  },
  {
    id: 'k2',
    number: 2,
    focus: 'Nilai & Pengajaran',
    question:
      'Pada pendapat kamu, bagaimanakah cara paling bermakna bagi seorang murid Tahun 5 membalas nilai kesabaran dan keikhlasan guru seperti dalam Rangkap 3 dan 4?',
    placeholder:
      'Contoh: Belajar dengan tekun, mendengar nasihat guru dengan hormat, membantu rakan dan mengamalkan akhlak mulia setiap hari.',
    modelIdea:
      'Panduan Idea KBAT: Balas jasa terbaik bukan sekadar ucapan pada Hari Guru, tetapi mengamalkan ilmu dengan amanah, menghormati guru sepanjang masa, tidak mudah berputus asa apabila gagal dan menjadi insan berguna.',
  },
  {
    id: 'k3',
    number: 3,
    focus: 'Penghayatan Deklamasi',
    question:
      'Mengapakah nada suara perlu berubah daripada ceria (Rangkap 1) kepada terharu (Rangkap 3) dan akhirnya bersemangat (Rangkap 4) semasa mendeklamasikan sajak ini?',
    placeholder:
      'Contoh: Supaya pendengar dapat merasakan perubahan emosi daripada suasana pagi yang gembira kepada pengorbanan guru dan azam murid.',
    modelIdea:
      'Panduan Idea KBAT: Perubahan nada mencerminkan perjalanan emosi sajak—bermula dengan harapan pagi (ceria), kekaguman terhadap ilmu (hormat), kesedaran tentang penat lelah guru (terharu), dan ikrar murid untuk berjaya (berazam tinggi).',
  },
];

export const APP_CREDITS_AND_SOURCES = [
  {
    category: 'Teks Sajak & Standard Kurikulum',
    items: [
      'Teks sajak utama: "Guruku Pelita Hidup" (bahan sastera Bahasa Melayu Tahun 5).',
      'Kurikulum rujukan: Dokumen Standard Kurikulum dan Pentaksiran (DSKP) Bahasa Melayu Sekolah Rendah Tahun 5 — Aspek Seni Bahasa, Standard Kandungan 4.2 dan Standard Pembelajaran 4.2.2.',
      'Rangka kerja pedagogi: Model Reka Bentuk Pembelajaran WHERETO dan peringkat SAMR (Modification).',
    ],
  },
  {
    category: 'Bahan Imej & Ilustrasi',
    items: [
      'Ilustrasi dunia fantasi enam pulau terapung, istana awan, watak murid & guru, lencana pelita, serta latar Misi 1 hingga Misi 6 ialah aset imej statik tempatan yang disertakan bersama projek aplikasi ini.',
      'Ikon antara muka pengguna disediakan melalui pustaka sumber terbuka Lucide React.',
    ],
  },
  {
    category: 'Bahan Audio & Kesan Bunyi',
    items: [
      'Muzik latar lembut, nada kejayaan misi, tepukan penghargaan, dan simulasi audio perbandingan Misi 2 dijana terus dalam pelayar melalui Web Audio API (tiada fail audio luar pihak ketiga).',
      'Rakaman suara latihan (Misi 4) dan audio persembahan (Misi 5) dirakam atau dimuat naik daripada peranti murid sendiri dan disimpan setempat dalam IndexedDB pelayar.',
    ],
  },
  {
    category: 'Bahan Video',
    items: [
      'Aplikasi ini tidak memaparkan atau menstrim video daripada mana-mana sumber luar pihak ketiga.',
      'Semua video persembahan dalam Misi 5 terhasil daripada rakaman kamera murid sendiri melalui peranti masing-masing atau fail video yang dimuat naik secara setempat oleh murid.',
    ],
  },
  {
    category: 'Teknologi Perisian & Ketelusan AI',
    items: [
      'Dibina menggunakan React 19, TypeScript, Vite, Tailwind CSS, Lucide React, dan jsPDF (penjanaan fail PDF Sijil Digital A4 Landskap di bahagian klien).',
      'Penstoran setempat: Web Storage (localStorage) dan IndexedDB pelayar. Tiada data murid, rakaman, atau skor dihantar kepada guru atau pelayan luar secara automatik.',
      'Ketelusan AI: Aplikasi ini tidak mempunyai panggilan AI masa nyata dan tidak memerlukan sebarang kunci API pengguna. Bantuan AI hanya digunakan semasa proses pembangunan kod dan penyediaan aset ilustrasi statik aplikasi.',
    ],
  },
] as const;

