import React, {useEffect} from "react"
import {useThemeSelector, useThemeActions} from "./store"
import {Themes, OS} from "./reducers/themeReducer"

const lightColorList = {
	"--iconColor": "#4b7bff",
	"--maximizeButton": "#2eafff",
	"--minimizeButton": "#3992ff",
	"--closeButton": "#4973ff",
	"--navColor": "#6e92ff",
	"--background": "#92c3ff",
	"--textColor": "#000000",
	"--textColor2": "#000000",
	"--textboxColor": "#76a2ff",
	"--searchBG": "#7594ff",
	"--searchButton": "#4c94ff",
	"--checkboxColor": "#4c6aff",
	"--clearAllButton": "#799dff",
	"--deleteAllButton": "#7088ff",
	"--iconColor2": "#91d5ff",
	"--finishedColor": "#588aff",
	"--itemBG": "#6c9aff",
	"--itemStroke": "#7eabff",
	"--locationButton": "#4882ff",
	"--trashButton": "#487cff",
	"--macMaximizeButton": "#00ca48",
	"--macCloseButton": "#ff4b59",
	"--macMinimizeButton": "#ffc600",
	"--browserIcon": "#000000",
	"--browserBG": "#ffffff",
	"--titleColor": "#acfacf"
}

const darkColorList = {
	"--iconColor": "#4b7bff",
	"--maximizeButton": "#2eafff",
	"--minimizeButton": "#3992ff",
	"--closeButton": "#4973ff",
	"--navColor": "#324680",
	"--background": "#2a3563",
	"--textColor": "#ffffff",
	"--textColor2": "#000000",
	"--textboxColor": "#3e55aa",
	"--searchBG": "#5675de",
	"--searchButton": "#415fcd",
	"--checkboxColor": "#4c6aff",
	"--clearAllButton": "#5777d2",
	"--deleteAllButton": "#5b70d8",
	"--iconColor2": "#91d5ff",
	"--finishedColor": "#5c8aff",
	"--itemBG": "#2c3c83",
	"--itemStroke": "#304588",
	"--locationButton": "#3f78eb",
	"--trashButton": "#4768ed",
	"--macMaximizeButton": "#00ca48",
	"--macCloseButton": "#ff4b59",
	"--macMinimizeButton": "#ffc600",
	"--browserIcon": "#000000",
	"--browserBG": "#ffffff",
	"--titleColor": "#6b97ff"
}

const LocalStorage: React.FunctionComponent = () => {
    const {theme, os} = useThemeSelector()
    const {setTheme, setOS} = useThemeActions()

    useEffect(() => {
        if (typeof window === "undefined") return
        const colorList = theme.includes("light") ? lightColorList : darkColorList
        for (let i = 0; i < Object.keys(colorList).length; i++) {
            const key = Object.keys(colorList)[i]
            const color = Object.values(colorList)[i]
            document.documentElement.style.setProperty(key, color)
        }
    }, [theme])

    useEffect(() => {
        const initTheme = async () => {
            const savedTheme = await window.ipcRenderer.invoke("get-theme")
            if (savedTheme) setTheme(savedTheme as Themes)
        }
        initTheme()
    }, [])

    useEffect(() => {
        window.ipcRenderer.invoke("save-theme", theme)
    }, [theme])


    useEffect(() => {
        const initOS = async () => {
            const savedOS = await window.ipcRenderer.invoke("get-os")
            if (savedOS) setOS(savedOS as OS)
        }
        initOS()
    }, [])

    useEffect(() => {
        window.ipcRenderer.invoke("save-os", os)
    }, [os])

    return null
}

export default LocalStorage