import { useState } from "react"
import { api } from "../api"

export default function CreateProject() {
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [furniture, setFurniture] = useState("")
    const [budget, setBudget] = useState(0)
    const [deadline, setDeadline] = useState("")
    const [city, setCity] = useState("Москва")

    const submit = async () => {
        await api.post("/projects", { title, description: desc, furnitureType: furniture, budget, deadline, city })
        alert("Проект создан")
    }

    return (
        <div>
            <h2>Создать проект</h2>
            <input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Описание" value={desc} onChange={e => setDesc(e.target.value)} />
            <input placeholder="Тип мебели" value={furniture} onChange={e => setFurniture(e.target.value)} />
            <input type="number" placeholder="Бюджет" value={budget} onChange={e => setBudget(+e.target.value)} />
            <input placeholder="Срок выполнения" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <input placeholder="Город" value={city} onChange={e => setCity(e.target.value)} />
            <button onClick={submit}>Создать</button>
        </div>
    )
}
