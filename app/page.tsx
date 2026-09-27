'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Calculator, 
  TrendingUp, 
  MapPin,
  Car,
  Building,
  Sparkles,
  Layers,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';

import { 
  PROJECTS_DATABASE, 
  NCS_BASE_RATES, 
  DISTRICT_COEFFICIENTS, 
  FACADE_COEFFICIENTS,
  PARKING_COEFFICIENT,
  getFloorCoefficient 
} from '../data/constructionData';

export default function Home() {
  const [buildingClass, setBuildingClass] = useState<'comfort' | 'business' | 'individual'>('comfort');
  const [structureType, setStructureType] = useState<'monolith' | 'brick' | 'panel'>('monolith');
  const [facadeType, setFacadeType] = useState<'plaster' | 'ventilated' | 'clinker_glass'>('ventilated');
  const [totalArea, setTotalArea] = useState<number>(4500);
  const [floors, setFloors] = useState<number>(9);
  const [district, setDistrict] = useState<string>('СВАО (г. Москва)');
  const [hasParking, setHasParking] = useState<boolean>(false);

  const [calculated, setCalculated] = useState(false);
  const [ncsCost, setNcsCost] = useState<number>(0);
  const [dbCost, setDbCost] = useState<number>(0);
  const [matchedProjects, setMatchedProjects] = useState<typeof PROJECTS_DATABASE>([]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Расчёт по НЦС
    const baseRate = NCS_BASE_RATES[structureType][buildingClass];
    const kTer = DISTRICT_COEFFICIENTS[district] || 1.0;
    const kFl = getFloorCoefficient(floors);
    const kFacade = FACADE_COEFFICIENTS[facadeType];
    const kPark = hasParking ? PARKING_COEFFICIENT : 1.0;

    const totalNcs = Math.round(totalArea * baseRate * kTer * kFl * kFacade * kPark);
    setNcsCost(totalNcs);

    // 2. Расчёт по объектам-аналогам
    let candidates = PROJECTS_DATABASE.filter(
      p => p.buildingClass === buildingClass && p.structureType === structureType
    );
    if (candidates.length === 0) candidates = PROJECTS_DATABASE;

    const scored = candidates.map(p => {
      let score = Math.abs(p.totalArea - totalArea);
      if (p.hasParking === hasParking) score -= 800;
      if (p.facadeType === facadeType) score -= 500;
      return { project: p, score };
    });

    scored.sort((a, b) => a.score - b.score);
    const topMatches = scored.slice(0, 3).map(s => s.project);
    setMatchedProjects(topMatches);

    const avgSqmCost = topMatches.reduce((acc, curr) => acc + curr.costPerSqm, 0) / topMatches.length;
    const totalDb = Math.round(totalArea * avgSqmCost * kTer * kFacade * kPark);
    setDbCost(totalDb);

    setCalculated(true);
  };

  const deltaRub = dbCost - ncsCost;
  const deltaPercent = ncsCost > 0 ? ((deltaRub / ncsCost) * 100).toFixed(1) : '0';

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(val) + ' ₽';
  };

  // Витрина: берём 3 разноплановых проекта
  const showcaseProjects = [
    PROJECTS_DATABASE[0], // Сосновый Бор (Комфорт, монолит)
    PROJECTS_DATABASE[2], // На Озерной (Бизнес, монолит)
    PROJECTS_DATABASE[5], // Усадьба Изумруд (Индивидуальный, кирпич)
  ];

  return (
    <div className="min-h-screen text-[#0F172A]">
      {/* Хедер НИУ МГСУ */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-[#0F2850]">НИУ МГСУ</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              ИЦТМС • Оценка стоимости
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#calculator" className="hover:text-blue-900 transition">Калькулятор</a>
            <a href="#methodology" className="hover:text-blue-900 transition">Методика НЦС</a>
            <Link href="/catalog" className="hover:text-blue-900 transition flex items-center gap-1.5">
              База объектов <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <a href="#author" className="hover:text-blue-900 transition">Об авторе</a>
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

      {/* Hero-блок в сапфировом градиенте */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-14">
        <div className="bg-gradient-to-br from-[#E2ECF8] via-[#E8F0FA] to-[#D5E4F5] border border-blue-200/70 rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center justify-between shadow-xs">
          <div className="max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs text-xs font-semibold text-blue-900 mb-4 border border-blue-200/50">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Университетская расчётная модель
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#0B1E38] leading-[1.1]">
              Предварительная <br />
              <span className="font-semibold text-blue-950">оценка стоимости</span> <br />
              строительства
            </h1>
            <p className="mt-6 text-slate-600 text-base md:text-lg leading-relaxed">
              Инструмент сопоставления нормативов Минстроя России (НЦС) и фактических данных реестра объектов-аналогов в едином окне.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <a 
                href="#calculator"
                className="inline-flex items-center gap-3 bg-[#0F2850] text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-blue-900 transition shadow-md shadow-blue-950/10"
              >
                Рассчитать стоимость
                <span className="bg-white/20 p-1.5 rounded-full"><ArrowRight className="w-4 h-4" /></span>
              </a>
              <Link 
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-blue-950 hover:bg-blue-100/50 transition border border-blue-200/70"
              >
                Построенные дома ({PROJECTS_DATABASE.length})
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 h-[340px] md:h-[400px] rounded-2xl overflow-hidden relative shadow-xl border border-white/50">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" 
              alt="Архитектура" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/60 shadow-sm">
              <div className="text-xs text-blue-800 font-medium">Статистическая база</div>
              <div className="text-sm font-bold text-slate-900">НЦС 2026 + Верифицированные объекты</div>
            </div>
          </div>
        </div>
      </section>

      {/* Метрики */}
      <section id="methodology" className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider mb-4">
          МЕТОДОЛОГИЯ И АНАЛИТИКА
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-blue-100/80 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-800" />
            </div>
            <h3 className="font-semibold text-base mb-1 text-slate-900">База НЦС 2026</h3>
            <p className="text-xs text-slate-500 mb-6">Нормативы цены Минстроя РФ</p>
            <div className="text-3xl font-bold text-[#0F2850]">100%</div>
            <div className="text-xs text-slate-400 mt-1">актуальный базис</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-blue-100/80 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-blue-800" />
            </div>
            <h3 className="font-semibold text-base mb-1 text-slate-900">База аналогов</h3>
            <p className="text-xs text-slate-500 mb-6">Реестр фактических построек</p>
            <div className="text-3xl font-bold text-[#0F2850]">{PROJECTS_DATABASE.length}</div>
            <div className="text-xs text-slate-400 mt-1">жилых объектов</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-blue-100/80 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-blue-800" />
            </div>
            <h3 className="font-semibold text-base mb-1 text-slate-900">Сходимость моделей</h3>
            <p className="text-xs text-slate-500 mb-6">Точность ранней оценки</p>
            <div className="text-3xl font-bold text-[#0F2850]">±5–10%</div>
            <div className="text-xs text-slate-400 mt-1">доверительный интервал</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-blue-100/80 shadow-xs hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Calculator className="w-5 h-5 text-blue-800" />
            </div>
            <h3 className="font-semibold text-base mb-1 text-slate-900">Факторный расчёт</h3>
            <p className="text-xs text-slate-500 mb-6">Учёт конструкций, фасадов и этажей</p>
            <div className="text-3xl font-bold text-[#0F2850]">&lt; 1 сек</div>
            <div className="text-xs text-slate-400 mt-1">мгновенный вывод</div>
          </div>
        </div>
      </section>

      {/* Интерактивный Калькулятор с Segmented Cards */}
      <section id="calculator" className="max-w-7xl mx-auto px-6 py-10 scroll-mt-24">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-blue-100 shadow-sm">
          <div className="mb-8">
            <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">ПАРАМЕТРИЧЕСКИЙ РАСЧЁТ</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mt-1">
              Характеристики проектируемого здания
            </h2>
          </div>

          <form onSubmit={handleCalculate} className="space-y-8">
            {/* 1. Сегментированный выбор: Класс жилья */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Класс жилого комплекса
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'comfort', label: 'Комфорт-класс', desc: 'Базовый стандарт современного жилья' },
                  { id: 'business', label: 'Бизнес-класс', desc: 'Улучшенная инженерия и архитектура' },
                  { id: 'individual', label: 'Индивидуальный (Премиум)', desc: 'Авторские проекты и премиум-материалы' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBuildingClass(item.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      buildingClass === item.id
                        ? 'bg-blue-50/70 border-blue-600 text-blue-950 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-[#FBFDFF]'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Сегментированный выбор: Конструктивная схема */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Конструктивная схема несущего остова
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'monolith', label: 'Монолитный ж/б', desc: 'Каркасно-монолитная схема' },
                  { id: 'brick', label: 'Кирпичные стены', desc: 'Несущие кирпичные конструкции' },
                  { id: 'panel', label: 'Сборный ж/б (Панель)', desc: 'Индустриальное сборное домостроение' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStructureType(item.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      structureType === item.id
                        ? 'bg-blue-50/70 border-blue-600 text-blue-950 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-[#FBFDFF]'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Сегментированный выбор: Фасадная система */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Тип фасадной системы
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'plaster', label: 'Штукатурный фасад', desc: 'Базовый мокрый фасад (Кф = 1.0)' },
                  { id: 'ventilated', label: 'Навесной вентфасад (НВФ)', desc: 'Керамогранит / композит (+8%)' },
                  { id: 'clinker_glass', label: 'Клинкер / Витражи', desc: 'Светопрозрачные витражи (+15%)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFacadeType(item.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      facadeType === item.id
                        ? 'bg-blue-50/70 border-blue-600 text-blue-950 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-[#FBFDFF]'
                    }`}
                  >
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-snug">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Числовые параметры и локация */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Локация / Район</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  {Object.keys(DISTRICT_COEFFICIENTS).map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                  Общая площадь: <span className="text-blue-900 font-bold">{totalArea.toLocaleString('ru-RU')} м²</span>
                </label>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  value={totalArea}
                  onChange={(e) => setTotalArea(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                  Количество надземных этажей: <span className="text-blue-900 font-bold">{floors}</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                  required
                />
              </div>
            </div>

            {/* 5. Дополнительная опция: Паркинг + Кнопка */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
              <label className="flex items-center gap-3 p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl cursor-pointer w-full sm:w-auto hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  checked={hasParking}
                  onChange={(e) => setHasParking(e.target.checked)}
                  className="w-5 h-5 accent-blue-900 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold block text-slate-900">Подземный паркинг</span>
                  <span className="text-slate-500">Учитывать подземные уровни и гидроизоляцию (+12%)</span>
                </div>
              </label>

              <button
                type="submit"
                className="w-full sm:w-auto min-w-[260px] bg-[#0F2850] text-white py-4 px-8 rounded-2xl font-medium text-sm hover:bg-blue-900 transition flex items-center justify-center gap-2 shadow-md shadow-blue-950/15"
              >
                Выполнить расчет стоимости
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Результаты расчета со шкалой сравнения */}
          {calculated && (
            <div className="mt-12 pt-10 border-t border-slate-200">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">ИТОГОВЫЙ СМЕТНЫЙ ОТЧЕТ</span>
                  <h3 className="text-2xl font-semibold text-slate-900 mt-1">Сопоставление методик расчёта</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-semibold w-fit">
                  Расчёт выполнен по индексам 2026 г.
                </span>
              </div>

              {/* Визуальная шкала сравнения (Progress comparison) */}
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
                  <span>Государственный норматив</span>
                  <span>{deltaRub >= 0 ? `Рыночное удорожание (+${deltaPercent}%)` : `Ниже норматива (${deltaPercent}%)`}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Карточка 1: НЦС */}
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2">Метод 1: Нормативный</div>
                  <h4 className="text-lg font-semibold text-slate-900">По сборникам НЦС 2026</h4>
                  <div className="text-3xl font-bold text-slate-900 mt-4 mb-2">
                    {formatPrice(ncsCost)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Удельная стоимость: {formatPrice(Math.round(ncsCost / totalArea))} / м²
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                    <div>• Территориальный коэфф.: {DISTRICT_COEFFICIENTS[district]}</div>
                    <div>• Коэффициент этажности: {getFloorCoefficient(floors)}</div>
                    <div>• Фасадная надбавка: {FACADE_COEFFICIENTS[facadeType]}</div>
                    <div>• Подземная часть: {hasParking ? PARKING_COEFFICIENT : '1.0 (нет)'}</div>
                  </div>
                </div>

                {/* Карточка 2: База аналогов */}
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold uppercase text-slate-500 mb-2">Метод 2: Объекты-аналоги</div>
                  <h4 className="text-lg font-semibold text-slate-900">По фактическому рынку</h4>
                  <div className="text-3xl font-bold text-[#0F2850] mt-4 mb-2">
                    {formatPrice(dbCost)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Удельная стоимость: {formatPrice(Math.round(dbCost / totalArea))} / м²
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/60 text-xs text-slate-600 space-y-1">
                    <div>• Выборка: {matchedProjects.map(p => p.name).slice(0, 2).join(', ')}</div>
                    <div>• Фасад: {facadeType} | Паркинг: {hasParking ? 'Да' : 'Нет'}</div>
                    <div className="text-blue-700 font-medium pt-1">
                      <Link href="/catalog" className="hover:underline flex items-center gap-1">
                        Посмотреть аналоги в реестре <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Карточка 3: Сапфировая плашка дельты */}
                <div className="bg-gradient-to-br from-[#0B1E38] to-[#142B4E] text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg shadow-blue-950/20">
                  <div>
                    <div className="text-xs font-bold uppercase text-blue-200 mb-2">Сравнение методик</div>
                    <h4 className="text-lg font-semibold">Рыночное отклонение</h4>
                    <div className="text-3xl font-bold mt-4 mb-2 text-blue-300">
                      {deltaRub >= 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
                    </div>
                    <div className="text-xs text-slate-300">
                      Абсолютная разница: {formatPrice(deltaRub)}
                    </div>
                  </div>
                  <div className="text-xs text-blue-100/70 mt-6 pt-4 border-t border-white/10 leading-relaxed">
                    {deltaRub > 0 
                      ? 'Фактическая рыночная стоимость объектов превышает норматив Минстроя за счёт сопутствующих удорожаний материалов и инженерии.' 
                      : 'Нормативная база НЦС покрывает плановые затраты строительства с запасом.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Раздел: «Построенные дома и их стоимость» (Витрина на 3 объекта с переходом в полный список) */}
      <section id="database" className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">ПРИМЕРЫ ОБЪЕКТОВ</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mt-1">
              Построенные дома и их стоимость
            </h2>
            <p className="text-sm text-slate-500 mt-1">Выборка реализованных проектов для сравнительного анализа</p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-950 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition shadow-xs w-fit"
          >
            Смотреть все дома реестра ({PROJECTS_DATABASE.length})
            <ArrowRight className="w-4 h-4 text-blue-700" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showcaseProjects.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-blue-100/90 overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="h-52 overflow-hidden relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800">
                    {item.buildingClass}
                  </span>
                  {item.hasParking && (
                    <span className="bg-blue-950/80 backdrop-blur-md text-white px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1">
                      <Car className="w-3 h-3" /> Паркинг
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.district}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 text-slate-600 mb-4">
                  <div>Площадь: <span className="font-semibold text-slate-900">{item.totalArea.toLocaleString('ru-RU')} м²</span></div>
                  <div>Этажей: <span className="font-semibold text-slate-900">{item.floors}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Стоимость за м²</div>
                    <div className="text-base font-bold text-slate-900">{formatPrice(item.costPerSqm)}</div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatPrice(item.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Блок «Об авторе диплома» */}
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
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-50 px-3 py-1.5 rounded-lg text-blue-900 font-medium">НИУ МГСУ</span>
              <span className="bg-blue-50 px-3 py-1.5 rounded-lg text-blue-900 font-medium">Ценообразование в строительстве</span>
              <span className="bg-blue-50 px-3 py-1.5 rounded-lg text-blue-900 font-medium">Нормативы НЦС Минстроя</span>
              <span className="bg-blue-50 px-3 py-1.5 rounded-lg text-blue-900 font-medium">Next.js & TypeScript</span>
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
    </div>
  );
}