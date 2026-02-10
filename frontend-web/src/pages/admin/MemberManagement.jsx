import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import './MemberManagement.css';

const MemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'member'
    });


    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await userAPI.getAll();
            setMembers(response.data.users || []);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const updateData = { ...formData };
                // Don't send empty password
                if (!updateData.password) delete updateData.password;
                await userAPI.update(editingId, updateData);
            } else {
                await userAPI.create(formData);
            }
            resetForm();
            fetchMembers();
        } catch (error) {
            alert(editingId ? 'Failed to update member' : 'Failed to create member');
        }
    };

    const handleEdit = (member) => {
        setFormData({
            name: member.name,
            email: member.email,
            password: '', // Password field blank when editing
            role: member.role
        });
        setEditingId(member._id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'member' });
        setEditingId(null);
        setShowForm(false);
    };


    const handleRoleToggle = async (id, currentRole) => {
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        try {
            await userAPI.updateRole(id, newRole);
            fetchMembers();
        } catch (error) {
            alert('Failed to update role');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            try {
                await userAPI.delete(id);
                fetchMembers();
            } catch (error) {
                alert('Failed to delete member');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <div className="member-management-page">
            <div className="page-header">
                <div>
                    <h1>
                        <i className="fa-solid fa-users"></i> Family Members
                    </h1>
                    <p className="text-secondary">Manage family members and their access levels</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <i className="fa-solid fa-plus"></i> Add New Member
                </button>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{editingId ? 'Edit Family Member' : 'New Family Member'}</h2>
                                <p className="text-secondary text-sm">
                                    {editingId ? 'Update details for ' + formData.name : 'Create a new account for a family member'}
                                </p>
                            </div>
                            <button className="modal-close" onClick={resetForm}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-user"></i> Full Name
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Rajan Goswami"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-envelope"></i> Email Address
                                </label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="rajan@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-lock"></i> {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingId}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa-solid fa-shield-halved"></i> Access Level
                                </label>
                                <select
                                    className="form-select"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="member">Regular Member</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Update Member' : 'Add Member'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            <div className="members-grid">
                {members.length === 0 ? (
                    <div className="empty-state">
                        <i className="fa-solid fa-users-slash"></i>
                        <p>No family members found</p>
                    </div>
                ) : (
                    members.map((member) => (
                        <div key={member._id} className="member-display-card">
                            <div className="member-display-header">
                                <div className="member-display-avatar">
                                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div className="member-display-badge">
                                    {member.role === 'admin' ? (
                                        <span className="badge badge-primary">
                                            <i className="fa-solid fa-shield-halved"></i> Admin
                                        </span>
                                    ) : (
                                        <span className="badge badge-secondary">
                                            <i className="fa-solid fa-user"></i> Member
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="member-display-body">
                                <h3 className="member-display-name">{member.name}</h3>
                                <p className="member-display-email">{member.email}</p>
                                <div className="member-display-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Status</span>
                                        <span className={`status-dot ${member.isActive ? 'active' : 'inactive'}`}></span>
                                        <span className="stat-value">{member.isActive ? 'Active' : 'Offline'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="member-display-footer">
                                <button
                                    className="btn-icon btn-icon-primary"
                                    onClick={() => handleEdit(member)}
                                    title="Edit Member"
                                >
                                    <i className="fa-solid fa-pencil"></i>
                                </button>
                                <button

                                    className={`btn-icon ${member.role === 'admin' ? 'btn-icon-warning' : 'btn-icon-primary'}`}
                                    onClick={() => handleRoleToggle(member._id, member.role)}
                                    title={member.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                >
                                    <i className={`fa-solid ${member.role === 'admin' ? 'fa-user-minus' : 'fa-user-shield'}`}></i>
                                </button>
                                <button
                                    className="btn-icon btn-icon-danger"
                                    onClick={() => handleDelete(member._id)}
                                    title="Delete Member"
                                >
                                    <i className="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MemberManagement;
