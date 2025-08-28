'use client';

import styles from"./SetName.module.css"
import { MdLock, MdPerson } from "react-icons/md";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const backEnd:string = "http://localhost:8080";

export default function SetName() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${backEnd}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userName, password })
            });

            const data = await response.json();
            if (data.code === 0) {
                localStorage.setItem('userName', userName);
                router.push('/ChatRoom');
            } else {
                alert(data.msg);
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Login failed. Please check the console for details.");
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
                    <div>
                        <button className={styles["SetName-button"]} type="submit">Login in</button>
                    </div>
                    <div className={styles["register_link"]}>
                        <p>Don't have an account?<Link href="/Register">Register</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
