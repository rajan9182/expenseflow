import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (email, password) => {
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="login-logo">
                        <i className="fa-solid fa-wallet"></i>
                    </div>
                    <h1 className="login-title">Family Expense Manager</h1>
                    <p className="login-subtitle">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fa-solid fa-user"></i>
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa-solid fa-envelope"></i>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa-solid fa-lock"></i>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className={`fa-solid ${isLogin ? 'fa-right-to-bracket' : 'fa-user-plus'}`}></i>
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle Login/Register */}
                <div className="login-toggle">
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({ name: '', email: '', password: '' });
                        }}
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>

                {/* Demo Accounts */}
                {isLogin && (
                    <div className="demo-accounts">
                        <div className="divider">
                            <span>Quick Demo Access</span>
                        </div>

                        <div className="demo-grid">
                            <button
                                type="button"
                                className="demo-btn demo-admin"
                                onClick={() => handleDemoLogin('admin@family.com', 'admin123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user-tie"></i>
                                <span className="demo-label">Admin</span>
                                <span className="demo-email">admin@family.com</span>
                            </button>

                            <button
                                type="button"
                                className="demo-btn demo-member"
                                onClick={() => handleDemoLogin('papa@family.com', 'papa123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user"></i>
                                <span className="demo-label">Papa</span>
                                <span className="demo-email">papa@family.com</span>
                            </button>

                            <button
                                type="button"
                                className="demo-btn demo-member"
                                onClick={() => handleDemoLogin('mummy@family.com', 'mummy123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user"></i>
                                <span className="demo-label">Mummy</span>
                                <span className="demo-email">mummy@family.com</span>
                            </button>

                            <button
                                type="button"
                                className="demo-btn demo-member"
                                onClick={() => handleDemoLogin('sister@family.com', 'sister123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user"></i>
                                <span className="demo-label">Sister</span>
                                <span className="demo-email">sister@family.com</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="login-footer">
                <p>&copy; 2026 Family Expense Manager. All rights reserved.</p>
            </div>
        </div>
    );
};

export default Login;
