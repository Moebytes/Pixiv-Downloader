import React, {useEffect} from "react"
import {createRoot} from "react-dom/client"
import {useThemeSelector, useThemeActions} from "./reducers/themeReducer"
import {Provider} from "react-redux"
import store from "./store"
import BrowserTitleBar from "./components/BrowserTitleBar"
import LocalStorage from "./LocalStorage"
import functions from "./structures/functions"
import {OS} from "./reducers/themeReducer"
import "./browser.less"

const App: React.FunctionComponent = () => {
    const {os} = useThemeSelector()
    const {setOS} = useThemeActions()

    useEffect(() => {
        const webview = document.getElementById("webview") as any
        const navigateHome = () => {
            webview.loadURL("https://www.pixiv.net/")
        }
        const ready = async () => {
            webview?.setZoomFactor(0.8)
            const refreshToken = await window.ipcRenderer.invoke("get-refresh-token")
            if (!refreshToken) {
                const loginURL = functions.getOauthURL()
                webview.loadURL(loginURL)
            }
            webview?.removeEventListener("dom-ready", ready)
        }
        const initTheme = async () => {
            const os = await window.ipcRenderer.invoke("get-os")
            setOS(os)
            window.ipcRenderer.invoke("ready-to-show")
        }
        const updateTheme = (event: any, os: OS) => {
            setOS(os)
        }
        initTheme()
        webview?.addEventListener("dom-ready", ready)
        window.ipcRenderer.on("navigate-home", navigateHome)
        window.ipcRenderer.on("update-theme", updateTheme)
        return () => {
            window.ipcRenderer.removeListener("navigate-home", navigateHome)
            window.ipcRenderer.removeListener("update-theme", updateTheme)
        }
    }, [])

    return (
        <main className="app">
            <BrowserTitleBar/>
            <LocalStorage/>
            <webview id="webview" src="https://www.pixiv.net/" partition="persist:webview-partition"></webview>
        </main>
    )
}

const root = createRoot(document.getElementById("root")!)
root.render(<Provider store={store}><App/></Provider>)