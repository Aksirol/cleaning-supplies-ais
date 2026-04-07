import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const AddPurchaseModal = ({ isOpen, onClose, onPurchaseAdded }) => {
  // Дані для випадаючих списків
  const [suppliers, setSuppliers] = useState([]);
  const [goods, setGoods] = useState([]);

  // Стан заголовка документа
  const [formData, setFormData] = useState({
    supplier_id: '',
    doc_date: new Date().toISOString().split('T')[0], // Сьогоднішня дата за замовчуванням
    doc_number: `ВН-${Date.now().toString().slice(-5)}`, // Автоматична генерація номера
    notes: ''
  });

  // Стан рядків таблиці (позицій закупівлі)
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Завантажуємо довідники, коли вікно відкривається
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch(`${API_URL}/suppliers`).then(res => res.json()),
        fetch(`${API_URL}/goods`).then(res => res.json())
      ]).then(([sups, gds]) => {
        setSuppliers(sups);
        setGoods(gds);
        
        // Встановлюємо постачальника за замовчуванням
        if (sups.length > 0 && !formData.supplier_id) {
          setFormData(prev => ({ ...prev, supplier_id: sups[0].id }));
        }
        
        // Створюємо перший пустий рядок для зручності
        if (items.length === 0 && gds.length > 0) {
          setItems([{ good_id: gds[0].id, quantity: 1, price: gds[0].price || 0, sum: gds[0].price || 0 }]);
        }
      }).catch(err => console.error("Помилка завантаження довідників", err));
    }
  }, [isOpen]); // Запускається тільки при відкритті вікна

  // Загальна сума документа
  const totalSum = items.reduce((acc, item) => acc + Number(item.sum), 0);

  // Обробник зміни полів заголовка
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обробник зміни в рядках таблиці товарів
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Якщо змінили товар - підтягуємо його базову ціну
    if (field === 'good_id') {
      const selectedGood = goods.find(g => g.id === Number(value));
      if (selectedGood) {
        newItems[index].price = selectedGood.price || 0;
      }
    }

    // Перераховуємо суму рядка (кількість * ціна)
    if (field === 'quantity' || field === 'price' || field === 'good_id') {
      newItems[index].sum = Number(newItems[index].quantity) * Number(newItems[index].price);
    }

    setItems(newItems);
  };

  const addItemRow = () => {
    const defaultGood = goods[0];
    if (defaultGood) {
      setItems([...items, { good_id: defaultGood.id, quantity: 1, price: defaultGood.price || 0, sum: defaultGood.price || 0 }]);
    }
  };

  const removeItemRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Відправка на сервер
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert('Додайте хоча б один товар до накладної!');
    setIsSubmitting(true);

    const payload = {
      supplier_id: Number(formData.supplier_id),
      doc_date: formData.doc_date,
      doc_number: formData.doc_number,
      total_sum: totalSum,
      notes: formData.notes,
      items: items.map(i => ({
         good_id: Number(i.good_id),
         quantity: Number(i.quantity),
         price: Number(i.price),
         sum: Number(i.sum)
      }))
    };

    try {
      const res = await fetch(`${API_URL}/purchases`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Помилка збереження');
      
      onPurchaseAdded(); // Кажемо таблиці оновитися
      
      // Скидаємо форму
      setItems([]); 
      setFormData(prev => ({ ...prev, doc_number: `ВН-${Date.now().toString().slice(-5)}` }));
      onClose();
    } catch (error) {
      console.error(error);
      alert('Не вдалося зберегти накладну. Перевірте консоль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '800px', maxWidth: '95%' }}> {/* Робимо вікно ширшим */}
        <div className="modal-header">
          <div className="modal-title">Нова прибуткова накладна</div>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Блок 1: Заголовок документа */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Постачальник *</label>
                <select name="supplier_id" required className="form-control" value={formData.supplier_id} onChange={handleChange}>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">№ Накладної</label>
                <input type="text" name="doc_number" className="form-control" value={formData.doc_number} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Дата *</label>
                <input type="date" name="doc_date" required className="form-control" value={formData.doc_date} onChange={handleChange} />
              </div>
            </div>

            {/* Блок 2: Рядки товарів */}
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Позиції:</h4>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table className="table" style={{ margin: 0 }}>
                <thead style={{ background: 'var(--bg-hover)' }}>
                  <tr>
                    <th>Товар</th>
                    <th style={{ width: '100px' }}>Кількість</th>
                    <th style={{ width: '120px' }}>Ціна (₴)</th>
                    <th style={{ width: '120px' }}>Сума (₴)</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '8px' }}>
                        <select 
                          className="form-control" 
                          value={item.good_id} 
                          onChange={(e) => handleItemChange(index, 'good_id', e.target.value)}
                        >
                          {goods.map(g => <option key={g.id} value={g.id}>{g.name} ({g.unit})</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input 
                          type="number" min="0.01" step="0.01" required className="form-control" 
                          value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input 
                          type="number" min="0" step="0.01" required className="form-control" 
                          value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} 
                        />
                      </td>
                      <td style={{ padding: '8px', verticalAlign: 'middle', fontWeight: '500' }}>
                        {Number(item.sum).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItemRow(index)} style={{ color: 'var(--danger)', background: 'none', fontSize: '18px' }}>
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn" onClick={addItemRow} style={{ borderStyle: 'dashed' }}>
                + Додати рядок
              </button>
              <div style={{ fontSize: '18px', fontWeight: '500' }}>
                Разом: <span style={{ color: 'var(--accent-blue)' }}>{totalSum.toFixed(2)} ₴</span>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Скасувати</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Проведення...' : 'Провести накладну'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseModal;