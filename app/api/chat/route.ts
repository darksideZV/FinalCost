import { NextResponse } from 'next/server';

function parseBuildingRequest(text: string) {
  const lower = text.toLowerCase().trim();

  // 0. Проверка на приветствия без параметров
  const greetings = ['привет', 'здравствуй', 'добрый день', 'добрый вечер', 'салют', 'хай'];
  const hasKeywords = 
    lower.includes('эт') || 
    lower.includes('м2') || 
    lower.includes('кв') || 
    lower.includes('дом') || 
    lower.includes('жк') || 
    lower.includes('монолит') || 
    lower.includes('панел') || 
    lower.includes('кирпич') || 
    lower.includes('посчитай') ||
    lower.includes('рассчитай');

  if (greetings.some(g => lower.startsWith(g)) && !hasKeywords) {
    return {
      isComplete: false,
      replyText: 'Здравствуйте! Для точного сметного расчёта укажите основные параметры здания: площадь (м²), количество этажей, материал остова, класс жилья, район и нужен ли подземный паркинг.',
    };
  }

  // 1. Класс жилья
  let buildingClass: 'comfort' | 'business' | 'individual' | null = null;
  if (lower.includes('комфорт')) buildingClass = 'comfort';
  else if (lower.includes('элит') || lower.includes('премиум') || lower.includes('индивидуал') || lower.includes('клубн')) buildingClass = 'individual';
  else if (lower.includes('бизнес')) buildingClass = 'business';

  // 2. Конструктивная схема
  let structureType: string | null = null;
  if (lower.includes('монолит')) structureType = 'monolith';
  else if (lower.includes('панел') || lower.includes('сборн')) structureType = 'panel';
  else if (lower.includes('кирпич')) structureType = 'brick';
  else if (lower.includes('керам') || lower.includes('блок')) structureType = 'ceramic_block';
  else if (lower.includes('стал') || lower.includes('металл') || lower.includes('каркас')) structureType = 'steel_frame';

  // 3. Фасадная система
  let facadeType: string | null = null;
  if (lower.includes('штукатур') || lower.includes('мокрый')) facadeType = 'plaster';
  else if (lower.includes('клинк') || lower.includes('камен')) facadeType = 'clinker_stone';
  else if (lower.includes('витраж') || lower.includes('остекл') || lower.includes('стекл')) facadeType = 'stained_glass';
  else if (lower.includes('композит') || lower.includes('комбинир') || lower.includes('терракот')) facadeType = 'combined_composite';
  else if (lower.includes('вентфасад') || lower.includes('керамогранит') || lower.includes('нвф')) facadeType = 'ventilated_porcelain';

  // 4. Подземный паркинг (с учётом отрицаний)
  let hasParking: boolean | null = null;
  const parkingMentioned = 
    lower.includes('паркинг') || 
    lower.includes('гараж') || 
    lower.includes('подземн') || 
    lower.includes('машиномест') || 
    lower.includes('автостоян');

  const hasNegation = 
    lower.includes('без паркинг') || 
    lower.includes('нет паркинг') || 
    lower.includes('не нужен паркинг') || 
    lower.includes('без гараж') ||
    lower.includes('без подземн') ||
    lower.includes('паркинг не');

  if (parkingMentioned) {
    hasParking = !hasNegation;
  }

 // 5. Этажность (понимает: "4 этажа", "этажей 4", "этажность 4", "4 эт")
  let floors: number | null = null;
  const floorMatchBefore = lower.match(/(\d+)\s*(эт|этаж)/);
  const floorMatchAfter = lower.match(/(?:этаж\w*|этажност\w*)\s*[:=-]?\s*(\d+)/);

  if (floorMatchBefore) {
    floors = parseInt(floorMatchBefore[1], 10);
  } else if (floorMatchAfter) {
    floors = parseInt(floorMatchAfter[1], 10);
  }

  // 6. Площадь (понимает: 30.000 м, 30 000 м2, 30000, 30 тыс)
  let totalArea: number | null = null;

  // Вариант 1: с "тыс" / "тысяч" (например "30 тыс", "30.5 тысяч")
  const thousandMatch = lower.match(/(\d+(?:[\.,]\d+)?)\s*(?:тыс|тысяч)/);
  if (thousandMatch) {
    totalArea = Math.round(parseFloat(thousandMatch[1].replace(',', '.')) * 1000);
  } else {
    // Вариант 2: "площадь 30.000 м", "30 000 кв.м", "30000 м2"
    // Регулярка убирает точки-разделители тысяч (30.000 -> 30000)
    const areaPattern = /(?:площад\w*|объем\w*|\bS\b)?\s*[:=-]?\s*(\d{1,3}(?:[\s\.]\d{3})+|\d+)\s*(?:м2|м²|кв\.?\s*м|кв|метр\w*|\bм\b)?/i;
    
    // Ищем соответствие после слова "площадь" или рядом с единицами измерения
    const directAreaMatch = lower.match(/(?:площад\w*)\s*[:=-]?\s*(\d{1,3}(?:[\s\.]\d{3})+|\d+)/);
    const unitAreaMatch = lower.match(/(\d{1,3}(?:[\s\.]\d{3})+|\d+)\s*(?:м2|м²|кв\.?\s*м|кв|метр\w*|\bм\b)/);

    const match = directAreaMatch || unitAreaMatch;
    if (match) {
      const cleanNum = match[1].replace(/[\s\.]/g, '');
      const parsed = parseInt(cleanNum, 10);
      if (parsed > 0) totalArea = parsed;
    }
  }

  // 7. Округ / Район
  let district: string | null = null;
  if (lower.includes('цао') || lower.includes('центр')) district = 'ЦАО (г. Москва)';
  else if (lower.includes('зао') || lower.includes('запад')) district = 'ЗАО (г. Москва)';
  else if (lower.includes('сзао')) district = 'СЗАО (г. Москва)';
  else if (lower.includes('сао') || lower.includes('север')) district = 'САО (г. Москва)';
  else if (lower.includes('свао')) district = 'СВАО (г. Москва)';
  else if (lower.includes('юао') || lower.includes('юг')) district = 'ЮАО (г. Москва)';
  else if (lower.includes('юзао')) district = 'ЮЗАО (г. Москва)';
  else if (lower.includes('ювао')) district = 'ЮВАО (г. Москва)';
  else if (lower.includes('тинао') || lower.includes('новая москва')) district = 'Новая Москва (ТиНАО)';
  else if (lower.includes('новориж') || lower.includes('риж')) district = 'Новорижское шоссе (МО)';
  else if (lower.includes('рублев') || lower.includes('рубл')) district = 'Рублево-Успенское ш. (МО)';

  // 8. ПРОВЕРКА ОБЯЗАТЕЛЬНЫХ ПАРАМЕТРОВ ДЛЯ РАСЧЁТА
  const missingParams: string[] = [];
  if (!totalArea) missingParams.push('общую площадь (в м² или тыс. м²)');
  if (!floors) missingParams.push('количество надземных этажей');
  if (!structureType) missingParams.push('материал несущего остова (монолит, кирпич, панель)');
  if (!district) missingParams.push('район расположения (для учёта регионального коэффициента)');

  // Если не хватает критически важных параметров
  if (missingParams.length > 0) {
    return {
      isComplete: false,
      partialParams: {
        ...(buildingClass && { buildingClass }),
        ...(structureType && { structureType }),
        ...(facadeType && { facadeType }),
        ...(totalArea && { totalArea }),
        ...(floors && { floors }),
        ...(district && { district }),
        ...(hasParking !== null && { hasParking }),
      },
      replyText: `Я зафиксировал часть данных, но для выполнения расчёта мне не хватает параметров: ${missingParams.join(', ')}. Пожалуйста, укажите их!`,
    };
  }

  // Если всё указано
  return {
    isComplete: true,
    buildingClass: buildingClass || 'business',
    structureType: structureType!,
    facadeType: facadeType || 'ventilated_porcelain',
    totalArea: totalArea!,
    floors: floors!,
    district: district!,
    hasParking: hasParking !== null ? hasParking : false,
    replyText: `Все параметры успешно собраны! Объект: ${floors} эт., ${(totalArea || 0).toLocaleString('ru-RU')} м², конструктив: ${structureType}, ${district}. Паркинг: ${hasParking ? 'Включён (+12%)' : 'Исключён'}. Сметный расчёт выполнен и графики обновлены!`,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message || '';

    if (!message) {
      return NextResponse.json({ error: 'Пустой запрос' }, { status: 400 });
    }

    const result = parseBuildingRequest(message);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка обработки' }, { status: 500 });
  }
}