export interface BuildingProject {
  id: string;
  name: string;
  buildingClass: 'comfort' | 'business' | 'individual';
  structureType: 'monolith' | 'brick' | 'panel';
  floors: number;
  totalArea: number; // м²
  hasParking: boolean;
  facadeType: 'plaster' | 'ventilated' | 'clinker_glass';
  district: string;
  totalCost: number; // руб.
  costPerSqm: number; // руб./м²
  image: string;
}

export const PROJECTS_DATABASE: BuildingProject[] = [
  {
    id: 'pr-01',
    name: 'ЖК «Сосновый Бор»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 9,
    totalArea: 6500,
    hasParking: false,
    facadeType: 'ventilated',
    district: 'СВАО (г. Москва)',
    totalCost: 598000000,
    costPerSqm: 92000,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-02',
    name: 'ЖК «Лесная Поляна»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 14,
    totalArea: 11200,
    hasParking: false,
    facadeType: 'plaster',
    district: 'Новая Москва (ТиНАО)',
    totalCost: 918400000,
    costPerSqm: 82000,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-03',
    name: 'Клубный дом «На Озерной»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 6,
    totalArea: 4200,
    hasParking: true,
    facadeType: 'clinker_glass',
    district: 'ЗАО (г. Москва)',
    totalCost: 546000000,
    costPerSqm: 130000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-04',
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
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-05',
    name: 'Резиденция «Парк Авеню»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 12,
    totalArea: 9800,
    hasParking: true,
    facadeType: 'clinker_glass',
    district: 'ЦАО (г. Москва)',
    totalCost: 1470000000,
    costPerSqm: 150000,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-06',
    name: 'Усадьба «Изумруд»',
    buildingClass: 'individual',
    structureType: 'brick',
    floors: 3,
    totalArea: 650,
    hasParking: true,
    facadeType: 'clinker_glass',
    district: 'Новорижское шоссе (МО)',
    totalCost: 94250000,
    costPerSqm: 145000,
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-07',
    name: 'ЖК «Городские Высоты»',
    buildingClass: 'comfort',
    structureType: 'monolith',
    floors: 22,
    totalArea: 16500,
    hasParking: true,
    facadeType: 'ventilated',
    district: 'ЮАО (г. Москва)',
    totalCost: 1567500000,
    costPerSqm: 95000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-08',
    name: 'Вилла «Хай-тек Модерн»',
    buildingClass: 'individual',
    structureType: 'monolith',
    floors: 2,
    totalArea: 480,
    hasParking: true,
    facadeType: 'clinker_glass',
    district: 'Рублево-Успенское ш. (МО)',
    totalCost: 81600000,
    costPerSqm: 170000,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-09',
    name: 'ЖК «Северный Квартал»',
    buildingClass: 'comfort',
    structureType: 'panel',
    floors: 17,
    totalArea: 14000,
    hasParking: false,
    facadeType: 'ventilated',
    district: 'СВАО (г. Москва)',
    totalCost: 1190000000,
    costPerSqm: 85000,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pr-10',
    name: 'Башня «Скайлайн»',
    buildingClass: 'business',
    structureType: 'monolith',
    floors: 25,
    totalArea: 19500,
    hasParking: true,
    facadeType: 'clinker_glass',
    district: 'ЗАО (г. Москва)',
    totalCost: 2827500000,
    costPerSqm: 145000,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80'
  }
];

export const NCS_BASE_RATES: Record<string, Record<string, number>> = {
  monolith: { comfort: 86000, business: 122000, individual: 140000 },
  panel: { comfort: 76000, business: 98000, individual: 105000 },
  brick: { comfort: 81000, business: 115000, individual: 132000 },
};

export const DISTRICT_COEFFICIENTS: Record<string, number> = {
  'ЦАО (г. Москва)': 1.25,
  'ЗАО (г. Москва)': 1.18,
  'СВАО (г. Москва)': 1.10,
  'ЮАО (г. Москва)': 1.10,
  'Новая Москва (ТиНАО)': 1.05,
  'Новорижское шоссе (МО)': 1.15,
  'Рублево-Успенское ш. (МО)': 1.22,
  'Московская область (Север)': 1.0,
};

// Коэффициент фасада
export const FACADE_COEFFICIENTS: Record<string, number> = {
  plaster: 1.0,           // базовая штукатурка
  ventilated: 1.08,       // навесной вентфасад (+8%)
  clinker_glass: 1.15,    // клинкер/витражное остекление (+15%)
};

// Коэффициент паркинга
export const PARKING_COEFFICIENT = 1.12; // наличие подземного этажа/паркинга (+12% к общему объёму работ)

export function getFloorCoefficient(floors: number): number {
  if (floors <= 3) return 1.05;
  if (floors <= 9) return 1.0;
  if (floors <= 16) return 1.06;
  return 1.14;
}