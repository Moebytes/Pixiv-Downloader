import React, {useState, useEffect, useContext} from "react"
import {useSearchSelector} from "../store"
import "./styles/errormessage.less"

const ErrorMessage: React.FunctionComponent = (props) => {
    const [error, setError] = useState(null as "search" | "login" | null)
    const {fetchText} = useSearchSelector()
    
    useEffect(() => {
        const downloadError = (event: any, err: any) => {
            setError(err)
        }
        window.ipcRenderer.on("download-error", downloadError)
        return () => {
            window.ipcRenderer.removeListener("download-error", downloadError)
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