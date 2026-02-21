import React, {useEffect, useState} from "react"
import {useActionSelector} from "../store"
import "./styles/groupaction.less"

const GroupAction: React.FunctionComponent = (props) => {
    const {clearAll} = useActionSelector()
    const [clearHover, setClearHover] = useState(false)
    const [deleteHover, setDeleteHover] = useState(false)
    const [color, setColor] = useState("light")

    useEffect(() => {
        const updateColor = (event: any, color: string) => {
            setColor(color)
        }
        window.ipcRenderer.on("update-color", updateColor)
        return () => {
            window.ipcRenderer.removeListener("update-color", updateColor)
        }
    }, [])

    const clear = () => {
        window.ipcRenderer.invoke("clear-all")
        setClearHover(false)
    }

    const del = () => {
        window.ipcRenderer.invoke("delete-all")
    }

    if (clearAll) {
        return (
            <section className="group-action-container">
                <button className="group-action-button" onClick={clear}>{">>Clear All"}</button>
                <button className="group-action-button" onClick={del}>{">>Delete All"}</button>
            </section>
        )
    }
    return null
}

export default GroupAction