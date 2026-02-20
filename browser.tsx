import React, {useEffect} from "react"
import {createRoot} from "react-dom/client"
import {Provider} from "react-redux"
import store from "./store"
import BrowserTitleBar from "./components/BrowserTitleBar"
import LocalStorage from "./LocalStorage"
import functions from "./structures/functions"
import "./browser.less"

const App: React.FunctionComponent = () => {
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
        webview?.addEventListener("dom-ready", ready)
        window.ipcRenderer.on("navigate-home", navigateHome)
        return () => {
            window.ipcRenderer.removeListener("navigate-home", navigateHome)
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