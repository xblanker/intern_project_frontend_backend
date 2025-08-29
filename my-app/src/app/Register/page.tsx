'use client';

import styles from "../login.module.css";
import { MdLock, MdPerson } from "react-icons/md";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Register() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        document.title = 'Register | Chat Room App';
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, password }),
            });

            const data = await response.json();
            
            if (data.code === 0) {
                alert('Registration successful! Please login.');
                router.push('/');
            } else {
                setError(data.msg || 'Registration failed');
            }
        } catch (error) {
            console.error('Error registering:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles["SetName-Body"]}>
            <div className={styles["login-box"]}>
                <form onSubmit={handleSubmit}>
                    <h2 className={styles["setname-h2"]}>Register</h2>
                    <div className={styles["input-box"]}>
                        <span className={styles["icon"]}>
                            <MdPerson />
                        </span>
                        <input
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            disabled={isLoading}
                        />
                        <label>Username</label>
                    </div>
                    <div className={styles["input-box"]}>
                        <span className={styles["icon"]}>
                            <MdLock />
                        </span>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <label>Password</label>
                    </div>
                    <div className={styles["input-box"]}>
                        <span className={styles["icon"]}>
                            <MdLock />
                        </span>
                        <input 
                            type="password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <label>Confirm Password</label>
                    </div>
                    {error && (
                        <div style={{ 
                            color: 'red', 
                            fontSize: '14px', 
                            marginTop: '10px', 
                            textAlign: 'center' 
                        }}>
                            {error}
                        </div>
                    )}
                    <div>
                        <button 
                            className={styles["SetName-button"]} 
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                    <div className={styles["register_link"]}>
                        <p>Already have an account? <Link href="/">Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
