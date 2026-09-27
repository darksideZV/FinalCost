'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Calculator, 
  TrendingUp, 
  MapPin,
  Car,
  Layers,
  Sparkles
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
  const [totalArea, setTotalArea] = useState<number>(4500);
  const [floors, setFloors] = useState<number>(9);
  const [district, setDistrict] = useState<string>('СВАО (г. Москва)');
  const [facadeType, setFacadeType] = useState<'plaster' | 'ventilated' | 'clinker_glass'>('ventilated');
  const [hasParking, setHasParking] = useState<boolean>(false);

  const [calculated, setCalculated] = useState(false);
  const [ncsCost, setNcsCost] = useState<number>(0);
  const [dbCost, setDbCost] = useState<number>(0);
  const [matchedProjects, setMatchedProjects] = useState<typeof PROJECTS_DATABASE>([]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Расчёт по НЦС с новыми коэффициентами
    const baseRate = NCS_BASE_RATES[structureType][buildingClass];
    const kTer = DISTRICT_COEFFICIENTS[district] || 1.0;
    const kFl = getFloorCoefficient(floors);
    const kFacade = FACADE_COEFFICIENTS[facadeType];
    const kPark = hasParking ? PARKING_COEFFICIENT : 1.0;

    const totalNcs = Math.round(totalArea * baseRate * kTer * kFl * kFacade * kPark);
    setNcsCost(totalNcs);

    // 2. Расчёт по базе объектов-аналогов с учётом новых характеристик
    let directMatches = PROJECTS_DATABASE.filter(
      p => p.buildingClass === buildingClass && p.structureType === structureType
    );
    if (directMatches.length === 0) directMatches = PROJECTS_DATABASE;

    // Взвешенная сортировка: совпадение по паркингу, фасаду и площади
    const scored = directMatches.map(p => {
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121316]">
      {/* Хедер */}
      <header className="sticky top-0 z-50 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-[#EAECEF]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-[#121316]">ЭСТ</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
              Калькулятор стоимости
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#calculator" className="hover:text-black transition">Калькулятор</a>
            <a href="#methodology" className="hover:text-black transition">Методика НЦС</a>
            <a href="#database" className="hover:text-black transition">База объектов ({PROJECTS_DATABASE.length})</a>
            <a href="#author" className="hover:text-black transition">Об авторе</a>
          </nav>

          <a 
            href="#calculator"
            className="inline-flex items-center gap-2 bg-[#121316] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition"
          >
            Рассчитать проект
            <span className="bg-white/20 p-1 rounded-full"><ArrowRight className="w-3.5 h-3.5" /></span>
          </a>
        </div>
      </header>

      {/* Hero-блок */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="bg-[#EBECEE] rounded-3xl p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row gap-12 items-center justify-between">
          <div className="max-w-xl z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#121316] leading-[1.1]">
              Предварительная <br />
              <span className="font-semibold">оценка стоимости</span> <br />
              строительства
            </h1>
            <p className="mt-6 text-neutral-600 text-base md:text-lg leading-relaxed">
              Многофакторное сопоставление нормативов НЦС Минстроя России и фактической базы объектов-аналогов в режиме реального времени.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <a 
                href="#calculator"
                className="inline-flex items-center gap-3 bg-[#121316] text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-neutral-800 transition shadow-lg"
              >
                Рассчитать стоимость
                <span className="bg-white/20 p-1.5 rounded-full"><ArrowRight className="w-4 h-4" /></span>
              </a>
              <a 
                href="#database"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-neutral-800 hover:bg-black/5 transition"
              >
                Смотреть базу ({PROJECTS_DATABASE.length})
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 h-[340px] md:h-[420px] rounded-2xl overflow-hidden relative shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" 
              alt="Архитектура" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/40 shadow-sm">
              <div className="text-xs text-neutral-500">Реестр 2026 года</div>
              <div className="text-sm font-semibold text-neutral-900">{PROJECTS_DATABASE.length} верифицированных проектов</div>
            </div>
          </div>
        </div>
      </section>

      {/* Метрики */}
      <section id="methodology" className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-3">
          МЕТОДОЛОГИЯ И ТОЧНОСТЬ
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-neutral-800" />
            </div>
            <h3 className="font-semibold text-base mb-1">База НЦС 2026</h3>
            <p className="text-xs text-neutral-500 mb-6">Нормативы цены строительства Минстроя</p>
            <div className="text-3xl font-bold text-neutral-900">100%</div>
            <div className="text-xs text-neutral-400 mt-1">актуальная база</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-neutral-800" />
            </div>
            <h3 className="font-semibold text-base mb-1">Объекты-аналоги</h3>
            <p className="text-xs text-neutral-500 mb-6">Фактическая база проектных решений</p>
            <div className="text-3xl font-bold text-neutral-900">{PROJECTS_DATABASE.length}</div>
            <div className="text-xs text-neutral-400 mt-1">жилых комплексов</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-neutral-800" />
            </div>
            <h3 className="font-semibold text-base mb-1">Анализ дельты</h3>
            <p className="text-xs text-neutral-500 mb-6">Учёт фасадов, паркинга и локации</p>
            <div className="text-3xl font-bold text-neutral-900">±5-10%</div>
            <div className="text-xs text-neutral-400 mt-1">точность модели</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4">
              <Calculator className="w-5 h-5 text-neutral-800" />
            </div>
            <h3 className="font-semibold text-base mb-1">Факторный расчёт</h3>
            <p className="text-xs text-neutral-500 mb-6">Автоматическая нормализация</p>
            <div className="text-3xl font-bold text-neutral-900">7</div>
            <div className="text-xs text-neutral-400 mt-1">входных параметров</div>
          </div>
        </div>
      </section>

      {/* Форма расширенного калькулятора */}
      <section id="calculator" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200/80 shadow-sm">
          <div className="mb-8">
            <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">ОНЛАЙН-РАСЧЕТ</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mt-1">
              Параметры проектируемого здания
            </h2>
          </div>

          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Класс дома */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Класс жилья</label>
              <select
                value={buildingClass}
                onChange={(e) => setBuildingClass(e.target.value as any)}
                className="w-full bg-[#F8F9FA] border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="comfort">Комфорт-класс</option>
                <option value="business">Бизнес-класс</option>
                <option value="individual">Индивидуальный (Премиум)</option>
              </select>
            </div>

            {/* 2. Конструктивная схема */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Конструктивная схема</label>
              <select
                value={structureType}
                onChange={(e) => setStructureType(e.target.value as any)}
                className="w-full bg-[#F8F9FA] border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="monolith">Монолитный железобетон</option>
                <option value="brick">Кирпичные конструкции</option>
                <option value="panel">Сборный ж/б (панель)</option>
              </select>
            </div>

            {/* 3. Район */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Локация / Район</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#F8F9FA] border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {Object.keys(DISTRICT_COEFFICIENTS).map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* 4. Тип фасада (Новый параметр) */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Тип фасадной системы</label>
              <select
                value={facadeType}
                onChange={(e) => setFacadeType(e.target.value as any)}
                className="w-full bg-[#F8F9FA] border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="plaster">Штукатурный фасад (базовый)</option>
                <option value="ventilated">Навесной вентфасад (НВФ +8%)</option>
                <option value="clinker_glass">Клинкер / Витражное остекление (+15%)</option>
              </select>
            </div>

            {/* 5. Общая площадь */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Общая площадь (м²)</label>
              <input
                type="number"
                min="100"
                max="50000"
                value={totalArea}
                onChange={(e) => setTotalArea(Number(e.target.value))}
                className="w-full bg-[#F8F9FA] border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="4500"
                required
              />
            </div>

            {/* 6. Этажность */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Количество этажей</label>
              <input
                type="number"
                min="1"
                max="50"
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
                className="w-full bg-[#F8F9FA] border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="9"
                required
              />
            </div>

            {/* 7. Подземный паркинг (Новый параметр-тумблер) */}
            <div className="flex items-center gap-3 p-4 bg-[#F8F9FA] border border-neutral-200 rounded-xl">
              <input
                type="checkbox"
                id="parkingCheck"
                checked={hasParking}
                onChange={(e) => setHasParking(e.target.checked)}
                className="w-5 h-5 accent-neutral-900 rounded cursor-pointer"
              />
              <label htmlFor="parkingCheck" className="text-xs font-medium text-neutral-800 cursor-pointer select-none">
                <span className="font-semibold block">Подземный паркинг</span>
                <span className="text-neutral-500">Учитывать подземные этажи (+12%)</span>
              </label>
            </div>

            {/* Кнопка расчета */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full bg-[#121316] text-white py-3.5 px-6 rounded-xl font-medium text-sm hover:bg-neutral-800 transition flex items-center justify-center gap-2"
              >
                Выполнить расчет стоимости
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Результаты расчета */}
          {calculated && (
            <div className="mt-12 pt-10 border-t border-neutral-100">
              <div className="mb-6">
                <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">ИТОГОВЫЙ ОТЧЕТ</span>
                <h3 className="text-2xl font-semibold text-neutral-900 mt-1">Сопоставление методик расчёта</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Карточка НЦС */}
                <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-neutral-200/70">
                  <div className="text-xs font-bold uppercase text-neutral-500 mb-2">Вариант 1 (Норматив)</div>
                  <h4 className="text-lg font-semibold text-neutral-900">По сборникам НЦС</h4>
                  <div className="text-3xl font-bold text-neutral-900 mt-4 mb-2">
                    {formatPrice(ncsCost)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Удельная ставка: {formatPrice(Math.round(ncsCost / totalArea))} / м²
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200/50 text-xs text-neutral-600 space-y-1">
                    <div>• Ктер района: {DISTRICT_COEFFICIENTS[district]}</div>
                    <div>• Кэт этажности: {getFloorCoefficient(floors)}</div>
                    <div>• Кфас фасада: {FACADE_COEFFICIENTS[facadeType]}</div>
                    <div>• Кпарк: {hasParking ? PARKING_COEFFICIENT : 1.0}</div>
                  </div>
                </div>

                {/* Карточка Базы данных */}
                <div className="bg-[#F8F9FA] p-6 rounded-2xl border border-neutral-200/70">
                  <div className="text-xs font-bold uppercase text-neutral-500 mb-2">Вариант 2 (Фактический рынок)</div>
                  <h4 className="text-lg font-semibold text-neutral-900">По базе объектов-аналогов</h4>
                  <div className="text-3xl font-bold text-neutral-900 mt-4 mb-2">
                    {formatPrice(dbCost)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Удельная ставка: {formatPrice(Math.round(dbCost / totalArea))} / м²
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200/50 text-xs text-neutral-600 space-y-1">
                    <div>• Топ-3 аналога: {matchedProjects.map(p => p.name).join(', ')}</div>
                    <div>• Учтено: фасад ({facadeType}), паркинг ({hasParking ? 'да' : 'нет'})</div>
                  </div>
                </div>

                {/* Сравнение и Дельта */}
                <div className="bg-[#121316] text-white p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase text-neutral-400 mb-2">Сравнение показателей</div>
                    <h4 className="text-lg font-semibold">Рыночное отклонение</h4>
                    <div className="text-3xl font-bold mt-4 mb-2 text-emerald-400">
                      {deltaRub >= 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
                    </div>
                    <div className="text-xs text-neutral-300">
                      Разница: {formatPrice(deltaRub)}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400 mt-4 pt-4 border-t border-neutral-800">
                    {deltaRub > 0 
                      ? 'Фактическая рыночная стоимость превышает норматив НЦС за счёт рыночных факторов и сопутствующих решений.' 
                      : 'Нормативная база НЦС полностью покрывает сметные расходы.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Каталог объектов-аналогов (Выводим всю базу из 10 объектов) */}
      <section id="database" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">ЭТАЛОННАЯ БАЗА</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mt-1">
              Реестр объектов-аналогов ({PROJECTS_DATABASE.length})
            </h2>
          </div>
          <span className="text-xs font-medium text-neutral-500">Данные верифицированы</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS_DATABASE.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="h-52 overflow-hidden relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-800">
                    {item.buildingClass}
                  </span>
                  {item.hasParking && (
                    <span className="bg-black/75 backdrop-blur-md text-white px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1">
                      <Car className="w-3 h-3" /> Паркинг
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg text-neutral-900 mb-2">{item.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.district}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-neutral-100 text-neutral-600 mb-4">
                  <div>Площадь: <span className="font-semibold text-neutral-900">{item.totalArea} м²</span></div>
                  <div>Этажей: <span className="font-semibold text-neutral-900">{item.floors}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-400">Стоимость за м²</div>
                    <div className="text-base font-bold text-neutral-900">{formatPrice(item.costPerSqm)}</div>
                  </div>
                  <span className="text-xs font-semibold text-neutral-500">
                    {formatPrice(item.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* О разработчике */}
      <section id="author" className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200/80">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">О РАЗРАБОТЧИКЕ</span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 mt-2 mb-4">
              Сливин Роман Алексеевич
            </h2>
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-6">
              Студент Национального исследовательского Московского государственного строительного университета (НИУ МГСУ), Институт цифровых технологий и моделирования в строительстве (ИЦТМС).
            </p>
            <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-neutral-200/60 mb-6">
              <div className="text-xs font-semibold uppercase text-neutral-500 mb-1">Тема дипломного проекта</div>
              <div className="text-sm font-medium text-neutral-900">
                «Разработка модели прогноза предварительной стоимости строительства на основе данных о проекте»
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700 font-medium">Ценообразование в строительстве</span>
              <span className="bg-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700 font-medium">Нормативы НЦС Минстроя</span>
              <span className="bg-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700 font-medium">Next.js & TypeScript</span>
              <span className="bg-neutral-100 px-3 py-1.5 rounded-lg text-neutral-700 font-medium">BIM & Сметный анализ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-[#121316] text-white mt-16 py-12 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black tracking-tight">ЭСТ</span>
            <span className="text-xs text-neutral-400">
              Сервис предварительной оценки стоимости строительства зданий
            </span>
          </div>
          <div className="text-xs text-neutral-500">
            © 2026 Сливин Р. А. Все права защищены. Дипломный проект НИУ МГСУ.
          </div>
        </div>
      </footer>
    </div>
  );
}