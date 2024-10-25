import React, {useState, useEffect} from "react"
import {ipcRenderer} from "electron"
import {getCurrentWindow, shell} from "@electron/remote"
import minimizeButton from "../assets/icons/browserMinimize.png"
import maximizeButton from "../assets/icons/browserMaximize.png"
import closeButton from "../assets/icons/browserClose.png"
import minimizeButtonHover from "../assets/icons/minimize-hover.png"
import maximizeButtonHover from "../assets/icons/maximize-hover.png"
import closeButtonHover from "../assets/icons/close-hover.png"
import backButton from "../assets/icons/backButton.png"
import backButtonHover from "../assets/icons/backButton-hover.png"
import forwardButton from "../assets/icons/forwardButton.png"
import forwardButtonHover from "../assets/icons/forwardButton-hover.png"
import homeButton from "../assets/icons/homeButton.png"
import homeButtonHover from "../assets/icons/homeButton-hover.png"
import downloadButton from "../assets/icons/downloadButton.png"
import downloadButtonHover from "../assets/icons/downloadButton-hover.png"
import externalButton from "../assets/icons/externalButton.png"
import externalButtonHover from "../assets/icons/externalButton-hover.png"
import refreshButton from "../assets/icons/refreshButton.png"
import refreshButtonHover from "../assets/icons/refreshButton-hover.png"
import "./styles/browsertitlebar.less"

const BrowserTitleBar: React.FunctionComponent = (props) => {
    let [hoverClose, setHoverClose] = useState(false)
    let [hoverMin, setHoverMin] = useState(false)
    let [hoverMax, setHoverMax] = useState(false)
    let [hoverHome, setHoverHome] = useState(false)
    let [hoverBack, setHoverBack] = useState(false)
    let [hoverForward, setHoverForward] = useState(false)
    let [hoverDownload, setHoverDownload] = useState(false)
    let [hoverExternal, setHoverExternal] = useState(false)
    let [hoverRefresh, setHoverRefresh] = useState(false)

    useEffect(() => {
        const openURL = (event: any, url: string) => {
            const web = document.getElementById("webview") as any
            web.loadURL(url)
        }
        ipcRenderer.on("open-url", openURL)
        return () => {
            ipcRenderer.removeListener("open-url", openURL)
        }
    })

    const minimize = () => {
        getCurrentWindow().minimize()
    }

    const maximize = () => {
        const window = getCurrentWindow()
        if (window.isMaximized()) {
            window.unmaximize()
        } else {
            window.maximize()
        }
    }
    
    const close = () => {
        getCurrentWindow().close()
    }

    const home = () => {
        const web = document.getElementById("webview") as any
        web.loadURL("https://www.pixiv.net/")
    }

    const back = () => {
        const web = document.getElementById("webview") as any
        if (web.canGoBack()) {
            web.goBack()
        }
    }

    const forward = () => {
        const web = document.getElementById("webview") as any
        if (web.canGoForward()) {
            web.goForward()
        }
    }

    const download = async () => {
        const web = document.getElementById("webview") as any
        ipcRenderer.invoke("download-url", web.getURL())
    }

    const external = () => {
        const web = document.getElementById("webview") as any
        shell.openExternal(web.getURL())
    }

    const refresh = () => {
        const web = document.getElementById("webview") as any
        web.reload()
    }

    return (
        <section className="title-bar">
                <div className="title-bar-drag-area">
                    <div className="title-container">
                        <img height="20" width="20" src={hoverHome ? homeButtonHover : homeButton} className="title-bar-button" onClick={home} onMouseEnter={() => setHoverHome(true)} onMouseLeave={() => setHoverHome(false)}/>
                        <img height="20" width="20" src={hoverBack ? backButtonHover : backButton} className="title-bar-button" onClick={back} onMouseEnter={() => setHoverBack(true)} onMouseLeave={() => setHoverBack(false)}/>
                        <img height="20" width="20" src={hoverForward ? forwardButtonHover : forwardButton} className="title-bar-button" onClick={forward} onMouseEnter={() => setHoverForward(true)} onMouseLeave={() => setHoverForward(false)}/>
                        <img height="20" width="20" src={hoverRefresh ? refreshButtonHover : refreshButton} className="title-bar-button" onClick={refresh} onMouseEnter={() => setHoverRefresh(true)} onMouseLeave={() => setHoverRefresh(false)}/>
                    </div>
                    <div className="title-bar-buttons">
                        <img src={hoverExternal ? externalButtonHover : externalButton} height="20" width="20" className="title-bar-button" onClick={external} onMouseEnter={() => setHoverExternal(true)} onMouseLeave={() => setHoverExternal(false)}/>
                        <img src={hoverDownload ? downloadButtonHover : downloadButton} height="20" width="20" className="title-bar-button" onClick={download} onMouseEnter={() => setHoverDownload(true)} onMouseLeave={() => setHoverDownload(false)}/>
                        <img src={hoverMin ? minimizeButtonHover : minimizeButton} height="20" width="20" className="title-bar-button" onClick={minimize} onMouseEnter={() => setHoverMin(true)} onMouseLeave={() => setHoverMin(false)}/>
                        <img src={hoverMax ? maximizeButtonHover : maximizeButton} height="20" width="20" className="title-bar-button" onClick={maximize} onMouseEnter={() => setHoverMax(true)} onMouseLeave={() => setHoverMax(false)}/>
                        <img src={hoverClose ? closeButtonHover : closeButton} height="20" width="20" className="title-bar-button" onClick={close} onMouseEnter={() => setHoverClose(true)} onMouseLeave={() => setHoverClose(false)}/>
                    </div>
                </div>
        </section>
    )
}

export default BrowserTitleBar