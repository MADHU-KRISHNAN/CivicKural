import React, { useState, useEffect } from 'react';
import apiService, { User, UserRole } from '../../services/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await apiService.getUsers();
    if (res.success && (res.users || res.data)) {
      setUsers((res.users || res.data) as User[]);
    }
    setLoading(false);
  };

  const handleToggleRole = (userId: string, currentRole: UserRole) => {
    const nextRole: UserRole = currentRole === 'citizen' ? 'staff' : currentRole === 'staff' ? 'admin' : 'citizen';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: nextRole, userType: nextRole } : u))
    );
  };

  const filteredUsers = users.filter((u) => {
    const role = u.role || u.userType || 'citizen';
    const matchesSearch = (u.name + ' ' + u.email + ' ' + (u.department || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ backgroundColor: '#0b1329', minHeight: '100vh', padding: '30px 24px', width: '100%', boxSizing: 'border-box', color: '#ffffff' }}>
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ backgroundColor: '#9333ea', color: '#ffffff', fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '12px', letterSpacing: '1px' }}>
            USER &amp; OFFICER MANAGEMENT
          </span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Municipal Access Control &amp; Roster</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff' }}>
          Municipal Staff &amp; Citizen Roster 👥
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
          Live directory of citizens, field officers, and department administrators
        </p>
      </div>

      {/* Filter Toolbar */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '14px', border: '1px solid #334155', padding: '18px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0 14px' }}>
            <span style={{ marginRight: '10px', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Search user name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px', color: '#ffffff' }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none', fontWeight: '600' }}
          >
            <option value="All">All User Roles</option>
            <option value="citizen">Citizen Accounts</option>
            <option value="staff">Municipal Staff</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <span className="spinner" style={{ borderColor: 'rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8' }} />
        </div>
      ) : (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 20px' }}>User &amp; Email</th>
                <th style={{ padding: '16px 20px' }}>Account Role</th>
                <th style={{ padding: '16px 20px' }}>Assigned Department</th>
                <th style={{ padding: '16px 20px' }}>Contact Phone</th>
                <th style={{ padding: '16px 20px' }}>Registration Date</th>
                <th style={{ padding: '16px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const role = u.role || u.userType || 'citizen';
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#ffffff' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{u.email}</div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: role === 'admin' ? '#581c87' : role === 'staff' ? '#075985' : '#14532d',
                          color: role === 'admin' ? '#e9d5ff' : role === 'staff' ? '#7dd3fc' : '#86efac',
                          border: `1px solid ${role === 'admin' ? '#7e22ce' : role === 'staff' ? '#0284c7' : '#15803d'}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {role}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                      {u.department || 'General Public'}
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>{u.phone || 'N/A'}</td>

                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleRole(u.id, role)}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#38bdf8',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        ⚡ Switch Role
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
