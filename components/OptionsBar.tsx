import {ipcRenderer} from "electron"
import React, {useContext, useEffect, useState} from "react"
import {Dropdown, DropdownButton} from "react-bootstrap"
import {KindContext, FormatContext, TranslateContext, R18Context, ReverseContext, SpeedContext} from "../renderer"
import "./styles/optionsbar.less"

const OptionsBar: React.FunctionComponent = (props) => {
    const {kind, setKind} = useContext(KindContext)
    const {format, setFormat} = useContext(FormatContext)
    const {translate, setTranslate} = useContext(TranslateContext)
    const {r18, setR18} = useContext(R18Context)
    const {speed, setSpeed} = useContext(SpeedContext)
    const {reverse, setReverse} = useContext(ReverseContext)

    useEffect(() => {
        initSettings()
    }, [])

    useEffect(() => {
        ipcRenderer.invoke("store-settings", {kind, format, translate, r18, speed, reverse})
    })
    
    const initSettings = async () => {
        const settings = await ipcRenderer.invoke("init-settings")
        if (settings.kind) setKind(settings.kind)
        if (settings.format) setFormat(settings.format)
        if (settings.translate) setTranslate(settings.translate)
        if (settings.r18) setR18(settings.r18)
        if (settings.reverse) setReverse(settings.reverse)
        if (settings.speed) setSpeed(settings.speed)
    }

    const handleKind = (kind: string) => {
        if (kind === "ugoira") {
            if (format !== "gif" || format !== "zip" || format !== "webp") setFormat("gif")
        } else if (kind === "novel") {
            setFormat("txt")
        } else {
            if (format !== "png" || format !== "jpg") setFormat("png")
        }
        setKind(kind)
    }
    
    const handleTranslate = () => {
        setTranslate((prev: any) => !prev)
    }

    const handleR18 = () => {
        setR18((prev: any) => !prev)
    }

    const handleReverse = () => {
        setReverse((prev: any) => !prev)
    }

    const handleSpeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.replace(".", "").length > 2) return
        if (Number.isNaN(Number(value))) return
        setSpeed(value)
    }

    const handleSpeedKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            setSpeed((prev: any) => {
                if (Number(prev) + 1 > 99) return Number(prev)
                if (String(prev).includes(".")) return (Number(prev) + 1).toFixed(1)
                return Number(prev) + 1
            })
        } else if (event.key === "ArrowDown") {
            setSpeed((prev: any) => {
                if (Number(prev) - 1 < 0) return Number(prev)
                if (String(prev).includes(".")) return (Number(prev) - 1).toFixed(1)
                return Number(prev) - 1
            })
        }
    }

    return (
        <section className="options-bar">
            <div className="options-bar-box">
                <p className="options-bar-text">kind: </p>
                <DropdownButton title={kind} drop="down">
                    <Dropdown.Item active={kind === "illust"} onClick={() => handleKind("illust")}>illust</Dropdown.Item>
                    <Dropdown.Item active={kind === "manga"} onClick={() => handleKind("manga")}>manga</Dropdown.Item>
                    <Dropdown.Item active={kind === "novel"} onClick={() => handleKind("novel")}>novel</Dropdown.Item>
                    <Dropdown.Item active={kind === "ugoira"} onClick={() => handleKind("ugoira")}>ugoira</Dropdown.Item>
                </DropdownButton>
            </div>
            <div className="options-bar-box">
                <p className="options-bar-text">format: </p>
                {kind === "ugoira" ? 
                <DropdownButton title={format} drop="down">
                    <Dropdown.Item active={format === "gif"} onClick={() => setFormat("gif")}>gif</Dropdown.Item>
                    <Dropdown.Item active={format === "webp"} onClick={() => setFormat("webp")}>webp</Dropdown.Item>
                    <Dropdown.Item active={format === "zip"} onClick={() => setFormat("zip")}>zip</Dropdown.Item>
                </DropdownButton>
                : kind === "novel" ?
                <DropdownButton title={format} drop="down">
                    <Dropdown.Item active={format === "txt"} onClick={() => setFormat("txt")}>txt</Dropdown.Item>
                </DropdownButton>
                :
                <DropdownButton title={format} drop="down">
                    <Dropdown.Item active={format === "png"} onClick={() => setFormat("png")}>png</Dropdown.Item>
                    <Dropdown.Item active={format === "jpg"} onClick={() => setFormat("jpg")}>jpg</Dropdown.Item>
                </DropdownButton>
                }
            </div>
            <div className="options-bar-box">
                <input className="options-bar-checkbox" type="checkbox" checked={translate} onClick={handleTranslate}/>
                <p className="options-bar-text pointer" onClick={handleTranslate}>translate</p>
            </div>
            <div className="options-bar-box">
                <input className="options-bar-checkbox" type="checkbox" checked={r18} onClick={handleR18}/>
                <p className="options-bar-text pointer" onClick={handleR18}>r18</p>
            </div>
            <div className="options-bar-box">
                <input className="options-bar-checkbox" type="checkbox" checked={reverse} onClick={handleReverse}/>
                <p className="options-bar-text pointer" onClick={handleReverse}>reverse</p>
            </div>
            <div className="options-bar-box">
                <p className="options-bar-text">speed: </p>
                <input className="options-bar-input" type="text" min="0.5" max="100" value={speed} onChange={handleSpeed} onKeyDown={handleSpeedKey}/>
            </div>
        </section>
    )
}

export default OptionsBar