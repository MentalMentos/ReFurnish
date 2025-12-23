import { useEffect, useState } from "react"
import { api } from "../api"

export default function MyProjects() {
    const [projects, setProjects] = useState<any[]>([])

    const fetchProjects = async () => {
        const res = await api.get("/projects/my")
        setProjects(res.data)
    }

    useEffect(() => { fetchProjects() }, [])

    return (
        <div>
            <h2>Мои проекты</h2>
            <ul>
                {projects.map(p => (
                    <li key={p.id}>
                        {p.title} — {p.status} — <button onClick={() => alert("Редактирование пока alert")}>Редактировать</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
