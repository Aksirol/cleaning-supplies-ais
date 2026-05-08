import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { fetchWithAuth } from '../config';
import AddUserModal from '../components/AddUserModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetchWithAuth('/users')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Видалити доступ для ${name}?`)) {
      const res = await fetchWithAuth(`/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    }
  };

  return (
    <>
      <Topbar title="Користувачі" subtitle="Керування доступом" 
        buttonText="+ Новий користувач" onButtonClick={() => setIsModalOpen(true)} />

      <div className="content-area">
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ПІБ</th>
                <th>Логін</th>
                <th>Роль</th>
                <th>Створено</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="5" style={{textAlign:'center'}}>Завантаження...</td></tr> :
                users.map(u => (
                  <tr key={u.id}>
                    <td style={{fontWeight:'500'}}>{u.full_name}</td>
                    <td>{u.username}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-warn' : 'badge-ok'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className="text-action" style={{color:'var(--danger)'}} 
                        onClick={() => handleDelete(u.id, u.username)}>Видалити</span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUserAdded={fetchUsers} />
    </>
  );
};

export default Users;