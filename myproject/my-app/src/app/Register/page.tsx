'use client';

import styles from"./Register.module.css"
import { MdLock, MdPerson } from "react-icons/md";
import { useState } from "react";

const backEnd:string = "http://localhost:8080";

export default function Register({ onLogin }: { onLogin: (name: string) => void }) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setPasswordError('');

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch(backEnd + '/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, password }),
            });

            if (!response.ok) {
                throw new Error('Failed to register');
            }

            const data = await response.json();
            onLogin(data.userName);
        } catch (error) {
            console.error(error);
        }
    }
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
                    <div className={styles["input-box"]}>
                        <span className={styles["icon"]}>
                            <MdLock />
                        </span>
                        <input 
                            type="password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} />
                        <label>Confirm Password</label>
                    </div>
                    {passwordError && (
                        <div style={{ color: 'red', fontSize: '14px', marginTop: '5px', textAlign: 'center' }}>
                            {passwordError}
                        </div>
                    )}
                    <div>
                        <button className={styles["SetName-button"]} type="submit">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
}