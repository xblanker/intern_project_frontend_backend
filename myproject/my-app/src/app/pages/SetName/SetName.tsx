'use client';

import "./SetName.css"
import { MdPerson } from "react-icons/md";
import { useRouter } from "next/compat/router";
import { useState } from "react";

export function SetName({ onLogin }: { onLogin: (name: string) => void }) {
    const [userName, setUserName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        e.preventDefault();
        if(userName.trim()) {
            onLogin(userName);
        }
    }
    return (
        <div className="SetName-Body">
            <div className="login-box">
                <form onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    <div className="input-box">
                        <span className="icon">
                            <MdPerson />
                        </span>
                        <input
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)} />
                        <label>Name</label>
                    </div>
                    <div>
                        <button className="SetName-button" type="submit">Login in</button>
                    </div>
                </form>
            </div>
        </div>
    );
}