'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Car, Search, Building2, ChevronDown, ChevronUp, Layers, PieChart } from 'lucide-react';
import { PROJECTS_DATABASE } from '../../data/constructionData';

export default function CatalogPage() {
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Состояние раскрытых смет для каждого дома
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  const filteredProjects = PROJECTS_DATABASE.filter(p => {
    const matchesClass = filterClass === 'all' || p.buildingClass === filterClass;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(val) + ' ₽';
  };

  return (
    <div className="min-h-screen text-[#0F172A] pb-16">
      {/* Навигационный хедер */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:text-blue-700 transition">
            <ArrowLeft className="w-4 h-4" /> Вернуться к калькулятору
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#0F2850]">НИУ МГСУ</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-medium">Реестр: 40 объектов</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">ВЕРИФИЦИРОВАННЫЙ РЕЕСТР</span>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mt-1">
              Построенные дома и их сметная стоимость ({PROJECTS_DATABASE.length})
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              База проектных аналогов с детализированной структурой затрат по технологическим разделам
            </p>
          </div>

          {/* Панель поиска и фильтров */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по ЖК или району..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-blue-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-60 shadow-xs text-slate-900"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-blue-100 shadow-xs">
              {[
                { id: 'all', label: 'Все (40)' },
                { id: 'business', label: 'Бизнес' },
                { id: 'individual', label: 'Премиум' },
                { id: 'comfort', label: 'Комфорт' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterClass(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filterClass === tab.id 
                      ? 'bg-[#0F2850] text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Сетка объектов */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800">Объекты не найдены</h3>
            <p className="text-xs text-slate-400 mt-1">Попробуйте изменить поисковый запрос</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((item) => {
              const isExpanded = expandedProjectId === item.id;
              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-blue-100/90 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="h-56 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800">
                          {item.buildingClass.toUpperCase()}
                        </span>
                        {item.hasParking && (
                          <span className="bg-blue-950/80 backdrop-blur-md text-white px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1">
                            <Car className="w-3 h-3" /> Паркинг
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-slate-900 mb-1">{item.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.district}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100 text-slate-600 mb-4">
                        <div>Площадь: <span className="font-semibold text-slate-900">{item.totalArea.toLocaleString('ru-RU')} м²</span></div>
                        <div>Этажность: <span className="font-semibold text-slate-900">{item.floors} эт.</span></div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[11px] text-slate-400">Стоимость за м²</div>
                          <div className="text-base font-bold text-slate-900">{formatPrice(item.costPerSqm)}</div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                          {formatPrice(item.totalCost)}
                        </span>
                      </div>

                      {/* Кнопка раскрытия структуры затрат */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          isExpanded 
                            ? 'bg-[#0F2850] text-white shadow-xs' 
                            : 'bg-blue-50/70 hover:bg-blue-100 text-blue-950 border border-blue-200/60'
                        }`}
                      >
                        <PieChart className="w-3.5 h-3.5" />
                        {isExpanded ? 'Скрыть сметный срез' : 'Сметный срез объекта (на что потрачено)'}
                        {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                      </button>

                      {/* Раскрывающийся сметный срез */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 bg-[#F8FAFC] p-3.5 rounded-xl">
                          <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                            Постатейная структура прямых затрат:
                          </div>

                          {item.breakdown.map((costItem, cIdx) => (
                            <div key={cIdx} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-700 font-medium">{costItem.name}</span>
                                <span className="text-slate-900 font-bold">
                                  {costItem.percent}% <span className="text-slate-400 font-normal">({formatPrice(costItem.amount)})</span>
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-700 rounded-full" 
                                  style={{ width: `${costItem.percent}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}