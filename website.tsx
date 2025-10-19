import {ipcRenderer} from "electron"
import React, {useEffect} from "react"
import ReactDom from "react-dom"
import BrowserTitleBar from "./components/BrowserTitleBar"
import functions from "./structures/functions"
import "./website.less"

const App: React.FunctionComponent = () => {
    useEffect(() => {
        const webview = document.getElementById("webview") as any
        const navigateHome = () => {
            webview.loadURL("https://www.pixiv.net/")
        }
        const ready = async () => {
            webview?.setZoomFactor(0.8)
            const refreshToken = await ipcRenderer.invoke("get-refresh-token")
            console.log(refreshToken)
            if (!refreshToken) {
                const loginURL = functions.getOauthURL()
                console.log(loginURL)
                webview.loadURL(loginURL)
            }
            webview?.removeEventListener("dom-ready", ready)
        }
        webview?.addEventListener("dom-ready", ready)
        ipcRenderer.on("navigate-home", navigateHome)
        return () => {
            ipcRenderer.removeListener("navigate-home", navigateHome)
        }
    }, [])

    return (
        <main className="app">
            <BrowserTitleBar/>
            <webview id="webview" src="https://www.pixiv.net/" partition="persist:webview-partition"></webview>
        </main>
    )
}

ReactDom.render(<App/>, document.getElementById("root"))