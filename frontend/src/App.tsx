import { useState } from "react"
import Login from "./pages/Login"
import CreateProject from "./pages/CreateProject"
import MyProjects from "./pages/MyProjects"

export default function App() {
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"))

    return (
        <div style={{ padding: 40 }}>
            <h1>ReFurnish MVP</h1>
            {!loggedIn ? (
                <Login onLogin={() => setLoggedIn(true)} />
            ) : (
                <>
                    <CreateProject />
                    <hr />
                    <MyProjects />
                </>
            )}
        </div>
    )
}
