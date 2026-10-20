import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfReportParams {
  projectName?: string;
  buildingClass: string;
  structureType: string;
  facadeType: string;
  district: string;
  totalArea: number;
  floors: number;
  hasParking: boolean;
  ncsCost: number;
  dbCost: number;
  deltaRub: number;
  deltaPercent: string;
  matchedProjects: Array<{ name: string; costPerSqm: number; totalCost: number; district: string }>;
}

export function exportEstimatePdf(data: PdfReportParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [15, 40, 80]; // Глубокий сапфировый
  const slateColor: [number, number, number] = [100, 116, 139];

  // 1. Верхний колонтитул / Шапка организации
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 16, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NRU MGSU | INSTITUTE OF DIGITAL TECHNOLOGIES AND MODELING IN CIVIL ENGINEERING', 14, 10);

  // 2. Заголовок документа
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text('EXPRESS ESTIMATE REPORT', 14, 28);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateColor);
  doc.text(`Document ID: EST-${Date.now().toString().slice(-6)} | Date: ${new Date().toLocaleDateString('ru-RU')}`, 14, 34);

  // Линия-разделитель
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  // 3. Таблица входных проектных характеристик
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Project Parameters & Constraints', 14, 46);

  const formatMoney = (v: number) => new Intl.NumberFormat('ru-RU').format(v) + ' RUB';

  autoTable(doc, {
    startY: 50,
    theme: 'grid',
    head: [['Parameter', 'Selected Specification', 'Cost Implication']],
    body: [
      ['Project Name / Identifier', data.projectName || 'Residential Complex (Draft)', 'Custom Target'],
      ['Building Class', data.buildingClass.toUpperCase(), 'Class Base Normative'],
      ['Structural Scheme', data.structureType.toUpperCase(), 'Skeleton & Concrete Volume'],
      ['Facade System', data.facadeType.toUpperCase(), 'Exterior Envelope Coefficient'],
      ['Total Usable Area', `${data.totalArea.toLocaleString('ru-RU')} sq.m`, 'Scale Factor'],
      ['Floor Count', `${data.floors} floors`, 'Vertical Transport & Engineering'],
      ['Underground Levels', data.hasParking ? 'Present (Parking Included)' : 'None (Above ground only)', data.hasParking ? '+12% Workload' : '1.0'],
      ['District / Location', data.district, 'Regional Terr. Index (K-ter)'],
    ],
    headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // 4. Сравнительная сводная таблица стоимости
  const afterFirstTableY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Comparative Valuation Summary (Normative vs. Actual)', 14, afterFirstTableY);

  autoTable(doc, {
    startY: afterFirstTableY + 4,
    theme: 'grid',
    head: [['Valuation Methodology', 'Unit Rate (RUB/sq.m)', 'Total Construction Cost']],
    body: [
      ['State Standards (NCS 2026)', formatMoney(Math.round(data.ncsCost / data.totalArea)), formatMoney(data.ncsCost)],
      ['Analogues Market Database', formatMoney(Math.round(data.dbCost / data.totalArea)), formatMoney(data.dbCost)],
      ['Market Deviation (Delta)', `${data.deltaPercent}%`, formatMoney(data.deltaRub)],
    ],
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, fontStyle: 'bold', textColor: [15, 23, 42] },
    margin: { left: 14, right: 14 },
  });

  // 5. Использованные аналоги
  const afterSecondTableY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Reference Analogue Projects Included in Calculation', 14, afterSecondTableY);

  const analogRows = data.matchedProjects.map(p => [
    p.name,
    p.district,
    formatMoney(p.costPerSqm),
    formatMoney(p.totalCost),
  ]);

  autoTable(doc, {
    startY: afterSecondTableY + 4,
    theme: 'striped',
    head: [['Project Name', 'Location', 'Unit Cost', 'Final Budget']],
    body: analogRows.length > 0 ? analogRows : [['No direct analogues', '-', '-', '-']],
    headStyles: { fillColor: slateColor, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  // 6. Подвал документа и подпись
  const finalY = (doc as any).lastAutoTable.finalY + 14;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slateColor);
  doc.text('Generated via MGSU Construction Estimator | Department of Digital Technologies in Civil Engineering', 14, finalY);
  doc.text('Developer: Roman A. Slivin | Scientific Advisor review copy', 14, finalY + 5);

  // Скачивание
  doc.save(`Estimate_Report_${data.totalArea}sqm.pdf`);
}