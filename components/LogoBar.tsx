import React from "react"
import {useActionSelector} from "../store"
import logo from "../assets/images/logo.png"
import "./styles/logobar.less"

const LogoBar: React.FunctionComponent = (props) => {
    const {advSettings} = useActionSelector()
    
    return (
        <section className="logo-bar">
            <div className="logo-bar-container">
                <img src={logo} className="logo" width="418" height="118"/>
                {!advSettings ? <div className="logo-bar-drag"></div> : null}
            </div>
        </section>
    )
}

export default LogoBar