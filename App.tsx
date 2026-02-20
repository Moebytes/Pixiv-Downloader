import "bootstrap/dist/css/bootstrap.min.css"
import React from "react"
import {createRoot} from "react-dom/client"
import {Provider} from "react-redux"
import store from "./store"
import TitleBar from "./components/TitleBar"
import LogoBar from "./components/LogoBar"
import SearchBar from "./components/SearchBar"
import DirectoryBar from "./components/DirectoryBar"
import OptionsBar from "./components/OptionsBar"
import IllustContainerList from "./components/IllustContainerList"
import GroupAction from "./components/GroupAction"
import ContextMenu from "./components/ContextMenu"
import Preview from "./components/Preview"
import AdvancedSettings from "./components/AdvancedSettings"
import LocalStorage from "./LocalStorage"
import "./index.less"

const App = () => {
  return (
    <main className="app">
        <TitleBar/>
        <ContextMenu/>
        <LocalStorage/>
        <AdvancedSettings/>
        <Preview/>
        <LogoBar/>
        <SearchBar/>
        <DirectoryBar/>
        <OptionsBar/>
        <GroupAction/>
        <IllustContainerList/>
    </main>
  )
}

const root = createRoot(document.getElementById("root")!)
root.render(<Provider store={store}><App/></Provider>)