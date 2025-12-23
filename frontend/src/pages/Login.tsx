import { useState } from "react"
import { api } from "../api"

export default function Login({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const submit = async () => {
        try {
            const res = await api.post("/auth/login", { email, password })
            localStorage.setItem("token", res.data.token)
            onLogin()
        } catch {
            alert("Ошибка входа")
        }
    }

    return (
        <div>
            <h2>Login</h2>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={submit}>Войти</button>
        </div>
    )
}
