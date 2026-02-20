import React, {useState, useEffect} from "react"
import {useThemeSelector, useThemeActions} from "../store"
import CircleIcon from "../assets/svg/circle.svg"
import CircleCloseIcon from "../assets/svg/circle-close.svg"
import CircleMinimizeIcon from "../assets/svg/circle-minimize.svg"
import CircleMaximizeIcon from "../assets/svg/circle-maximize.svg"
import CloseIcon from "../assets/svg/close.svg"
import MinimizeIcon from "../assets/svg/minimize.svg"
import MaximizeIcon from "../assets/svg/maximize.svg"
import HomeIcon from "../assets/svg/home.svg"
import BackIcon from "../assets/svg/back.svg"
import ForwardIcon from "../assets/svg/forward.svg"
import RevertIcon from "../assets/svg/revert.svg"
import ExternalIcon from "../assets/svg/external.svg"
import DownloadIcon from "../assets/svg/download.svg"
import WindowsIcon from "../assets/svg/windows.svg"
import MacIcon from "../assets/svg/mac.svg"
import "./styles/browsertitlebar.less"

const BrowserTitleBar: React.FunctionComponent = () => {
    const {os} = useThemeSelector()
    const {setOS} = useThemeActions()
    const [iconHover, setIconHover] = useState(false)

    useEffect(() => {
        const openURL = (event: any, url: string) => {
            const web = document.getElementById("webview") as any
            web.loadURL(url)
        }
        window.ipcRenderer.on("open-url", openURL)
        return () => {
            window.ipcRenderer.removeListener("open-url", openURL)
        }
    })

    const onMouseDown = () => {
        window.ipcRenderer.send("moveWindow")
    }

    const close = () => {
        window.ipcRenderer.invoke("close")
    }

    const minimize = async () => {
        await window.ipcRenderer.invoke("minimize")
        setIconHover(false)
    }

    const maximize = () => {
        window.ipcRenderer.invoke("maximize")
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

    const refresh = () => {
        const web = document.getElementById("webview") as any
        web.reload()
    }

    const external = () => {
        const web = document.getElementById("webview") as any
        window.shell.openExternal(web.getURL())
    }

    const download = async () => {
        const web = document.getElementById("webview") as any
        window.ipcRenderer.invoke("download-url", web.getURL())
    }

    const switchOSStyle = () => {
        setOS(os === "mac" ? "windows" : "mac")
    }

    const macTitleBar = () => {
        return (
            <>
            <div className="title-group-container">
                <div className="title-mac-container" onMouseEnter={() => setIconHover(true)} onMouseLeave={() => setIconHover(false)}>
                    {iconHover ? <>
                    <CircleCloseIcon className="title-mac-button" color="var(--macCloseButton)" onClick={close}/>
                    <CircleMinimizeIcon className="title-mac-button" color="var(--macMinimizeButton)" onClick={minimize}/>
                    <CircleMaximizeIcon className="title-mac-button" color="var(--macMaximizeButton)" onClick={maximize}/>
                    </> : <>
                    <CircleIcon className="title-mac-button" color="var(--macCloseButton)" onClick={close}/>
                    <CircleIcon className="title-mac-button" color="var(--macMinimizeButton)" onClick={minimize}/>
                    <CircleIcon className="title-mac-button" color="var(--macMaximizeButton)" onClick={maximize}/>
                    </>}
                </div>
                <div className="title-button-container">
                    <HomeIcon className="title-bar-button" onClick={home}/>
                    <BackIcon className="title-bar-button" onClick={back}/>
                    <ForwardIcon className="title-bar-button" onClick={forward}/>
                    <RevertIcon className="title-bar-button" onClick={refresh}/>
                    <MacIcon className="title-bar-button" onClick={switchOSStyle}/>
                </div>
            </div>
            <div className="title-group-container">
                <div className="title-button-container">
                    <ExternalIcon className="title-bar-button" onClick={external}/>
                    <DownloadIcon className="title-bar-button" onClick={download}/>
                </div>
            </div>
            </>
        )
    }

    const windowsTitleBar = () => {
        return (
            <>
            <div className="title-group-container">
                <div className="title-button-container">
                    <HomeIcon className="title-bar-button" onClick={home}/>
                    <BackIcon className="title-bar-button" onClick={back}/>
                    <ForwardIcon className="title-bar-button" onClick={forward}/>
                    <RevertIcon className="title-bar-button" onClick={refresh}/>
                    <WindowsIcon className="title-bar-button" onClick={switchOSStyle}/>
                </div>
            </div>
            <div className="title-group-container">
                <div className="title-win-container">
                    <ExternalIcon className="title-bar-button" onClick={external}/>
                    <DownloadIcon className="title-bar-button" onClick={download}/>
                    <MinimizeIcon className="title-win-button" onClick={minimize}/>
                    <MaximizeIcon className="title-win-button" onClick={maximize} style={{marginLeft: "4px"}}/>
                    <CloseIcon className="title-win-button" onClick={close}/>
                </div>
            </div>
            </>
        )
    }

    return (
        <section className="title-bar" onMouseDown={onMouseDown}>
                <div className="title-bar-drag-area">
                    {os === "mac" ? macTitleBar() : windowsTitleBar()}
                </div>
        </section>
    )
}

export default BrowserTitleBar