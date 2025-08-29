'use client';

import styles from"./login.module.css"
import { MdLock, MdPerson } from "react-icons/md";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function SetName() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        document.title = 'Login | Chat Room App';
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, password }),
            });

            const data = await response.json();
            
            if (data.code === 0) {
                localStorage.setItem('userName', userName);
                if (data.data?.token) {
                    localStorage.setItem('token', data.data.token);
                }
                router.push('/chat');
            } else {
                setError(data.msg || 'Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className={styles["SetName-Body"]}>
            <div className={styles["login-box"]}>
                <form onSubmit={handleSubmit}>
                    <h2 className={styles["setname-h2"]}>Login</h2>
                    <div className={styles["input-box"]}>
                        <span className={styles["icon"]}>
                            <MdPerson />
                        </span>
                        <input
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)} />
                        <label>Name</label>
                    </div>
                    <div className={styles["input-box"]}>
                        <span className={styles["icon"]}>
                            <MdLock />
                        </span>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                        <label>Password</label>
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
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                    <div className={styles["register_link"]}>
                        <p>Don&apos;t have an account? <Link href="/Register">Register</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
