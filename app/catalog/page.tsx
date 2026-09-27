'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Car, Filter } from 'lucide-react';
import { PROJECTS_DATABASE } from '../../data/constructionData';

export default function CatalogPage() {
  const [filterClass, setFilterClass] = useState<string>('all');

  const filteredProjects = filterClass === 'all' 
    ? PROJECTS_DATABASE 
    : PROJECTS_DATABASE.filter(p => p.buildingClass === filterClass);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(val) + ' ₽';
  };

  return (
    <div className="min-h-screen text-[#0F172A] pb-16">
      {/* Навигационный хедер */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:text-blue-700 transition">
            <ArrowLeft className="w-4 h-4" /> На главную к калькулятору
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#0F2850]">НИУ МГСУ</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-medium">Реестр объектов</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-semibold text-blue-900/60 tracking-wider">БАЗА ОБЪЕКТОВ-АНАЛОГОВ</span>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mt-1">
              Построенные дома и их стоимость
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Полный реестр проектов с подтвержденной сметной стоимостью строительства
            </p>
          </div>

          {/* Фильтры по классу */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-blue-100 shadow-xs">
            {[
              { id: 'all', label: 'Все объекты' },
              { id: 'comfort', label: 'Комфорт' },
              { id: 'business', label: 'Бизнес' },
              { id: 'individual', label: 'Премиум' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterClass(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
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

        {/* Сетка всех объектов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-blue-100/90 overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="h-56 overflow-hidden relative">
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
                  <div>Конструкция: <span className="font-semibold text-slate-900">{item.structureType}</span></div>
                  <div>Фасад: <span className="font-semibold text-slate-900">{item.facadeType}</span></div>
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
      </main>
    </div>
  );
}