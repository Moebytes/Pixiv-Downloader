import React, {useEffect, useState} from "react"
import {useActionSelector, useActionActions} from "../store"
import "./styles/preview.less"

const Preview: React.FunctionComponent = (props) => {
    const [src, setSrc] = useState("")
    const {previewVisible} = useActionSelector()
    const {setPreviewVisible} = useActionActions()

    useEffect(() => {
        const preview = (event: any, image: string) => {
            if (image) {
                setSrc(image)
                setPreviewVisible(true)
            }
        }
        window.addEventListener("click", close)
        window.ipcRenderer.on("preview", preview)
        return () => {
            window.ipcRenderer.removeListener("preview", preview)
            window.removeEventListener("click", close)
        }
    }, [])

    const close = () => {
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