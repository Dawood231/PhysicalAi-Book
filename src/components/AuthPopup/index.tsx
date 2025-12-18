import React, { useState } from 'react';
import { authClient } from '../../lib/auth-client';
import styles from './styles.module.css';
import clsx from 'clsx';

interface AuthPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'login') {
                const { error } = await authClient.signIn.email({
                    email,
                    password,
                });
                if (error) {
                    setError(error.message || 'Login failed');
                } else {
                    onSuccess();
                    onClose();
                }
            } else {
                const { error } = await authClient.signUp.email({
                    email,
                    password,
                    name: username,
                });
                if (error) {
                    setError(error.message || 'Registration failed');
                } else {
                    onSuccess();
                    onClose();
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = (newMode: 'login' | 'register') => {
        setMode(newMode);
        setError(null);
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                    <CloseIcon />
                </button>

                <div className={styles.tabs}>
                    <button
                        className={clsx(styles.tab, mode === 'login' && styles.activeTab)}
                        onClick={() => toggleMode('login')}
                    >
                        Login
                    </button>
                    <button
                        className={clsx(styles.tab, mode === 'register' && styles.activeTab)}
                        onClick={() => toggleMode('register')}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {mode === 'register' && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Username</label>
                            <input
                                className={styles.input}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={8}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
