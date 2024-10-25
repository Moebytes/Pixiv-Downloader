import {ipcRenderer} from "electron"
import React, {useState, useEffect, useContext} from "react"
import {FetchTextContext} from "../renderer"
import "./styles/errormessage.less"

const ErrorMessage: React.FunctionComponent = (props) => {
    const [error, setError] = useState(null as "search" | "login" | null)
    const {fetchText, setFetchText} = useContext(FetchTextContext)
    
    useEffect(() => {
        const downloadError = (event: any, err: any) => {
            setError(err)
        }
        ipcRenderer.on("download-error", downloadError)
        return () => {
            ipcRenderer.removeListener("download-error", downloadError)
        }
    }, [])

    const getMessage = () => {
        if (error === "search") {
            return "Could not find any illustrations."
        } else if (error === "login") {
            return "You need to log in through the browser first."
        }
    }

    if (fetchText) {
        return (
            <section className="error-message">
                <p className="fetch-message-text">{fetchText}</p>
            </section>
        )
    }

    if (error) {
        setTimeout(() => {setError(null)}, 3000)
        return (
            <section className="error-message">
                <p className="error-message-text">{getMessage()}</p>
            </section>
        )
    }
    return null
}

export default ErrorMessage