import React from "react"
import {useActionSelector} from "../store"
import "./styles/groupaction.less"

const GroupAction: React.FunctionComponent = () => {
    const {clearAll} = useActionSelector()

    const clear = () => {
        window.ipcRenderer.invoke("clear-all")
    }

    const del = () => {
        window.ipcRenderer.invoke("delete-all")
    }

    if (clearAll) {
        return (
            <section className="group-action-container">
                <button className="group-action-button" onClick={clear} style={{backgroundColor: "var(--clearAllButton)"}}>{">> Clear All"}</button>
                <button className="group-action-button" onClick={del} style={{backgroundColor: "var(--deleteAllButton)"}}>{">> Delete All"}</button>
            </section>
        )
    }
    return null
}

export default GroupAction