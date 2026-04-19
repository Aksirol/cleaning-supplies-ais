// frontend/src/pages/Suppliers.jsx
import { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config';
import Topbar from '../components/Topbar';
import AddSupplierModal from '../components/AddSupplierModal';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fetchSuppliers = () => {
    setLoading(true);
    const query = searchTerm ? `?search=${searchTerm}` : '';
    fetch(`${API_URL}/suppliers${query}`)
      .then(res => res.json())
      .then(data => { setSuppliers(data); setLoading(false); });
  };

  useEffect(() => {
    const handler = setTimeout(fetchSuppliers, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const sortedSuppliers = useMemo(() => {
    let sortable = [...suppliers];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [suppliers, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleEdit = (sup) => {
    setSelectedSupplier(sup);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Видалити контрагента "${name}"?`)) return;
    const res = await fetch(`${API_URL}/suppliers/${id}`, { method: 'DELETE' });
    if (res.ok) fetchSuppliers();
    else {
      const err = await res.json();
      alert(err.error);
    }
  };

  return (
    <>
      <Topbar title="Постачальники" subtitle="Контрагенти" buttonText="+ Постачальник" 
        onButtonClick={() => { setSelectedSupplier(null); setIsModalOpen(true); }} />
      
      <div className="content-area">
        <div className="filter-bar">
          <input type="text" placeholder="Пошук за назвою або ЄДРПОУ..." 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{width: '300px'}} />
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')} style={{cursor:'pointer'}}>Код {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => requestSort('name')} style={{cursor:'pointer'}}>Назва {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th>ЄДРПОУ</th>
                <th>Контакт</th>
                <th>Телефон</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" style={{textAlign:'center'}}>Завантаження...</td></tr> : 
                sortedSuppliers.map(sup => (
                  <tr key={sup.id}>
                    <td className="text-id">П-{String(sup.id).padStart(3, '0')}</td>
                    <td style={{fontWeight:'500'}}>{sup.name}</td>
                    <td>{sup.edrpou || '—'}</td>
                    <td>{sup.contact_person || '—'}</td>
                    <td>{sup.phone || '—'}</td>
                    <td>
                      <span className="text-action" onClick={() => handleEdit(sup)}>Редагувати</span>
                      <span className="text-action" style={{color:'var(--danger)', marginLeft:'12px'}} 
                        onClick={() => handleDelete(sup.id, sup.name)}>Видалити</span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <AddSupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        onSupplierSaved={fetchSuppliers} initialData={selectedSupplier} />
    </>
  );
};

export default Suppliers;