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
            let result;
            if (isLogin) {
                result = await login({ email: formData.email, password: formData.password });
            } else {
                result = await register({ name: formData.name, email: formData.email, password: formData.password });
            }

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (email, password) => {
        setLoading(true);
        setError('');
        try {
            const result = await login({ email, password });
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <h1 className="login-heading">{isLogin ? 'Sign In' : 'Create Account'}</h1>
                <p className="login-subtext">
                    {isLogin ? 'Enter your credentials to access your account' : 'Fill in the details to create a new account'}
                </p>

                {error && (
                    <div className="error-message">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLogin && (
                        <div className="input-wrapper">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="input-wrapper">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-wrapper">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {isLogin && (
                        <div className="form-extras">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Processing...
                            </>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="toggle-form">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        className="toggle-btn"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({ name: '', email: '', password: '' });
                        }}
                    >
                        {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                </div>

                {isLogin && (
                    <>
                        <div className="divider">
                            <span>Or continue with demo accounts</span>
                        </div>

                        <div className="demo-buttons">
                            <button
                                type="button"
                                className="demo-btn"
                                onClick={() => handleDemoLogin('admin@family.com', 'admin123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user-tie"></i>
                                <div>
                                    <div className="demo-name">Admin</div>
                                    <div className="demo-email">admin@family.com</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                className="demo-btn"
                                onClick={() => handleDemoLogin('papa@family.com', 'papa123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user"></i>
                                <div>
                                    <div className="demo-name">Papa</div>
                                    <div className="demo-email">papa@family.com</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                className="demo-btn"
                                onClick={() => handleDemoLogin('mummy@family.com', 'mummy123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user"></i>
                                <div>
                                    <div className="demo-name">Mummy</div>
                                    <div className="demo-email">mummy@family.com</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                className="demo-btn"
                                onClick={() => handleDemoLogin('sister@family.com', 'sister123')}
                                disabled={loading}
                            >
                                <i className="fa-solid fa-user"></i>
                                <div>
                                    <div className="demo-name">Sister</div>
                                    <div className="demo-email">sister@family.com</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
