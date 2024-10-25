import {ipcRenderer} from "electron"
import React, {useContext, useEffect, useState} from "react"
import {PreviewContext} from "../renderer"
import functions from "../structures/functions"
import "./styles/preview.less"

const Preview: React.FunctionComponent = (props) => {
    const [src, setSrc] = useState("")
    const {previewVisible, setPreviewVisible} = useContext(PreviewContext)

    useEffect(() => {
        const preview = (event: any, image: string) => {
            if (image) {
                functions.logoDrag(false)
                setSrc(image)
                setPreviewVisible(true)
            }
        }
        window.addEventListener("click", close)
        ipcRenderer.on("preview", preview)
        return () => {
            ipcRenderer.removeListener("preview", preview)
            window.removeEventListener("click", close)
        }
    }, [])

    const close = () => {
        functions.logoDrag(true)
        setPreviewVisible(false)
    }

    if (previewVisible) {
        return (
            <section className="preview-container" onClick={close}>
                <div className="preview-box">
                    <img className="preview-img" src={src}/>
                </div>
            </section>
        )
    }
    return null
}

export default Preview