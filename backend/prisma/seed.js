const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Очищення старої бази даних...');
  await prisma.expenseItem.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.good.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.department.deleteMany();

  console.log('📦 Створення довідників...');

  // 1. ПІДРОЗДІЛИ
  const departmentsData = [
    { name: 'Кухня (Гарячий цех)', responsible: 'Шевченко О.В.' },
    { name: 'Кухня (Холодний цех)', responsible: 'Коваленко І.П.' },
    { name: 'Пральня', responsible: 'Бойко М.М.' },
    { name: 'Прибирання номерів (Поверх 1)', responsible: 'Ткаченко Л.С.' },
    { name: 'Прибирання номерів (Поверх 2)', responsible: 'Григоренко В.І.' },
    { name: 'Громадські санвузли', responsible: 'Мельник О.П.' }
  ];
  const departments = [];
  for (const d of departmentsData) {
    departments.push(await prisma.department.create({ data: d }));
  }

  // 2. ПОСТАЧАЛЬНИКИ
  const suppliersData = [
    { name: 'ТОВ "Хімторг-Плюс"', edrpou: '38123456', contact_person: 'Іванов П.', phone: '044-123-45-67' },
    { name: 'ПП "Чистий Дім"', edrpou: '29876543', contact_person: 'Смирнова О.', phone: '067-999-88-77' },
    { name: 'ТОВ "Еко-Клін Україна"', edrpou: '44556677', contact_person: 'Дмитренко В.', phone: '050-111-22-33' },
    { name: 'ФОП Ковальчук А.В.', edrpou: '3122334455', contact_person: 'Ковальчук А.', phone: '063-444-55-66' },
    { name: 'ТОВ "Горека Сервіс"', edrpou: '39887766', contact_person: 'Павленко С.', phone: '044-222-33-44' }
  ];
  const suppliers = [];
  for (const s of suppliersData) {
    suppliers.push(await prisma.supplier.create({ data: s }));
  }

  // 3. ТОВАРИ
  const goodsData = [
    { name: 'Пральний порошок Tide Professional 15кг', category: 'Порошки', unit: 'уп.', min_stock: 5, price: 1250.00 },
    { name: 'Гель для прання Ariel 5л', category: 'Рідкі засоби', unit: 'каністра', min_stock: 10, price: 850.50 },
    { name: 'Миючий засіб Fairy 5л', category: 'Рідкі засоби', unit: 'каністра', min_stock: 15, price: 540.00 },
    { name: 'Засіб для підлоги Mr.Proper 5л', category: 'Рідкі засоби', unit: 'каністра', min_stock: 10, price: 480.00 },
    { name: 'Засіб для скла Clin 500мл', category: 'Рідкі засоби', unit: 'шт.', min_stock: 20, price: 85.00 },
    { name: 'Рідке мило "Бриз" 5л', category: 'Мило', unit: 'каністра', min_stock: 15, price: 210.00 },
    { name: 'Мило туалетне Dove 100г', category: 'Мило', unit: 'шт.', min_stock: 50, price: 45.00 },
    { name: 'Domestos Універсальний 1л', category: 'Дезінфектанти', unit: 'шт.', min_stock: 30, price: 115.00 },
    { name: 'Хлорні таблетки "Жавель-Клейд" 300шт', category: 'Дезінфектанти', unit: 'уп.', min_stock: 5, price: 320.00 },
    { name: 'Антисептик спиртовий АХД 2000 1л', category: 'Дезінфектанти', unit: 'шт.', min_stock: 20, price: 195.00 },
    { name: 'Швабра з віджимом PRO', category: 'Інвентар', unit: 'шт.', min_stock: 5, price: 650.00 },
    { name: 'Ганчірки мікрофібра (уп. 10 шт)', category: 'Інвентар', unit: 'уп.', min_stock: 15, price: 180.00 },
    { name: 'Рукавички гумові (розмір M)', category: 'Інвентар', unit: 'пара', min_stock: 100, price: 35.00 },
    { name: 'Пакети для сміття 120л (уп. 50шт)', category: 'Інвентар', unit: 'уп.', min_stock: 30, price: 145.00 },
    { name: 'Губки для посуду (уп. 10шт)', category: 'Інвентар', unit: 'уп.', min_stock: 40, price: 55.00 }
  ];
  const goods = [];
  for (const g of goodsData) {
    goods.push(await prisma.good.create({ data: g }));
  }

  console.log('🚚 Генерація закупівель та витрат (Січень - Травень 2026)...');

  // Допоміжні функції для рандому
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

  const startDate = new Date('2026-01-10T08:00:00Z');
  const endDate = new Date('2026-05-15T18:00:00Z');

  // Облік поточних залишків на складі в пам'яті
  let stockLedger = {};
  goods.forEach(g => stockLedger[g.id] = 0);

  // 4. ГЕНЕРАЦІЯ ЗАКУПІВЕЛЬ (40 накладних)
  for (let i = 1; i <= 40; i++) {
    const docDate = randomDate(startDate, endDate);
    const supplier = randomElement(suppliers);
    const numItems = randomInt(2, 6);
    
    // Вибираємо випадкові унікальні товари для накладної
    const shuffledGoods = [...goods].sort(() => 0.5 - Math.random());
    const selectedGoods = shuffledGoods.slice(0, numItems);

    let totalSum = 0;
    const itemsData = selectedGoods.map(good => {
      const quantity = randomInt(10, 50);
      const price = good.price;
      const sum = quantity * price;
      totalSum += sum;
      
      // Поповнюємо віртуальний склад
      stockLedger[good.id] += quantity;

      return { good_id: good.id, quantity, price, sum };
    });

    await prisma.purchase.create({
      data: {
        doc_number: `ВН-${String(i).padStart(4, '0')}`,
        doc_date: docDate,
        supplier_id: supplier.id,
        total_sum: totalSum,
        status: 'Проведено',
        items: { create: itemsData }
      }
    });
  }

  // 5. ГЕНЕРАЦІЯ ВИТРАТ (80 актів списання)
  for (let i = 1; i <= 80; i++) {
    const docDate = randomDate(startDate, endDate);
    const department = randomElement(departments);
    const numItems = randomInt(1, 4);
    
    const shuffledGoods = [...goods].sort(() => 0.5 - Math.random());
    let selectedGoods = shuffledGoods.slice(0, numItems);

    let totalSum = 0;
    const itemsData = [];

    for (const good of selectedGoods) {
      // Перевіряємо, чи є товар на віртуальному складі
      const availableQty = stockLedger[good.id];
      if (availableQty > 2) {
        // Списуємо невелику кількість
        const quantity = randomInt(1, Math.min(5, availableQty));
        const price = good.price;
        const sum = quantity * price;
        totalSum += sum;
        
        // Віднімаємо з віртуального складу
        stockLedger[good.id] -= quantity;

        itemsData.push({ good_id: good.id, quantity, price, sum });
      }
    }

    if (itemsData.length > 0) {
      await prisma.expense.create({
        data: {
          doc_number: `АВ-${String(i).padStart(4, '0')}`,
          doc_date: docDate,
          department_id: department.id,
          responsible: department.responsible,
          total_sum: totalSum,
          items: { create: itemsData }
        }
      });
    }
  }

  console.log('📊 Оновлення реальної таблиці залишків (Stock)...');
  
  // 6. ЗАПИС АКТУАЛЬНИХ ЗАЛИШКІВ У БАЗУ
  for (const good of goods) {
    if (stockLedger[good.id] > 0) {
      await prisma.stock.create({
        data: {
          good_id: good.id,
          quantity: stockLedger[good.id]
        }
      });
    }
  }

  console.log('✅ Базу успішно наповнено реалістичними даними!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });