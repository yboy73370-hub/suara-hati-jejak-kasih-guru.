import { jsPDF } from 'jspdf';
import { MISSION6_CERTIFICATE_TEXT } from '../data/gameData';

export interface PrintAttemptResult {
  status: 'opened' | 'blocked' | 'error';
  message?: string;
}

export interface PdfDownloadResult {
  ok: boolean;
  filename?: string;
  errorMessage?: string;
}

/**
 * Memanggil window.print() secara langsung dalam pengendali klik pengguna
 * tanpa setTimeout/useEffect/window.open/iframe, sambil mengesan sekiranya
 * persekitaran pratonton menyekat dialog cetakan.
 */
export function attemptDirectPrint(): PrintAttemptResult {
  if (typeof window === 'undefined' || typeof window.print !== 'function') {
    return {
      status: 'error',
      message:
        'Pelayar atau peranti ini tidak menyokong fungsi cetakan terus (window.print). Sila gunakan butang MUAT TURUN SIJIL SEBAGAI PDF.',
    };
  }

  let beforePrintFired = false;
  const onBeforePrint = () => {
    beforePrintFired = true;
  };

  window.addEventListener('beforeprint', onBeforePrint);
  const startedAt =
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    window.print();
  } catch {
    window.removeEventListener('beforeprint', onBeforePrint);
    return {
      status: 'error',
      message:
        'Cetakan terus gagal dibuka oleh pelayar. Sila gunakan butang MUAT TURUN SIJIL SEBAGAI PDF sebagai alternatif.',
    };
  }

  window.removeEventListener('beforeprint', onBeforePrint);
  const elapsed =
    (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
    startedAt;

  // Dalam iframe sandbox (seperti Preview Google AI Studio tanpa allow-modals),
  // window.print() diabaikan secara senyap: beforeprint tidak dicetuskan dan masa panggilan < 80ms.
  if (!beforePrintFired && elapsed < 80) {
    return {
      status: 'blocked',
      message:
        'Dialog cetakan pelayar disekat oleh persekitaran pratonton ini (iframe). Sila tekan butang MUAT TURUN SIJIL SEBAGAI PDF untuk mendapatkan fail PDF rasmi terus ke peranti anda, atau buka aplikasi dalam tab pelayar baharu untuk mencetak.',
    };
  }

  return { status: 'opened' };
}

function drawStar(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number
): void {
  const points: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const angle = (-Math.PI / 2) + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  doc.setFillColor(251, 191, 36);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.35);

  const lines: Array<[number, number]> = [];
  for (let i = 1; i < points.length; i++) {
    lines.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
  }
  doc.lines(lines, points[0][0], points[0][1], [1, 1], 'FD', true);
}

function drawLanternBadge(doc: jsPDF, x: number, y: number, size: number): void {
  // Kotak latar kuning lembut + bingkai emas
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, size, size, 2, 2, 'FD');

  // Badan pelita kecil & api emas di tengah
  const cx = x + size / 2;
  const cy = y + size / 2;
  doc.setFillColor(245, 158, 11);
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.35);
  doc.circle(cx, cy + 0.8, size * 0.24, 'FD');

  doc.setFillColor(254, 240, 138);
  doc.circle(cx, cy + 0.5, size * 0.13, 'F');
}

/**
 * Menjana dan memuat turun fail PDF Sijil Penghargaan A4 Landskap sebenar
 * di bahagian klien menggunakan jsPDF.
 */
export function downloadCertificatePdf(params: {
  studentName: string;
  issuedDate: string;
}): PdfDownloadResult {
  const cleanName = params.studentName.trim() || 'Wira Suara Hati';
  const cleanDate = params.issuedDate.trim() || new Date().toLocaleDateString('ms-MY');

  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageW = 297;
    const pageH = 210;

    // Latar halaman krim lembut
    doc.setFillColor(255, 253, 248);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Bingkai luar emas (#D97706)
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(2.6);
    doc.roundedRect(8, 8, pageW - 16, pageH - 16, 6, 6, 'S');

    // Bingkai dalam ungu diraja (#5B21B6) dengan isi lembut
    doc.setFillColor(255, 252, 244);
    doc.setDrawColor(91, 33, 182);
    doc.setLineWidth(1.0);
    doc.roundedRect(13, 13, pageW - 26, pageH - 26, 4.5, 4.5, 'FD');

    // Jalur aksen atas & bawah lembut
    doc.setFillColor(254, 243, 199);
    doc.rect(14.5, 14.5, pageW - 29, 3.2, 'F');
    doc.setFillColor(237, 233, 254);
    doc.rect(14.5, pageH - 17.7, pageW - 29, 3.2, 'F');

    // Empat bintang penjuru
    drawStar(doc, 22, 24, 3.6, 1.6);
    drawStar(doc, pageW - 22, 24, 3.6, 1.6);
    drawStar(doc, 22, pageH - 24, 3.6, 1.6);
    drawStar(doc, pageW - 22, pageH - 24, 3.6, 1.6);

    // Lencana Pelita Emas & Tajuk Kecil di Bahagian Atas
    drawLanternBadge(doc, 92, 21, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(157, 23, 77);
    doc.text('LENCANA WIRA SUARA HATI', 110, 26.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(91, 33, 182);
    doc.text('Bahasa Melayu Tahun 5 · Seni Bahasa (4.2.2)', 110, 32);

    // Tajuk Utama Sijil
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(76, 29, 149);
    doc.text(MISSION6_CERTIFICATE_TEXT.heading, pageW / 2, 51, {
      align: 'center',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(180, 83, 9);
    doc.text(MISSION6_CERTIFICATE_TEXT.subheading, pageW / 2, 60.5, {
      align: 'center',
    });

    // Garis pemisah hiasan emas
    doc.setDrawColor(253, 230, 138);
    doc.setLineWidth(0.7);
    doc.line(74, 65, pageW - 74, 65);

    // Teks Pengiktirafan & Nama Murid
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(59, 30, 109);
    doc.text(MISSION6_CERTIFICATE_TEXT.line1, pageW / 2, 76, {
      align: 'center',
    });

    // Nama Murid (auto-skala jika panjang)
    doc.setFont('helvetica', 'bold');
    let nameFontSize = 24;
    doc.setFontSize(nameFontSize);
    while (doc.getTextWidth(cleanName) > 195 && nameFontSize > 14) {
      nameFontSize -= 1;
      doc.setFontSize(nameFontSize);
    }
    doc.setTextColor(30, 16, 51);
    doc.text(cleanName, pageW / 2, 92, { align: 'center' });

    // Garis bawah nama murid (#D97706)
    const underlineWidth = Math.min(200, Math.max(115, doc.getTextWidth(cleanName) + 22));
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.95);
    doc.line(
      pageW / 2 - underlineWidth / 2,
      96,
      pageW / 2 + underlineWidth / 2,
      96
    );

    // Teks Pencapaian & Nama OPD
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(46, 22, 84);
    doc.text(MISSION6_CERTIFICATE_TEXT.line2, pageW / 2, 108, {
      align: 'center',
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17.5);
    doc.setTextColor(157, 23, 77);
    doc.text(MISSION6_CERTIFICATE_TEXT.programName, pageW / 2, 119, {
      align: 'center',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(59, 30, 109);
    const wrappedLine3 = doc.splitTextToSize(MISSION6_CERTIFICATE_TEXT.line3, 195);
    doc.text(wrappedLine3, pageW / 2, 130, { align: 'center' });

    // Garis pemisah bahagian bawah
    doc.setDrawColor(233, 213, 255);
    doc.setLineWidth(0.6);
    doc.line(24, 152, pageW - 24, 152);

    // Kiri Bawah: Tarikh Sijil
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(91, 62, 142);
    doc.text('TARIKH SIJIL', 26, 164);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(46, 22, 84);
    doc.text(cleanDate, 26, 172);

    // Tengah Bawah: Enam Simbol Pelita Bercahaya
    const lanternCount = 6;
    const lanternSize = 11.5;
    const lanternGap = 3.5;
    const totalLanternW =
      lanternCount * lanternSize + (lanternCount - 1) * lanternGap;
    const startLanternX = (pageW - totalLanternW) / 2;
    for (let i = 0; i < lanternCount; i++) {
      drawLanternBadge(
        doc,
        startLanternX + i * (lanternSize + lanternGap),
        160,
        lanternSize
      );
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text('ENAM CAHAYA PELITA LENGKAP', pageW / 2, 177.5, {
      align: 'center',
    });

    // Kanan Bawah: Istana Pelita Emas & 6 / 6 Misi Selesai
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(157, 23, 77);
    doc.text('ISTANA PELITA EMAS', pageW - 26, 164, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(76, 29, 149);
    doc.text('6 / 6 Misi Selesai', pageW - 26, 172, { align: 'right' });

    const safeSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
    const filename = `Sijil_Wira_Suara_Hati_${safeSlug || 'murid'}.pdf`;

    doc.save(filename);
    return { ok: true, filename };
  } catch (err) {
    return {
      ok: false,
      errorMessage:
        err instanceof Error && err.message
          ? `Gagal menjana fail PDF: ${err.message}`
          : 'Gagal menjana fail PDF sijil. Sila cuba lagi atau gunakan fungsi cetakan pelayar.',
    };
  }
}
