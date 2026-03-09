import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, accessToken } = useSelector((s) => s.auth);
    const [form, setForm] = useState({ email: '', password: '' });

    useEffect(() => { if (accessToken) navigate('/projects'); }, [accessToken]);
    useEffect(() => { dispatch(clearError()); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await dispatch(loginUser(form));
        if (!res.error) navigate('/projects');
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <div className="auth-logo">
                    <h1>⚡ FlowBoard</h1>
                    <p>Sign in to your workspace</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-input" placeholder="you@example.com"
                            value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-input" placeholder="••••••••"
                            value={form.password} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '12px' }}>
                        {loading ? 'Signing in…' : <><LogIn size={16} /> Sign In</>}
                    </button>
                </form>
                <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
}
