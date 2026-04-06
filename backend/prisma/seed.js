const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Очищення старих даних...');
  await prisma.stock.deleteMany();
  await prisma.expenseItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.good.deleteMany();
  await prisma.department.deleteMany();
  await prisma.supplier.deleteMany();

  console.log('🌱 Додавання нових даних...');

  // --- 1. ПОСТАЧАЛЬНИКИ ---
  const supHimtorg = await prisma.supplier.create({
    data: { name: 'ТОВ «Хімторг»', edrpou: '31245678', contact_person: 'Мельник О.П.', phone: '050 123-45-67' }
  });
  const supChystosvit = await prisma.supplier.create({
    data: { name: 'ПП «Чистосвіт»', edrpou: '42356789', contact_person: 'Бойко В.І.', phone: '067 234-56-78' }
  });
  const supDistrib = await prisma.supplier.create({
    data: { name: 'АТ «Дистриб»', edrpou: '53467890', contact_person: 'Ткаченко С.Р.', phone: '073 345-67-89' }
  });
  const supFop = await prisma.supplier.create({
    data: { name: 'ФОП Гриценко', edrpou: null, contact_person: 'Гриценко А.М.', phone: '099 456-78-90' }
  });

  // --- 2. ПІДРОЗДІЛИ ---
  const depPralnya = await prisma.department.create({ data: { name: 'Пральня', responsible: 'Сидоренко М.І.' } });
  const depKitchen1 = await prisma.department.create({ data: { name: 'Кухня №1', responsible: 'Іваненко Р.С.' } });
  const depKitchen2 = await prisma.department.create({ data: { name: 'Кухня №2', responsible: 'Петренко О.В.' } });
  const depSanitary1 = await prisma.department.create({ data: { name: 'Санвузол №1', responsible: 'Коваль Т.Г.' } });
  const depSanitary2 = await prisma.department.create({ data: { name: 'Санвузол №2', responsible: 'Гнатюк В.В.' } });
  const depAdmin = await prisma.department.create({ data: { name: 'Адмінкорпус', responsible: 'Лисенко А.А.' } });

  // --- 3. ТОВАРИ ---
  const goodTide = await prisma.good.create({
    data: { name: 'Пральний порошок Tide 3кг', category: 'Порошки', unit: 'уп.', min_stock: 10, price: 210.00 }
  });
  const goodFairy = await prisma.good.create({
    data: { name: 'Fairy для посуду 1л', category: 'Рідкі засоби', unit: 'шт.', min_stock: 10, price: 45.00 }
  });
  const goodSavoy = await prisma.good.create({
    data: { name: 'Рідке мило Savoy 5л', category: 'Мило', unit: 'каністра', min_stock: 5, price: 235.00 }
  });
  const goodDomestos = await prisma.good.create({
    data: { name: 'Засіб для підлоги Domestos 1л', category: 'Дезінфектанти', unit: 'шт.', min_stock: 8, price: 89.00 }
  });
  const goodChlorine = await prisma.good.create({
    data: { name: 'Хлоровмісний засіб 1л', category: 'Дезінфектанти', unit: 'л', min_stock: 10, price: 40.00 }
  });
  const goodDuck = await prisma.good.create({
    data: { name: 'Гель для унітазів Duck', category: 'Дезінфектанти', unit: 'шт.', min_stock: 6, price: 65.00 }
  });

  // --- 4. ЗАКУПІВЛІ (з позиціями) ---
  await prisma.purchase.create({
    data: {
      supplier_id: supHimtorg.id, doc_date: new Date('2026-04-05T10:00:00Z'), doc_number: 'ВН-2026-041', total_sum: 4200.00, status: 'Проведено',
      items: { create: [
        { good_id: goodTide.id, quantity: 20, price: 210.00, sum: 4200.00 }
      ]}
    }
  });

  await prisma.purchase.create({
    data: {
      supplier_id: supChystosvit.id, doc_date: new Date('2026-04-03T11:30:00Z'), doc_number: 'ВН-2026-038', total_sum: 2350.00, status: 'Проведено',
      items: { create: [
        { good_id: goodSavoy.id, quantity: 10, price: 235.00, sum: 2350.00 }
      ]}
    }
  });

  await prisma.purchase.create({
    data: {
      supplier_id: supHimtorg.id, doc_date: new Date('2026-03-29T09:15:00Z'), doc_number: 'ВН-2026-031', total_sum: 7100.00, status: 'Проведено',
      items: { create: [
        { good_id: goodTide.id, quantity: 15, price: 210.00, sum: 3150.00 },
        { good_id: goodDomestos.id, quantity: 20, price: 89.00, sum: 1780.00 },
        { good_id: goodFairy.id, quantity: 48, price: 45.00, sum: 2160.00 } // Коробка
      ]}
    }
  });

  // --- 5. ВИТРАТИ (з позиціями) ---
  await prisma.expense.create({
    data: {
      department_id: depKitchen2.id, doc_date: new Date('2026-04-04T14:20:00Z'), doc_number: 'АВ-2026-019', responsible: depKitchen2.responsible, total_sum: 675.00,
      items: { create: [
        { good_id: goodFairy.id, quantity: 15, price: 45.00, sum: 675.00 }
      ]}
    }
  });

  await prisma.expense.create({
    data: {
      department_id: depPralnya.id, doc_date: new Date('2026-04-02T08:45:00Z'), doc_number: 'АВ-2026-018', responsible: depPralnya.responsible, total_sum: 1050.00,
      items: { create: [
        { good_id: goodTide.id, quantity: 5, price: 210.00, sum: 1050.00 }
      ]}
    }
  });

  await prisma.expense.create({
    data: {
      department_id: depSanitary1.id, doc_date: new Date('2026-04-01T16:00:00Z'), doc_number: 'АВ-2026-017', responsible: depSanitary1.responsible, total_sum: 960.00,
      items: { create: [
        { good_id: goodDuck.id, quantity: 10, price: 65.00, sum: 650.00 },
        { good_id: goodChlorine.id, quantity: 5, price: 40.00, sum: 200.00 },
        { good_id: goodDomestos.id, quantity: 1, price: 89.00, sum: 89.00 } // Частково для іншого прибирання
      ]}
    }
  });

  // --- 6. ЗАЛИШКИ НА СКЛАДІ ---
  // Ми імітуємо поточні залишки згідно твого макету
  await prisma.stock.createMany({
    data: [
      { good_id: goodTide.id, quantity: 15 },
      { good_id: goodFairy.id, quantity: 8 },
      { good_id: goodSavoy.id, quantity: 10 },
      { good_id: goodDomestos.id, quantity: 2 },
      { good_id: goodChlorine.id, quantity: 5 },
      { good_id: goodDuck.id, quantity: 12 }
    ]
  });

  console.log('✅ Базу успішно наповнено тестовими даними!');
}

main()
  .catch((e) => {
    console.error('❌ Помилка під час наповнення:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });