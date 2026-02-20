import React, {useContext, useEffect, useState} from "react"
import clearAllButtonHover from "../assets/icons/clearAll-hover.png"
import clearAllButton from "../assets/icons/clearAll.png"
import deleteAllButton from "../assets/icons/deleteAll.png"
import deleteAllButtonHover from "../assets/icons/deleteAll-hover.png"
import clearAllButtonDarkHover from "../assets/icons/clearAll-dark-hover.png"
import clearAllButtonDark from "../assets/icons/clearAll-dark.png"
import deleteAllButtonDark from "../assets/icons/deleteAll-dark.png"
import deleteAllButtonDarkHover from "../assets/icons/deleteAll-dark-hover.png"
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

    const getImage = (type: string) => {
        if (type === "clear") {
            if (color === "light") {
                if (clearHover) {
                    return clearAllButtonHover
                } else {
                    return clearAllButton
                }
            } else {
                if (clearHover) {
                    return clearAllButtonDarkHover
                } else {
                    return clearAllButtonDark
                }
            }
        } else if (type === "delete") {
            if (color === "light") {
                if (deleteHover) {
                    return deleteAllButtonHover
                } else {
                    return deleteAllButton
                }
            } else {
                if (deleteHover) {
                    return deleteAllButtonDarkHover
                } else {
                    return deleteAllButtonDark
                }
            }
        }
    }

    if (clearAll) {
        return (
            <section className="group-action-container">
                    <img src={getImage("clear")} onClick={clear} className="group-action-button" width="319" height="61" onMouseEnter={() => setClearHover(true)} onMouseLeave={() => setClearHover(false)}/>
                    <img src={getImage("delete")} onClick={del} className="group-action-button" width="319" height="61" onMouseEnter={() => setDeleteHover(true)} onMouseLeave={() => setDeleteHover(false)}/>
            </section>
        )
    }
    return null
}

export default GroupAction