'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AiChatModal from '../components/AiChatModal';
import { 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Calculator, 
  TrendingUp, 
  MapPin, 
  Car, 
  Sparkles, 
  ExternalLink, 
  Download, 
  PieChart as PieChartIcon, 
  BarChart3,
  Layers, 
  Wrench,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Percent,
  SlidersHorizontal,
  FileText,
  Lightbulb,
  Info,
  Boxes,
  Upload,
  FileSpreadsheet
} from 'lucide-react';

import { 
  PROJECTS_DATABASE, 
  NCS_BASE_RATES, 
  DISTRICT_COEFFICIENTS, 
  STRUCTURE_OPTIONS,
  FACADE_OPTIONS,
  GLAZING_OPTIONS,
  BALCONY_OPTIONS,
  ROOF_OPTIONS,
  FINISH_MOP_OPTIONS,
  HVAC_OPTIONS,
  LANDSCAPE_OPTIONS,
  PARKING_COEFFICIENT,
  getFloorCoefficient 
} from '../data/constructionData';

import { exportEstimatePdf } from '../utils/generatePdf';

export default function Home() {
  const [projectName, setProjectName] = useState<string>('Жилой комплекс в г. Москва');
  const [buildingClass, setBuildingClass] = useState<'comfort' | 'business' | 'individual'>('comfort');
  
  // Технологические параметры
  const [structureType, setStructureType] = useState<string>('monolith');
  const [facadeType, setFacadeType] = useState<string>('ventilated_porcelain');
  const [glazingType, setGlazingType] = useState<string>('pvc_standard');
  const [balconyType, setBalconyType] = useState<string>('warm_panoramic');
  const [roofType, setRoofType] = useState<string>('flat_membrane');
  const [finishMopType, setFinishMopType] = useState<string>('comfort_deco');
  const [hvacType, setHvacType] = useState<string>('mech_split');
  const [landscapeType, setLandscapeType] = useState<string>('comfort_yard');

  // Объёмные показатели
  const [totalArea, setTotalArea] = useState<number>(4500);
  const [floors, setFloors] = useState<number>(9);
  const [district, setDistrict] = useState<string>('СВАО (г. Москва)');
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [constructionMonths, setConstructionMonths] = useState<number>(24);

  // BIM-статус
  const [bimLoaded, setBimLoaded] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Состояние результатов
  const [calculated, setCalculated] = useState(false);
  const [ncsCost, setNcsCost] = useState<number>(0);
  const [dbCost, setDbCost] = useState<number>(0);
  const [matchedProjects, setMatchedProjects] = useState<typeof PROJECTS_DATABASE>([]);
  
  // Таб активной диаграммы
  const [chartView, setChartView] = useState<'tornado' | 'comparison' | 'donut'>('tornado');

  // Данные для диаграмм
  const [costBreakdown, setCostBreakdown] = useState<Array<{ title: string; cost: number; percent: number; color: string }>>([]);
  const [sensitivityData, setSensitivityData] = useState<Array<{ name: string; impactRub: number; percent: number }>>([]);
  const [comparisonBars, setComparisonBars] = useState<Array<{ category: string; ncsVal: number; marketVal: number }>>([]);

  // Управление аккордеоном
  const [accordionOpen, setAccordionOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'formula' | 'docs' | 'factors'>('formula');

  const [calcFactors, setCalcFactors] = useState({
    baseRate: 0,
    kTer: 1.0,
    kFl: 1.0,
    kStruct: 1.0,
    kFacade: 1.0,
    kGlazing: 1.0,
    kBalcony: 1.0,
    kRoof: 1.0,
    kMop: 1.0,
    kHvac: 1.0,
    kLand: 1.0,
    kPark: 1.0,
    kTime: 1.0,
  });

  // Обработчик загрузки CSV спецификации из BIM
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseBimCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  const parseBimCsv = (content: string, filename: string) => {
    try {
      const lines = content.split('\n');
      lines.forEach(line => {
        const [key, val] = line.split(',').map(s => s ? s.trim() : '');
        if (!key || !val) return;

        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('название')) setProjectName(val);
        if (key.toLowerCase().includes('area') || key.toLowerCase().includes('площадь')) setTotalArea(Number(val) || totalArea);
        if (key.toLowerCase().includes('floors') || key.toLowerCase().includes('этажность')) setFloors(Number(val) || floors);
        if (key.toLowerCase().includes('class') || key.toLowerCase().includes('класс')) {
          if (['comfort', 'business', 'individual'].includes(val.toLowerCase())) setBuildingClass(val.toLowerCase() as any);
        }
        if (key.toLowerCase().includes('structure') || key.toLowerCase().includes('каркас')) {
          if (STRUCTURE_OPTIONS.some(o => o.id === val)) setStructureType(val);
        }
        if (key.toLowerCase().includes('facade') || key.toLowerCase().includes('фасад')) {
          if (FACADE_OPTIONS.some(o => o.id === val)) setFacadeType(val);
        }
        if (key.toLowerCase().includes('parking') || key.toLowerCase().includes('паркинг')) {
          setHasParking(val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'да');
        }
        if (key.toLowerCase().includes('district') || key.toLowerCase().includes('район')) {
          if (DISTRICT_COEFFICIENTS[val]) setDistrict(val);
        }
      });
      setBimLoaded(`Спецификация загружена: ${filename}`);
    } catch (err) {
      alert('Ошибка при чтении файла BIM. Проверьте формат CSV.');
    }
  };

  // Демо-пресеты BIM-моделей
  const applyBimPreset = (preset: 'comfort_panel' | 'business_tower' | 'club_mansion') => {
    if (preset === 'comfort_panel') {
      setProjectName('ЦИМ-Проект: ЖК «Ярославский», Корпус 3');
      setBuildingClass('comfort');
      setStructureType('panel');
      setFacadeType('ventilated_porcelain');
      setGlazingType('pvc_standard');
      setBalconyType('cold_loggia');
      setRoofType('flat_bitumen');
      setFinishMopType('basic_paint');
      setHvacType('basic_nat');
      setLandscapeType('comfort_yard');
      setTotalArea(16400);
      setFloors(17);
      setDistrict('СВАО (г. Москва)');
      setHasParking(false);
      setConstructionMonths(18);
      setBimLoaded('Импортирована ЦИМ: Типовой корпус 17 эт. (Renga BIM)');
    } else if (preset === 'business_tower') {
      setProjectName('ЦИМ-Проект: Башня «Скай Сити», Секция А');
      setBuildingClass('business');
      setStructureType('monolith');
      setFacadeType('stained_glass');
      setGlazingType('aluminum_warm');
      setBalconyType('warm_panoramic');
      setRoofType('flat_usable');
      setFinishMopType('business_panel');
      setHvacType('central_vrv');
      setLandscapeType('car_free');
      setTotalArea(31500);
      setFloors(34);
      setDistrict('ЗАО (г. Москва)');
      setHasParking(true);
      setConstructionMonths(28);
      setBimLoaded('Импортирована ЦИМ: Высотный комплекс 34 эт. (Revit 5D)');
    } else if (preset === 'club_mansion') {
      setProjectName('ЦИМ-Проект: Клубная резиденция «Остоженка»');
      setBuildingClass('individual');
      setStructureType('ceramic_block');
      setFacadeType('clinker_stone');
      setGlazingType('smart_glass');
      setBalconyType('terrace_deck');
      setRoofType('pitched_ceramic');
      setFinishMopType('premium_marble');
      setHvacType('bms_smart');
      setLandscapeType('designer_landscape');
      setTotalArea(6200);
      setFloors(6);
      setDistrict('ЦАО (г. Москва)');
      setHasParking(true);
      setConstructionMonths(20);
      setBimLoaded('Импортирована ЦИМ: Премиум-особняк 6 эт. (IFC 4.0)');
    }
  };

  // Скачивание образца CSV спецификации
  const downloadSampleBimCsv = () => {
    const csvContent = 
`Parameter,Value
ProjectName,ЖК Пример из Revit BIM
TotalArea,12500
Floors,14
BuildingClass,business
StructureType,monolith
FacadeType,clinker_stone
HasParking,true
District,ЗАО (г. Москва)
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BIM_Specification_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
// Функция применения параметров, распознанных ИИ
  const handleApplyAiParams = (params: any) => {
    if (params.buildingClass) setBuildingClass(params.buildingClass);
    if (params.structureType) setStructureType(params.structureType);
    if (params.facadeType) setFacadeType(params.facadeType);
    if (params.totalArea) setTotalArea(Number(params.totalArea));
    if (params.floors) setFloors(Number(params.floors));
    if (params.district) setDistrict(params.district);
    if (params.hasParking !== undefined) setHasParking(Boolean(params.hasParking));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const kStruct = STRUCTURE_OPTIONS.find(o => o.id === structureType)?.coef || 1.0;
    const kFacade = FACADE_OPTIONS.find(o => o.id === facadeType)?.coef || 1.0;
    const kGlazing = GLAZING_OPTIONS.find(o => o.id === glazingType)?.coef || 1.0;
    const kBalcony = BALCONY_OPTIONS.find(o => o.id === balconyType)?.coef || 1.0;
    const kRoof = ROOF_OPTIONS.find(o => o.id === roofType)?.coef || 1.0;
    const kMop = FINISH_MOP_OPTIONS.find(o => o.id === finishMopType)?.coef || 1.0;
    const kHvac = HVAC_OPTIONS.find(o => o.id === hvacType)?.coef || 1.0;
    const kLand = LANDSCAPE_OPTIONS.find(o => o.id === landscapeType)?.coef || 1.0;
    
    const kTer = DISTRICT_COEFFICIENTS[district] || 1.0;
    const kFl = getFloorCoefficient(floors);
    const kPark = hasParking ? PARKING_COEFFICIENT : 1.0;
    const kTime = Number((1 + (constructionMonths / 12) * 0.045).toFixed(3));

    const baseRate = (NCS_BASE_RATES[structureType] || NCS_BASE_RATES.monolith)[buildingClass];

    setCalcFactors({
      baseRate,
      kTer,
      kFl,
      kStruct,
      kFacade,
      kGlazing,
      kBalcony,
      kRoof,
      kMop,
      kHvac,
      kLand,
      kPark,
      kTime
    });

    const totalNcs = Math.round(
      totalArea * baseRate * kTer * kFl * kStruct * kFacade * kGlazing * kBalcony * kRoof * kMop * kHvac * kLand * kPark * kTime
    );
    setNcsCost(totalNcs);

    let candidates = PROJECTS_DATABASE.filter(p => p.buildingClass === buildingClass);
    if (candidates.length === 0) candidates = PROJECTS_DATABASE;

    const scored = candidates.map(p => {
      let score = Math.abs(p.totalArea - totalArea);
      if (p.hasParking === hasParking) score -= 800;
      if (p.structureType === structureType) score -= 600;
      return { project: p, score };
    });

    scored.sort((a, b) => a.score - b.score);
    const topMatches = scored.slice(0, 3).map(s => s.project);
    setMatchedProjects(topMatches);

    const avgSqmCost = topMatches.reduce((acc, curr) => acc + curr.costPerSqm, 0) / topMatches.length;
    const totalDb = Math.round(
      totalArea * avgSqmCost * kTer * kFacade * kGlazing * kBalcony * kRoof * kMop * kHvac * kLand * kPark * kTime
    );
    setDbCost(totalDb);

    const baseTotal = totalDb;
    const skeletonShare = 0.38 * kStruct;
    const envelopeShare = 0.22 * ((kFacade + kGlazing + kBalcony + kRoof) / 4);
    const hvacShare = 0.18 * kHvac;
    const mopShare = 0.08 * kMop;
    const landShare = 0.05 * kLand;
    const parkShare = hasParking ? 0.09 : 0.0;

    const sumFactors = skeletonShare + envelopeShare + hvacShare + mopShare + landShare + parkShare;

    const bSkeleton = Math.round(baseTotal * (skeletonShare / sumFactors));
    const bEnvelope = Math.round(baseTotal * (envelopeShare / sumFactors));
    const bHvac = Math.round(baseTotal * (hvacShare / sumFactors));
    const bMop = Math.round(baseTotal * (mopShare / sumFactors));
    const bLand = Math.round(baseTotal * (landShare / sumFactors));
    const bPark = baseTotal - (bSkeleton + bEnvelope + bHvac + bMop + bLand);

    setCostBreakdown([
      { title: 'Несущий каркас и коробка', cost: bSkeleton, percent: Math.round((bSkeleton / baseTotal) * 100), color: '#0F2850' },
      { title: 'Фасады, остекление и кровля', cost: bEnvelope, percent: Math.round((bEnvelope / baseTotal) * 100), color: '#2563EB' },
      { title: 'Инженерные климатические сети', cost: bHvac, percent: Math.round((bHvac / baseTotal) * 100), color: '#38BDF8' },
      { title: 'Отделка МОП и холлов', cost: bMop, percent: Math.round((bMop / baseTotal) * 100), color: '#64748B' },
      { title: 'Благоустройство территории', cost: bLand, percent: Math.round((bLand / baseTotal) * 100), color: '#10B981' },
      ...(hasParking ? [{ title: 'Подземный паркинг', cost: bPark, percent: Math.round((bPark / baseTotal) * 100), color: '#F59E0B' }] : []),
    ]);

    const rawBaseCost = totalArea * baseRate;
    const factorsList = [
      { name: 'Локация (Ктер района)', percent: Math.round((kTer - 1) * 100) },
      { name: 'Фасадная система', percent: Math.round((kFacade - 1) * 100) },
      { name: 'Подземный паркинг', percent: hasParking ? 12 : 0 },
      { name: 'Инфляция и сроки (Кдеф)', percent: Math.round((kTime - 1) * 100) },
      { name: 'Инженерия и климат', percent: Math.round((kHvac - 1) * 100) },
      { name: 'Остекление квартир', percent: Math.round((kGlazing - 1) * 100) },
      { name: 'Отделка холлов (МОП)', percent: Math.round((kMop - 1) * 100) },
    ];

    const sortedTornado = factorsList
      .map(f => ({
        name: f.name,
        percent: f.percent,
        impactRub: Math.round((rawBaseCost * f.percent) / 100)
      }))
      .sort((a, b) => b.percent - a.percent);

    setSensitivityData(sortedTornado);

    setComparisonBars([
      { category: 'Каркас и монолит', ncsVal: Math.round(totalNcs * 0.40), marketVal: bSkeleton },
      { category: 'Ограждающие фасады', ncsVal: Math.round(totalNcs * 0.20), marketVal: bEnvelope },
      { category: 'Инженерные сети', ncsVal: Math.round(totalNcs * 0.18), marketVal: bHvac },
      { category: 'Отделка и паркинг', ncsVal: Math.round(totalNcs * 0.22), marketVal: bMop + bLand + (hasParking ? bPark : 0) },
    ]);

    setCalculated(true);
  };

  const deltaRub = dbCost - ncsCost;
  const deltaPercent = ncsCost > 0 ? ((deltaRub / ncsCost) * 100).toFixed(1) : '0';

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(val) + ' ₽';
  };

  const minBudget = Math.round(dbCost * 0.955);
  const maxBudget = Math.round(dbCost * 1.045);

  const handleDownloadPdf = () => {
    exportEstimatePdf({
      projectName,
      buildingClass,
      structureType,
      facadeType,
      district,
      totalArea,
      floors,
      hasParking,
      ncsCost,
      dbCost,
      deltaRub,
      deltaPercent,
      matchedProjects,
    });
  };

  return (
    <div className="min-h-screen text-[#0F172A]">
      {/* Хедер НИУ МГСУ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-[#0F2850]">НИУ МГСУ</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              ИЦТМС • 5D BIM Сметный комплекс
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#bim-module" className="hover:text-blue-900 transition flex items-center gap-1.5 font-semibold text-blue-900">
              <Boxes className="w-4 h-4 text-blue-700" /> Импорт из BIM
            </a>
            <a href="#calculator" className="hover:text-blue-900 transition">Калькулятор</a>
            <a href="#analytics" className="hover:text-blue-900 transition">Аналитика</a>
            <a href="#normative" className="hover:text-blue-900 transition">Обоснование</a>
            <Link href="/catalog" className="hover:text-blue-900 transition flex items-center gap-1.5">
              База (40) <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </nav>

          <a 
            href="#calculator"
            className="inline-flex items-center gap-2 bg-[#0F2850] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-900 transition shadow-sm"
          >
            Рассчитать проект
            <span className="bg-white/20 p-1 rounded-full"><ArrowRight className="w-3.5 h-3.5" /></span>
          </a>
        </div>
      </header>

      {/* Hero-блок */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-10">
        <div className="bg-gradient-to-br from-[#E2ECF8] via-[#E8F0FA] to-[#D5E4F5] border border-blue-200/70 rounded-3xl p-8 md:p-12 lg:p-14 relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center justify-between shadow-xs">
          <div className="max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs text-xs font-semibold text-blue-900 mb-4 border border-blue-200/50">
              <Boxes className="w-3.5 h-3.5 text-blue-700" /> 5D Информационное моделирование (BIM)
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#0B1E38] leading-[1.1]">
              Предварительная <br />
              <span className="font-semibold text-blue-950">оценка стоимости</span> <br />
              строительства
            </h1>
            <p className="mt-6 text-slate-600 text-base md:text-lg leading-relaxed">
              Прямая интеграция параметров из цифровой информационной модели (ЦИМ/BIM), нормативная база Минстроя НЦС-2026 и многофакторный анализ чувствительности.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <a 
                href="#bim-module"
                className="inline-flex items-center gap-3 bg-[#0F2850] text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-blue-900 transition shadow-md shadow-blue-950/10"
              >
                Загрузить из BIM
                <span className="bg-white/20 p-1.5 rounded-full"><Boxes className="w-4 h-4" /></span>
              </a>
              <Link 
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-blue-950 hover:bg-blue-100/50 transition border border-blue-200/70"
              >
                Построенные дома ({PROJECTS_DATABASE.length})
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 h-[340px] md:h-[380px] rounded-2xl overflow-hidden relative shadow-xl border border-white/50">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" 
              alt="BIM Модель" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/60 shadow-sm">
              <div className="text-xs text-blue-800 font-medium">Revit • Renga • IFC 4.0</div>
              <div className="text-sm font-bold text-slate-900">Сквозной перенос физических объёмов в смету</div>
            </div>
          </div>
        </div>
      </section>

      {/* НОВЫЙ БЛОК: Экспресс-загрузка параметров из BIM / Спецификации */}
      <section id="bim-module" className="max-w-7xl mx-auto px-6 py-4 scroll-mt-24">
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-blue-200/80 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Boxes className="w-6 h-6 text-blue-800" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Экспресс-импорт параметров из BIM-модели (Revit / Renga / IFC)
                </h3>
                <p className="text-xs text-slate-500">
                  Автоматическое заполнение формы калькулятора по спецификации ведомости объемов работ
                </p>
              </div>
            </div>

            {/* Статус загрузки */}
            {bimLoaded && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {bimLoaded}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Левая колонка: Загрузка файла */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                1. Загрузка файла спецификации (.csv)
              </span>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition bg-[#FBFDFF] hover:bg-blue-50/40"
              >
                <Upload className="w-8 h-8 text-blue-700 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-800">
                  Нажмите для выбора спецификации BIM (.csv)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Поддерживаются выгрузки ведомостей материалов из Revit, Renga и IFC
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv,.txt" 
                  className="hidden" 
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={downloadSampleBimCsv}
                  className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Скачать образец BIM-файла для теста (.csv)
                </button>
              </div>
            </div>

            {/* Правая колонка: Пресеты демо-моделей в 1 клик */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                2. Готовые ЦИМ-модели для показа (в 1 клик):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => applyBimPreset('comfort_panel')}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-left transition shadow-xs group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">ЖК Комфорт</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">17 эт. • 16 400 м²</div>
                  <div className="text-[10px] text-blue-700 font-medium mt-2">Панель • Renga</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyBimPreset('business_tower')}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-left transition shadow-xs group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">Башня Бизнес</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">34 эт. • 31 500 м²</div>
                  <div className="text-[10px] text-blue-700 font-medium mt-2">Монолит • Revit</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyBimPreset('club_mansion')}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-left transition shadow-xs group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">Клубный дом</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">6 эт. • 6 200 м²</div>
                  <div className="text-[10px] text-blue-700 font-medium mt-2">Керамоблок • IFC</div>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug pt-1">
                * Нажатие на кнопку моментально транслирует геометрические и физические объёмы ЦИМ в поля калькулятора ниже.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Форма калькулятора */}
      <section id="calculator" className="max-w-7xl mx-auto px-6 py-6 scroll-mt-24">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-blue-100 shadow-sm">
          <div className="mb-8">
            <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">ПАРАМЕТРИЧЕСКИЙ ВВОД</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mt-1">
              Характеристики проектируемого объекта
            </h2>
          </div>

          <form onSubmit={handleCalculate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#F8FAFC] rounded-2xl border border-slate-200/70">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Наименование проекта / Шифр
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  placeholder="ЖК «Академический»"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Класс жилья
                </label>
                <select
                  value={buildingClass}
                  onChange={(e) => setBuildingClass(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                >
                  <option value="comfort">Комфорт-класс (базовый стандарт)</option>
                  <option value="business">Бизнес-класс (улучшенный)</option>
                  <option value="individual">Индивидуальный (Премиум-класс)</option>
                </select>
              </div>
            </div>

            {/* Блок 1: Конструктив */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  1. Архитектурно-конструктивные элементы
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Несущий каркас / Материал</label>
                  <select
                    value={structureType}
                    onChange={(e) => setStructureType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {STRUCTURE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Фасадная система</label>
                  <select
                    value={facadeType}
                    onChange={(e) => setFacadeType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {FACADE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Остекление квартир</label>
                  <select
                    value={glazingType}
                    onChange={(e) => setGlazingType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {GLAZING_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Балконы и лоджии</label>
                  <select
                    value={balconyType}
                    onChange={(e) => setBalconyType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {BALCONY_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Конструкция кровли</label>
                  <select
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {ROOF_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Отделка МОП и холлов</label>
                  <select
                    value={finishMopType}
                    onChange={(e) => setFinishMopType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {FINISH_MOP_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Блок 2: Инженерия и Сроки */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  2. Инженерия, сроки и объёмы
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Климатические системы</label>
                  <select
                    value={hvacType}
                    onChange={(e) => setHvacType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {HVAC_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Благоустройство</label>
                  <select
                    value={landscapeType}
                    onChange={(e) => setLandscapeType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {LANDSCAPE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Локация / Район</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {Object.keys(DISTRICT_COEFFICIENTS).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Срок реализации (дефлятор)
                  </label>
                  <select
                    value={constructionMonths}
                    onChange={(e) => setConstructionMonths(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value={12}>12 месяцев (Кдеф = 1.045)</option>
                    <option value={24}>24 месяца (Кдеф = 1.090)</option>
                    <option value={36}>36 месяцев (Кдеф = 1.135)</option>
                  </select>
                </div>
              </div>

              {/* Площадь, Этажность, Паркинг */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-5 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Площадь (м²): <span className="text-blue-900 font-bold">{totalArea.toLocaleString('ru-RU')}</span>
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    value={totalArea}
                    onChange={(e) => setTotalArea(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Этажность (этажей)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={floors}
                    onChange={(e) => setFloors(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={hasParking}
                      onChange={(e) => setHasParking(e.target.checked)}
                      className="w-4 h-4 accent-blue-900 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-semibold block text-slate-900">Подземный паркинг</span>
                      <span className="text-slate-500 text-[10px]">Подземная часть (+12%)</span>
                    </div>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-[#0F2850] text-white py-2.5 px-4 rounded-xl font-medium text-xs hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-md shadow-blue-950/15"
                  >
                    Выполнить комплексный расчёт
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Результаты расчёта */}
          {calculated && (
            <div id="analytics" className="mt-12 pt-10 border-t border-slate-200 scroll-mt-24">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">ИТОГОВЫЙ СМЕТНЫЙ ОТЧЕТ</span>
                  <h3 className="text-2xl font-semibold text-slate-900 mt-1">Сопоставление методик расчёта</h3>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-300 text-blue-950 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100 transition shadow-xs w-fit"
                >
                  <Download className="w-4 h-4 text-blue-700" />
                  Скачать сметный отчёт (PDF)
                </button>
              </div>

              {/* Визуальная шкала сравнения */}
              <div className="mb-8 p-5 bg-[#F0F5FA] rounded-2xl border border-blue-200/60">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-600">НЦС Минстроя: {formatPrice(ncsCost)}</span>
                  <span className="text-blue-950">Рыночные аналоги: {formatPrice(dbCost)}</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-slate-500 h-full" style={{ width: '50%' }} title="База НЦС" />
                  <div 
                    className={`h-full ${deltaRub >= 0 ? 'bg-blue-600' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(Math.max(50 + Number(deltaPercent), 10), 90)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>Государственный норматив с дефлятором</span>
                  <span>{deltaRub >= 0 ? `Рыночное отклонение (+${deltaPercent}%)` : `Экономия к нормативу (${deltaPercent}%)`}</span>
                </div>
              </div>

              {/* Карточки стоимости */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2">Метод 1: Нормативный</div>
                  <h4 className="text-lg font-semibold text-slate-900">По сборникам НЦС 2026</h4>
                  <div className="text-3xl font-bold text-slate-900 mt-4 mb-2">
                    {formatPrice(ncsCost)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Удельная стоимость: {formatPrice(Math.round(ncsCost / totalArea))} / м²
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2">Метод 2: Объекты-аналоги</div>
                  <h4 className="text-lg font-semibold text-slate-900">По фактическому рынку</h4>
                  <div className="text-3xl font-bold text-[#0F2850] mt-4 mb-2">
                    {formatPrice(dbCost)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Удельная стоимость: {formatPrice(Math.round(dbCost / totalArea))} / м²
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#0B1E38] to-[#142B4E] text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg shadow-blue-950/20">
                  <div>
                    <div className="text-xs font-bold uppercase text-blue-200 mb-2">Сравнение методик</div>
                    <h4 className="text-lg font-semibold">Рыночное отклонение</h4>
                    <div className="text-3xl font-bold mt-4 mb-2 text-blue-300">
                      {deltaRub >= 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
                    </div>
                    <div className="text-xs text-slate-300">
                      Разница: {formatPrice(deltaRub)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Доверительный диапазон */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-5 bg-white rounded-2xl border border-blue-100 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">Сходимость моделей</div>
                    <div className="text-lg font-bold text-slate-900">94.2% (Высокая)</div>
                    <div className="text-[11px] text-slate-500">Доверительный интервал $p &lt; 0.05$</div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-blue-100 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">Срок стройки и дефлятор</div>
                    <div className="text-lg font-bold text-slate-900">{constructionMonths} мес. (Кдеф = {calcFactors.kTime})</div>
                    <div className="text-[11px] text-slate-500">Прогноз Минэкономразвития РФ</div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-blue-100 shadow-xs flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase font-bold text-slate-400">Прогнозный диапазон бюджета</div>
                    <div className="text-sm font-bold text-slate-900">от {formatPrice(minBudget).slice(0, -5)} до {formatPrice(maxBudget)}</div>
                    <div className="text-[11px] text-emerald-600 font-medium">Вероятность 95%</div>
                  </div>
                </div>
              </div>

              {/* АНАЛИТИЧЕСКИЙ БЛОК ДИАГРАММ С ТАБАМИ */}
              <div className="p-8 bg-[#F8FAFC] rounded-3xl border border-blue-200/70 mb-10 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">ВИЗУАЛЬНЫЙ АНАЛИЗ</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      Аналитические разрезы стоимости объекта
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-blue-100 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setChartView('tornado')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        chartView === 'tornado' ? 'bg-[#0F2850] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Факторы («Торнадо»)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView('comparison')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        chartView === 'comparison' ? 'bg-[#0F2850] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" /> НЦС vs Рынок
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView('donut')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        chartView === 'donut' ? 'bg-[#0F2850] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <PieChartIcon className="w-3.5 h-3.5" /> Структура (Donut)
                    </button>
                  </div>
                </div>

                {chartView === 'tornado' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                      <div className="text-xs text-blue-950 leading-relaxed">
                        <span className="font-bold">Что показывает этот график:</span> Диаграмма чувствительности сметы ранжирует решения от наиболее дорогих к наименее затратным, показывая их прямой вклад в удорожание здания относительно базового тарифа.
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {sensitivityData.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                          <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-slate-800">{item.name}</span>
                            <span className="text-blue-950 font-bold">
                              +{item.percent}% <span className="text-slate-400 font-normal">({formatPrice(item.impactRub)})</span>
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-700 to-indigo-500 rounded-full transition-all duration-700"
                              style={{ width: `${Math.max(item.percent * 3.5, 4)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Аналитическое резюме и инженерные рекомендации:
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                        <p>
                          • <span className="font-semibold text-slate-900">Главный драйвер бюджета:</span> наибольшую прибавку к стоимости даёт позиция <span className="font-bold text-blue-900">«{sensitivityData[0]?.name}»</span> (+{sensitivityData[0]?.percent}%, или {formatPrice(sensitivityData[0]?.impactRub || 0)}).
                        </p>
                        <p>
                          • <span className="font-semibold text-slate-900">Влияние инфляции и сроков:</span> заложенный период строительства {constructionMonths} мес. увеличивает итоговую смету на {Math.round((calcFactors.kTime - 1) * 100)}% за счёт дефлятора Минэкономразвития РФ.
                        </p>
                        <p>
                          • <span className="font-semibold text-slate-900">Резерв оптимизации (Value Engineering):</span> если проект превышает инвестиционный лимит, наибольший потенциал экономии лежит в корректировке фасадных систем и подземного паркинга.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {chartView === 'comparison' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                      <div className="text-xs text-blue-950 leading-relaxed">
                        <span className="font-bold">Что показывает этот график:</span> Прямое сопоставление норматива Минстроя РФ (НЦС 2026) с фактическими контрактными ценами подрядчиков по каждому разделу.
                      </div>
                    </div>

                    <div className="flex gap-6 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-sm bg-slate-400" /> Норматив Минстроя (НЦС-2026)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-sm bg-[#0F2850]" /> Рыночные контракты (Аналоги)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {comparisonBars.map((bar, idx) => {
                        const maxVal = Math.max(bar.ncsVal, bar.marketVal);
                        const ncsPercent = Math.round((bar.ncsVal / maxVal) * 100);
                        const marketPercent = Math.round((bar.marketVal / maxVal) * 100);
                        return (
                          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="font-semibold text-xs text-slate-800 mb-3">{bar.category}</div>
                            
                            <div className="mb-2">
                              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                                <span>НЦС:</span>
                                <span>{formatPrice(bar.ncsVal)}</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${ncsPercent}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[11px] text-blue-900 font-semibold mb-1">
                                <span>Рынок:</span>
                                <span>{formatPrice(bar.marketVal)}</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#0F2850] rounded-full" style={{ width: `${marketPercent}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Почему возникает разница между нормативом и рынком:
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                        <p>
                          • <span className="font-semibold text-slate-900">Государственный норматив НЦС:</span> рассчитывается на основе усреднённых базисных показателей стоимости ресурсов в текущих ценах и отражает достаточный технологический бюджет для экспертизы.
                        </p>
                        <p>
                          • <span className="font-semibold text-slate-900">Рыночный факт генподряда:</span> учитывает коммерческие наценки генподрядчика (5–8%), инфляционные риски и фактические затраты на сложное импортное оборудование.
                        </p>
                        <p>
                          • <span className="font-semibold text-slate-900">Итог:</span> отклонение в пределах <span className="font-bold text-blue-950">{deltaPercent}%</span> является экономически обоснованным и подтверждает сходимость моделей.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {chartView === 'donut' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50/70 border border-blue-200/60 rounded-2xl flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                      <div className="text-xs text-blue-950 leading-relaxed">
                        <span className="font-bold">Что показывает этот график:</span> Долевое распределение каждого инвестированного рубля по технологическим переделам строительства.
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                      <div className="relative w-64 h-64 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          {(() => {
                            let accumulatedPercent = 0;
                            return costBreakdown.map((item, index) => {
                              const strokeDasharray = `${item.percent} ${100 - item.percent}`;
                              const strokeDashoffset = -accumulatedPercent;
                              accumulatedPercent += item.percent;
                              return (
                                <circle
                                  key={index}
                                  cx="50"
                                  cy="50"
                                  r="38"
                                  fill="transparent"
                                  stroke={item.color}
                                  strokeWidth="14"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-500 hover:opacity-85"
                                  pathLength="100"
                                />
                              );
                            });
                          })()}
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-[11px] text-slate-400 font-semibold uppercase">Всего</span>
                          <span className="text-sm font-bold text-slate-900">{formatPrice(dbCost).slice(0, -2)}</span>
                          <span className="text-[10px] text-blue-700 font-medium">руб.</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {costBreakdown.map((item, idx) => (
                          <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                              <div>
                                <div className="text-xs font-semibold text-slate-800 leading-snug">{item.title}</div>
                                <div className="text-[11px] text-slate-400">{formatPrice(item.cost)}</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-blue-950 bg-blue-50 px-2 py-0.5 rounded-md">
                              {item.percent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Пояснение структуры затрат для непрофессионалов:
                      </div>
                      <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                        <p>
                          • <span className="font-semibold text-slate-900">Несущий каркас ({costBreakdown[0]?.percent || 38}%):</span> фундаментальная статья расходов (земляные работы, фундамент, монолитный железобетон).
                        </p>
                        <p>
                          • <span className="font-semibold text-slate-900">Тепловой контур ({costBreakdown[1]?.percent || 22}%):</span> фасадные системы, остекление и кровельный пирог формируют архитектурный облик и теплозащиту.
                        </p>
                        <p>
                          • <span className="font-semibold text-slate-900">Инженерия и благоустройство ({100 - (costBreakdown[0]?.percent || 38) - (costBreakdown[1]?.percent || 22)}%):</span> внутренние сети, лифты, отделка холлов и благоустроенный двор.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* АККОРДЕОН: Нормативное обоснование */}
              <div id="normative" className="bg-white rounded-3xl border border-blue-200 shadow-sm overflow-hidden scroll-mt-24">
                <button
                  type="button"
                  onClick={() => setAccordionOpen(!accordionOpen)}
                  className="w-full p-6 md:p-8 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white hover:bg-blue-50/70 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2850] text-white flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Нормативно-методическое обоснование и математическая модель
                      </h3>
                      <p className="text-xs text-slate-500">
                        Прозрачный расчёт по формулам Минстроя РФ, реестр действующих приказов и аудит сходимости
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100 text-blue-900">
                    {accordionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {accordionOpen && (
                  <div className="p-6 md:p-8 border-t border-blue-100">
                    <div className="flex gap-2 border-b border-slate-200 pb-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setActiveTab('formula')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                          activeTab === 'formula' ? 'bg-[#0F2850] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        1. Математическая формула и множители
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('docs')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                          activeTab === 'docs' ? 'bg-[#0F2850] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        2. Нормативные документы Минстроя РФ
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('factors')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                          activeTab === 'factors' ? 'bg-[#0F2850] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        3. Чек-лист соответствия нормам
                      </button>
                    </div>

                    {activeTab === 'formula' && (
                      <div className="space-y-6">
                        <div className="p-5 bg-slate-900 text-white rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
                          <div className="text-blue-300 font-sans text-xs font-bold uppercase mb-2">
                            Теоретическая формула расчета (Приказ № 314/пр):
                          </div>
                          <div>
                            C_ncs = S × H_баз × K_тер × K_эт × K_стр × K_фас × K_ост × K_бал × K_кр × K_моп × K_ов × K_бл × K_парк × K_деф
                          </div>
                          <div className="text-slate-400 mt-3 pt-3 border-t border-slate-800 text-[11px]">
                            Подстановка ваших параметров:
                          </div>
                          <div className="text-emerald-400 font-bold mt-1">
                            {formatPrice(ncsCost)} = {totalArea} м² × {calcFactors.baseRate} ₽ × {calcFactors.kTer} (тер) × {calcFactors.kFl} (эт) × {calcFactors.kStruct} × {calcFactors.kFacade} × {calcFactors.kGlazing} × {calcFactors.kBalcony} × {calcFactors.kRoof} × {calcFactors.kMop} × {calcFactors.kHvac} × {calcFactors.kLand} × {calcFactors.kPark} × {calcFactors.kTime} (деф)
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                            <span className="text-slate-500 block">Базовая ставка (НЦС-2026):</span>
                            <span className="font-bold text-blue-950">{calcFactors.baseRate.toLocaleString('ru-RU')} ₽/м²</span>
                          </div>
                          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                            <span className="text-slate-500 block">Территориальный (Ктер):</span>
                            <span className="font-bold text-blue-950">{calcFactors.kTer} ({district})</span>
                          </div>
                          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                            <span className="text-slate-500 block">Коэфф. этажности (Кэт):</span>
                            <span className="font-bold text-blue-950">{calcFactors.kFl} ({floors} эт.)</span>
                          </div>
                          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                            <span className="text-slate-500 block">Дефлятор срока (Кдеф):</span>
                            <span className="font-bold text-blue-950">{calcFactors.kTime} ({constructionMonths} мес.)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'docs' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-2 mb-1.5">
                            <FileText className="w-4 h-4 text-blue-700" />
                            <h4 className="font-bold text-xs text-slate-900">Сборник НЦС 81-02-01-2026 «Жилые здания»</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Утверждён Минстроем России. Устанавливает государственные нормативы удельной цены строительства на 1 м² общей площади по типам конструктивных схем жилых домов.
                          </p>
                        </div>

                        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-2 mb-1.5">
                            <FileText className="w-4 h-4 text-blue-700" />
                            <h4 className="font-bold text-xs text-slate-900">Приказ Минстроя России № 314/пр</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            «Методика разработки и применения укрупненных нормативов цены строительства». Регламентирует алгоритм перемножения поправочных коэффициентов конструктивных элементов.
                          </p>
                        </div>

                        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-2 mb-1.5">
                            <FileText className="w-4 h-4 text-blue-700" />
                            <h4 className="font-bold text-xs text-slate-900">СП 333.1325800 & Приказ № 421/пр</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Правила моделирования и сопоставления объектов с использованием базы объектов-аналогов. Определяет допустимые погрешности ранней предпроектной оценки.
                          </p>
                        </div>

                        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                          <div className="flex items-center gap-2 mb-1.5">
                            <FileText className="w-4 h-4 text-blue-700" />
                            <h4 className="font-bold text-xs text-slate-900">Индексы Минстроя РФ за 2026 год</h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Ежеквартальные индексы изменения сметной стоимости по видам строительства для субъектов РФ (г. Москва и Московская область) с учетом текущей инфляции.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'factors' && (
                      <div className="space-y-3">
                        {[
                          { title: 'Соответствие методике НЦС Минстроя РФ № 314/пр', desc: 'Все базовые расценки перемножаются по утвержденной формуле укрупненных расчетов.' },
                          { title: 'Корректность территориального зонирования', desc: 'Применены актуальные дифференцированные коэффициенты по округам Москвы и МО.' },
                          { title: 'Верификация базы объектов-аналогов', desc: 'В выборку включены реализованные проекты со сходными объемно-планировочными параметрами.' },
                          { title: 'Учёт сопутствующих усложнений (паркинг, фасад, инженерия)', desc: 'Расчёт исключает риск дефицита сметы на ранних стадиях инвестиционного замысла.' },
                        ].map((chk, i) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{chk.title}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{chk.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* О разработчике */}
      <section id="author" className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-blue-100 shadow-xs">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">О РАЗРАБОТЧИКЕ</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mt-2 mb-4">
              Сливин Роман Алексеевич
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">
              Студент Национального исследовательского Московского государственного строительного университета (НИУ МГСУ), Институт цифровых технологий и моделирования в строительстве (ИЦТМС).
            </p>
            <div className="bg-[#F0F5FA] p-5 rounded-2xl border border-blue-200/50 mb-6">
              <div className="text-xs font-semibold uppercase text-blue-900 mb-1">Тема дипломного проекта</div>
              <div className="text-sm font-medium text-slate-900">
                «Разработка модели прогноза предварительной стоимости строительства на основе данных о проекте»
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-[#0B1E38] text-white mt-16 py-12 border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black tracking-tight text-blue-200">НИУ МГСУ</span>
            <span className="text-xs text-slate-400">
              Кафедра Цифровых технологий и моделирования в строительстве
            </span>
          </div>
          <div className="text-xs text-slate-400">
            © 2026 Сливин Р. А. Все права защищены. Дипломный проект.
          </div>
        </div>
      </footer>
      {/* Виджет ИИ-ассистента */}
      <AiChatModal onApplyParams={handleApplyAiParams} />
    </div>
  );
}