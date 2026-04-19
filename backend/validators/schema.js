// backend/validators/schemas.js
const { z } = require('zod');

// Схема для позицій документа (використовується в закупівлях та витратах)
const documentItemSchema = z.object({
  good_id: z.number({ required_error: "ID товару є обов'язковим", invalid_type_error: "ID товару має бути числом" }),
  quantity: z.number().positive("Кількість має бути більше 0"),
  price: z.number().min(0, "Ціна не може бути від'ємною"),
  sum: z.number().min(0)
});

// Схема для прибуткової накладної (Закупівля)
const purchaseSchema = z.object({
  supplier_id: z.number({ required_error: "Оберіть постачальника", invalid_type_error: "ID постачальника має бути числом" }),
  doc_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Некоректний формат дати (очікується YYYY-MM-DD)"),
  doc_number: z.string().optional(),
  total_sum: z.number().min(0),
  status: z.string().optional(),
  notes: z.string().optional(),
  // Перевірка масиву: він має бути і мати мінімум 1 елемент
  items: z.array(documentItemSchema).min(1, "Документ повинен містити хоча б одну позицію товару")
});

// Схема для акту списання (Витрата)
const expenseSchema = z.object({
  department_id: z.number({ required_error: "Оберіть підрозділ", invalid_type_error: "ID підрозділу має бути числом" }),
  doc_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Некоректний формат дати"),
  doc_number: z.string().optional(),
  responsible: z.string().optional(),
  total_sum: z.number().min(0),
  notes: z.string().optional(),
  items: z.array(documentItemSchema).min(1, "Акт повинен містити хоча б одну позицію для списання")
});

// Схема для Товару
const goodSchema = z.object({
  name: z.string().min(2, "Назва товару має містити мінімум 2 символи"),
  category: z.string().min(1, "Вкажіть категорію"),
  unit: z.string().min(1, "Вкажіть одиницю виміру"),
  min_stock: z.number().min(0, "Мінімальний залишок не може бути від'ємним"),
  price: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable()
});

// Схема для Постачальника
const supplierSchema = z.object({
  name: z.string().min(2, "Назва контрагента є обов'язковою"),
  edrpou: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  phone: z.string().optional().nullable()
});

module.exports = {
  purchaseSchema,
  expenseSchema,
  goodSchema,
  supplierSchema
};