import React, {useEffect, useState, useRef} from "react"
import {useActionSelector} from "../store"
import "./styles/contextmenu.less"

const ContextMenu: React.FunctionComponent = (props) => {
    const {previewVisible} = useActionSelector()
    const [visible, setVisible] = useState(false)
    const [hover, setHover] = useState(false)
    const contextMenu = useRef(null) as React.RefObject<HTMLDivElement>

    useEffect(() => {
        document.onclick = () => {
            if (!hover) setVisible(false)
        }
        window.oncontextmenu = async (event: MouseEvent) => {
            setVisible(true)
            contextMenu.current!.style.left = `${event.x}px`
            contextMenu.current!.style.top = `${event.y}px`
        }
    }, [])

    useEffect(() => {
        if (previewVisible) setVisible(false)
    })

    const copy = () => {
        const selectedText = window.getSelection()?.toString().trim()
        if (selectedText) {
            window.clipboard.writeText(selectedText)
        } else {
            window.clipboard.clear()
        }
    }

    const paste = () => {
        window.ipcRenderer.invoke("trigger-paste")
    }

    if (visible) {
        return (
            <section ref={contextMenu} className="context-menu" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <button className="context-button" onClick={() => copy()}>Copy</button>
                <button className="context-button" onClick={() => paste()}>Paste</button>
            </section>
        )
    }
    return null
}

export default ContextMenu