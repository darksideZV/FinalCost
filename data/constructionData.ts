export interface CostItem {
  name: string;
  amount: number;
  percent: number;
}

export interface BuildingProject {
  id: string;
  name: string;
  buildingClass: 'comfort' | 'business' | 'individual';
  structureType: string;
  floors: number;
  totalArea: number; // м²
  hasParking: boolean;
  facadeType: string;
  district: string;
  totalCost: number; // руб.
  costPerSqm: number; // руб./м²
  image: string;
  breakdown: CostItem[];
}

// Генератор реалистичной сметной структуры по параметрам
function generateBreakdown(total: number, hasParking: boolean, isHighEnd: boolean): CostItem[] {
  const pFoundation = isHighEnd ? 13 : 11;
  const pSkeleton = isHighEnd ? 28 : 34;
  const pFacade = isHighEnd ? 21 : 16;
  const pHvac = isHighEnd ? 19 : 17;
  const pMop = isHighEnd ? 9 : 6;
  const pSiteParking = hasParking ? (isHighEnd ? 10 : 16) : (isHighEnd ? 10 : 16);

  const sum = pFoundation + pSkeleton + pFacade + pHvac + pMop + pSiteParking;
  const norm = (p: number) => Math.round((p / sum) * 100);

  return [
    { name: 'Земляные работы и фундамент', percent: norm(pFoundation), amount: Math.round(total * (pFoundation / sum)) },
    { name: 'Несущий каркас и монолит', percent: norm(pSkeleton), amount: Math.round(total * (pSkeleton / sum)) },
    { name: 'Фасады и витражное остекление', percent: norm(pFacade), amount: Math.round(total * (pFacade / sum)) },
    { name: 'Инженерные сети и климат (ОВ/ВК/ЭОМ)', percent: norm(pHvac), amount: Math.round(total * (pHvac / sum)) },
    { name: 'Отделка МОП и входных групп', percent: norm(pMop), amount: Math.round(total * (pMop / sum)) },
    { name: hasParking ? 'Благоустройство и паркинг' : 'Благоустройство территории', percent: norm(pSiteParking), amount: Math.round(total * (pSiteParking / sum)) },
  ];
}

// РЕЕСТР ИЗ 40 ЖИЛЫХ КОМПЛЕКСОВ МОСКВЫ И МО
export const PROJECTS_DATABASE: BuildingProject[] = [
  // 1-10: Бизнес-класс (Москва)
  {
    id: 'pr-01',
    name: 'ЖК «Символ»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 24,
    totalArea: 22400,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'ЮВАО (г. Москва)',
    totalCost: 3136000000,
    costPerSqm: 140000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(3136000000, true, true)
  },
  {
    id: 'pr-02',
    name: 'ЖК «Сердце Столицы»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 36,
    totalArea: 38500,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'СЗАО (г. Москва)',
    totalCost: 5582500000,
    costPerSqm: 145000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(5582500000, true, true)
  },
  {
    id: 'pr-03',
    name: 'ЖК «Метрополия»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 30,
    totalArea: 28000,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЮВАО (г. Москва)',
    totalCost: 3780000000,
    costPerSqm: 135000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(3780000000, true, true)
  },
  {
    id: 'pr-04',
    name: 'ЖК «Событие»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 25,
    totalArea: 26000,
    hasParking: true,
    facadeType: 'combined_composite',
    district: 'ЗАО (г. Москва)',
    totalCost: 3900000000,
    costPerSqm: 150000,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(3900000000, true, true)
  },
  {
    id: 'pr-05',
    name: 'ЖК «D1 (Дмитровский)»',
    buildingClass: 'business',
    structureType: 'steel_frame',
    floors: 58,
    totalArea: 44000,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'САО (г. Москва)',
    totalCost: 6952000000,
    costPerSqm: 158000,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(6952000000, true, true)
  },
  {
    id: 'pr-06',
    name: 'ЖК «Headliner»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 53,
    totalArea: 49000,
    hasParking: true,
    facadeType: 'combined_composite',
    district: 'ЦАО (г. Москва)',
    totalCost: 7938000000,
    costPerSqm: 162000,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(7938000000, true, true)
  },
  {
    id: 'pr-07',
    name: 'ЖК «ЗИЛАРТ»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 14,
    totalArea: 18500,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЮАО (г. Москва)',
    totalCost: 2682500000,
    costPerSqm: 145000,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(2682500000, true, true)
  },
  {
    id: 'pr-08',
    name: 'ЖК «Level Причальный»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 32,
    totalArea: 31000,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'СЗАО (г. Москва)',
    totalCost: 4588000000,
    costPerSqm: 148000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(4588000000, true, true)
  },
  {
    id: 'pr-09',
    name: 'ЖК «Архитектор»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 46,
    totalArea: 39000,
    hasParking: true,
    facadeType: 'combined_composite',
    district: 'ЮЗАО (г. Москва)',
    totalCost: 5928000000,
    costPerSqm: 152000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(5928000000, true, true)
  },
  {
    id: 'pr-10',
    name: 'ЖК «Фили Сити»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 41,
    totalArea: 35000,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЗАО (г. Москва)',
    totalCost: 5250000000,
    costPerSqm: 150000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(5250000000, true, true)
  },

  // 11-20: Премиум и Элитные клубные дома
  {
    id: 'pr-11',
    name: 'Клубный дом «Река»',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 11,
    totalArea: 9500,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЗАО (г. Москва)',
    totalCost: 1805000000,
    costPerSqm: 190000,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1805000000, true, true)
  },
  {
    id: 'pr-12',
    name: 'ЖК «Prime Park»',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 39,
    totalArea: 42000,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'САО (г. Москва)',
    totalCost: 7770000000,
    costPerSqm: 185000,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(7770000000, true, true)
  },
  {
    id: 'pr-13',
    name: 'Резиденция «Life Time»',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 22,
    totalArea: 18000,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЦАО (г. Москва)',
    totalCost: 3780000000,
    costPerSqm: 210000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(3780000000, true, true)
  },
  {
    id: 'pr-14',
    name: 'ЖК «Остров» (Квартал 1)',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 8,
    totalArea: 12400,
    hasParking: true,
    facadeType: 'combined_composite',
    district: 'СЗАО (г. Москва)',
    totalCost: 2418000000,
    costPerSqm: 195000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(2418000000, true, true)
  },
  {
    id: 'pr-15',
    name: 'Клубный дом «Вишневый Сад»',
    buildingClass: 'individual',
    structureType: 'ceramic_block',
    floors: 8,
    totalArea: 8900,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЗАО (г. Москва)',
    totalCost: 1869000000,
    costPerSqm: 210000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1869000000, true, true)
  },
  {
    id: 'pr-16',
    name: 'ЖК «Hide» (1-й Сетуньский)',
    buildingClass: 'individual',
    structureType: 'steel_frame',
    floors: 41,
    totalArea: 32000,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'ЗАО (г. Москва)',
    totalCost: 6240000000,
    costPerSqm: 195000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(6240000000, true, true)
  },
  {
    id: 'pr-17',
    name: 'Резиденция «Садовые Кварталы»',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 14,
    totalArea: 15600,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЦАО (г. Москва)',
    totalCost: 3510000000,
    costPerSqm: 225000,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(3510000000, true, true)
  },
  {
    id: 'pr-18',
    name: 'ЖК «LUCKY (Лаки)»',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 21,
    totalArea: 21000,
    hasParking: true,
    facadeType: 'combined_composite',
    district: 'ЦАО (г. Москва)',
    totalCost: 4620000000,
    costPerSqm: 220000,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(4620000000, true, true)
  },
  {
    id: 'pr-19',
    name: 'Вилла-усадьба «Миллениум Парк»',
    buildingClass: 'individual',
    structureType: 'brick',
    floors: 2,
    totalArea: 680,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'Новорижское шоссе (МО)',
    totalCost: 122400000,
    costPerSqm: 180000,
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(122400000, true, true)
  },
  {
    id: 'pr-20',
    name: 'Особняк «Барвиха Luxury»',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 3,
    totalArea: 920,
    hasParking: true,
    facadeType: 'combined_composite',
    district: 'Рублево-Успенское ш. (МО)',
    totalCost: 202400000,
    costPerSqm: 220000,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(202400000, true, true)
  },

  // 21-30: Комфорт-класс (Москва и Новая Москва)
  {
    id: 'pr-21',
    name: 'ЖК «Люблинский Парк»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 25,
    totalArea: 24500,
    hasParking: false,
    facadeType: 'plaster',
    district: 'ЮВАО (г. Москва)',
    totalCost: 2009000000,
    costPerSqm: 82000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(2009000000, false, false)
  },
  {
    id: 'pr-22',
    name: 'ЖК «Саларьево Парк»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 22,
    totalArea: 21000,
    hasParking: false,
    facadeType: 'ventilated_porcelain',
    district: 'Новая Москва (ТиНАО)',
    totalCost: 1785000000,
    costPerSqm: 85000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1785000000, false, false)
  },
  {
    id: 'pr-23',
    name: 'ЖК «Мякинино Парк»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 15,
    totalArea: 14500,
    hasParking: false,
    facadeType: 'plaster',
    district: 'ЗАО (г. Москва)',
    totalCost: 1247000000,
    costPerSqm: 86000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1247000000, false, false)
  },
  {
    id: 'pr-24',
    name: 'ЖК «Бунинские Луга»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 17,
    totalArea: 16800,
    hasParking: false,
    facadeType: 'ventilated_porcelain',
    district: 'Новая Москва (ТиНАО)',
    totalCost: 1411200000,
    costPerSqm: 84000,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1411200000, false, false)
  },
  {
    id: 'pr-25',
    name: 'ЖК «Зеленый Квартал»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 9,
    totalArea: 8400,
    hasParking: true,
    facadeType: 'ventilated_porcelain',
    district: 'СВАО (г. Москва)',
    totalCost: 789600000,
    costPerSqm: 94000,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(789600000, true, false)
  },
  {
    id: 'pr-26',
    name: 'ЖК «Измайловский Лес»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 25,
    totalArea: 23000,
    hasParking: false,
    facadeType: 'plaster',
    district: 'ВАО (г. Москва)',
    totalCost: 1886000000,
    costPerSqm: 82000,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1886000000, false, false)
  },
  {
    id: 'pr-27',
    name: 'ЖК «Ярославский Квартал»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 16,
    totalArea: 15200,
    hasParking: true,
    facadeType: 'ventilated_porcelain',
    district: 'СВАО (г. Москва)',
    totalCost: 1474400000,
    costPerSqm: 97000,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1474400000, true, false)
  },
  {
    id: 'pr-28',
    name: 'ЖК «Испанские Кварталы»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 14,
    totalArea: 13800,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'Новая Москва (ТиНАО)',
    totalCost: 1393800000,
    costPerSqm: 101000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1393800000, true, false)
  },
  {
    id: 'pr-29',
    name: 'ЖК «Скандинавия»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 12,
    totalArea: 12500,
    hasParking: true,
    facadeType: 'ventilated_porcelain',
    district: 'Новая Москва (ТиНАО)',
    totalCost: 1225000000,
    costPerSqm: 98000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1225000000, true, false)
  },
  {
    id: 'pr-30',
    name: 'ЖК «Белая Дача Парк»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 25,
    totalArea: 25000,
    hasParking: false,
    facadeType: 'plaster',
    district: 'ЮВАО (г. Москва)',
    totalCost: 2025000000,
    costPerSqm: 81000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(2025000000, false, false)
  },

  // 31-40: Разноплановые объекты (Кирпич, Керамоблок, Север МО, Резиденции)
  {
    id: 'pr-31',
    name: 'ЖК «Кирпичная Слобода»',
    buildingClass: 'comfort',
    structureType: 'brick',
    floors: 5,
    totalArea: 3100,
    hasParking: false,
    facadeType: 'plaster',
    district: 'Московская область (Север)',
    totalCost: 263500000,
    costPerSqm: 85000,
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(263500000, false, false)
  },
  {
    id: 'pr-32',
    name: 'ЖК «Покровский Берег»',
    buildingClass: 'business',
    structureType: 'brick',
    floors: 6,
    totalArea: 5800,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'СЗАО (г. Москва)',
    totalCost: 812000000,
    costPerSqm: 140000,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(812000000, true, true)
  },
  {
    id: 'pr-33',
    name: 'Клубный квартал «Сколково Парк»',
    buildingClass: 'individual',
    structureType: 'ceramic_block',
    floors: 6,
    totalArea: 7200,
    hasParking: true,
    facadeType: 'clinker_stone',
    district: 'ЗАО (г. Москва)',
    totalCost: 1440000000,
    costPerSqm: 200000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1440000000, true, true)
  },
  {
    id: 'pr-34',
    name: 'ЖК «Дмитровский Посад»',
    buildingClass: 'comfort',
    structureType: 'brick',
    floors: 4,
    totalArea: 2900,
    hasParking: false,
    facadeType: 'plaster',
    district: 'Московская область (Север)',
    totalCost: 243600000,
    costPerSqm: 84000,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(243600000, false, false)
  },
  {
    id: 'pr-35',
    name: 'ЖК «Крылатские Огни»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 28,
    totalArea: 25500,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'ЗАО (г. Москва)',
    totalCost: 3825000000,
    costPerSqm: 150000,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(3825000000, true, true)
  },
  {
    id: 'pr-36',
    name: 'Резиденция «Павлово Подворье»',
    buildingClass: 'individual',
    structureType: 'ceramic_block',
    floors: 3,
    totalArea: 850,
    hasParking: true,
    facadeType: 'combined_composite',
    district: 'Новорижское шоссе (МО)',
    totalCost: 161500000,
    costPerSqm: 190000,
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(161500000, true, true)
  },
  {
    id: 'pr-37',
    name: 'ЖК «Одинбург»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 24,
    totalArea: 22000,
    hasParking: true,
    facadeType: 'ventilated_porcelain',
    district: 'Московская область (Север)',
    totalCost: 1980000000,
    costPerSqm: 90000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1980000000, true, false)
  },
  {
    id: 'pr-38',
    name: 'ЖК «Мытищи Лайт»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 7,
    totalArea: 7500,
    hasParking: false,
    facadeType: 'plaster',
    district: 'Московская область (Север)',
    totalCost: 652500000,
    costPerSqm: 87000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(652500000, false, false)
  },
  {
    id: 'pr-39',
    name: 'ЖК «Татьянин Парк»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 17,
    totalArea: 17500,
    hasParking: true,
    facadeType: 'ventilated_porcelain',
    district: 'Новая Москва (ТиНАО)',
    totalCost: 1680000000,
    costPerSqm: 96000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(1680000000, true, false)
  },
  {
    id: 'pr-40',
    name: 'Башня «Sky Garden»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 43,
    totalArea: 37000,
    hasParking: true,
    facadeType: 'stained_glass',
    district: 'СЗАО (г. Москва)',
    totalCost: 5624000000,
    costPerSqm: 152000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    breakdown: generateBreakdown(5624000000, true, true)
  }
];

// Базовые ставки НЦС Минстроя (руб./м²)
export const NCS_BASE_RATES: Record<string, Record<string, number>> = {
  monolith: { comfort: 86000, business: 122000, individual: 140000 },
  panel: { comfort: 76000, business: 98000, individual: 105000 },
  brick: { comfort: 81000, business: 115000, individual: 132000 },
  ceramic_block: { comfort: 89000, business: 126000, individual: 144000 },
  steel_frame: { comfort: 93000, business: 131000, individual: 152000 },
};

// Территориальные коэффициенты
export const DISTRICT_COEFFICIENTS: Record<string, number> = {
  'ЦАО (г. Москва)': 1.25,
  'ЗАО (г. Москва)': 1.18,
  'СЗАО (г. Москва)': 1.14,
  'САО (г. Москва)': 1.12,
  'СВАО (г. Москва)': 1.10,
  'ЮАО (г. Москва)': 1.10,
  'ЮЗАО (г. Москва)': 1.15,
  'ЮВАО (г. Москва)': 1.08,
  'ВАО (г. Москва)': 1.08,
  'Новая Москва (ТиНАО)': 1.05,
  'Новорижское шоссе (МО)': 1.15,
  'Рублево-Успенское ш. (МО)': 1.22,
  'Московская область (Север)': 1.0,
};

// 1. Фасады
export const FACADE_OPTIONS = [
  { id: 'plaster', name: 'Штукатурный фасад («мокрый» по утеплителю)', coef: 1.0 },
  { id: 'ventilated_porcelain', name: 'НВФ: керамогранит / фиброцемент', coef: 1.07 },
  { id: 'clinker_stone', name: 'НВФ: клинкерный кирпич / натур. камень', coef: 1.13 },
  { id: 'stained_glass', name: 'Сплошное стоечно-ригельное витражное остекление', coef: 1.18 },
  { id: 'combined_composite', name: 'Комбинированный фасад: витражи + терракота', coef: 1.22 },
];

// 2. Конструктив остова
export const STRUCTURE_OPTIONS = [
  { id: 'monolith', name: 'Монолитный железобетонный каркас', coef: 1.0 },
  { id: 'panel', name: 'Сборный железобетон (индустриальная панель)', coef: 0.90 },
  { id: 'brick', name: 'Несущие кирпичные стены', coef: 0.95 },
  { id: 'ceramic_block', name: 'Монолитный каркас с заполнением крупноформатными керамоблоками', coef: 1.05 },
  { id: 'steel_frame', name: 'Стальной каркас с композитными перекрытиями', coef: 1.09 },
];

// 3. Остекление
export const GLAZING_OPTIONS = [
  { id: 'pvc_standard', name: 'Стандартный ПВХ-профиль (2-камерный стеклопакет)', coef: 1.0 },
  { id: 'pvc_premium', name: 'Энергоэффективный ПВХ с кашировкой / ламинацией', coef: 1.03 },
  { id: 'aluminum_warm', name: 'Теплый алюминиевый профиль (панорамный в пол)', coef: 1.07 },
  { id: 'wood_aluminum', name: 'Дерево-алюминиевые оконные блоки', coef: 1.11 },
  { id: 'smart_glass', name: 'Мультифункциональное смарт-остекление с защитой от солнца', coef: 1.14 },
];

// 4. Балконы и лоджии
export const BALCONY_OPTIONS = [
  { id: 'none_french', name: 'Без выступающих балконов (французские ограждения)', coef: 1.0 },
  { id: 'cold_loggia', name: 'Холодное остекление лоджий (алюминий)', coef: 1.02 },
  { id: 'warm_panoramic', name: 'Теплые панорамные остекленные лоджии', coef: 1.05 },
  { id: 'cantilever_balcony', name: 'Консольные открытые балконы с ограждением из триплекса', coef: 1.07 },
  { id: 'terrace_deck', name: 'Эксплуатируемые террасы с настилом из термодерева/плитки', coef: 1.10 },
];

// 5. Конструкция кровли
export const ROOF_OPTIONS = [
  { id: 'flat_bitumen', name: 'Плоская рулонная битумно-полимерная', coef: 1.0 },
  { id: 'flat_membrane', name: 'Плоская инверсионная мембранная кровля (ПВХ/ТПО)', coef: 1.03 },
  { id: 'flat_usable', name: 'Плоская эксплуатируемая кровля (лаунж, озеленение)', coef: 1.08 },
  { id: 'pitched_metal', name: 'Скатная кровля (фальцевая сталь / металлочерепица)', coef: 1.04 },
  { id: 'pitched_ceramic', name: 'Скатная кровля из натуральной керамической черепицы', coef: 1.09 },
];

// 6. Отделка МОП
export const FINISH_MOP_OPTIONS = [
  { id: 'basic_paint', name: 'Стандарт (покраска стен, базовый керамогранит)', coef: 1.0 },
  { id: 'comfort_deco', name: 'Комфорт (декоративная штукатурка, скрытая LED-подсветка)', coef: 1.03 },
  { id: 'business_panel', name: 'Бизнес (дизайнерские стеновые панели, широкоформатный керамогранит)', coef: 1.07 },
  { id: 'premium_marble', name: 'Премиум (натуральный мрамор, шпон, декоративная латунь)', coef: 1.12 },
  { id: 'club_furnished', name: 'Клубный лобби (полная меблировка, ресепшн, акустические панели)', coef: 1.16 },
];

// 7. Инженерия и климат
export const HVAC_OPTIONS = [
  { id: 'basic_nat', name: 'Естественная вентиляция + центральное отопление', coef: 1.0 },
  { id: 'mech_split', name: 'Механическая вытяжка + корзины под сплит-системы', coef: 1.03 },
  { id: 'central_vrv', name: 'Центральное кондиционирование (VRV/VRF-системы)', coef: 1.08 },
  { id: 'supply_exhaust', name: 'Приточно-вытяжная вентиляция с рекуперацией и тонкой очисткой', coef: 1.12 },
  { id: 'bms_smart', name: 'Интеллектуальное здание (BMS-диспетчеризация, климат-контроль)', coef: 1.16 },
];

// 8. Благоустройство
export const LANDSCAPE_OPTIONS = [
  { id: 'municipal', name: 'Муниципальный стандарт (асфальт, газон, базовые МАФ)', coef: 1.01 },
  { id: 'comfort_yard', name: 'Комфорт (брусчатка, зонирование, детские городки)', coef: 1.04 },
  { id: 'car_free', name: 'Концепция «Двор без машин», безбарьерная среда, воркаут', coef: 1.07 },
  { id: 'designer_landscape', name: 'Авторский ландшафт (геопластика, деревья-крупномеры, многоуровневый свет)', coef: 1.11 },
  { id: 'private_park', name: 'Приватный парк с искусственными водоемами и амфитеатром', coef: 1.15 },
];

export const PARKING_COEFFICIENT = 1.12;

export function getFloorCoefficient(floors: number): number {
  if (floors <= 3) return 1.05;
  if (floors <= 9) return 1.0;
  if (floors <= 16) return 1.06;
  return 1.14;
}