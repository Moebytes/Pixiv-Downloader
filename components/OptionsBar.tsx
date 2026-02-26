import React, {useEffect} from "react"
import {Dropdown, DropdownButton} from "react-bootstrap"
import {useSearchSelector, useSearchActions} from "../store"
import CheckboxIcon from "../assets/svg/checkbox.svg"
import CheckboxCheckedIcon from "../assets/svg/checkbox-checked.svg"
import "./styles/optionsbar.less"

const OptionsBar: React.FunctionComponent = () => {
    const {kind, format, translate, r18, speed, reverse} = useSearchSelector()
    const {setKind, setFormat, setTranslate, setR18, setSpeed, setReverse} = useSearchActions()

    useEffect(() => {
        initSettings()
    }, [])

    useEffect(() => {
        window.ipcRenderer.invoke("store-settings", {kind, format, translate, r18, speed, reverse})
    })
    
    const initSettings = async () => {
        const settings = await window.ipcRenderer.invoke("init-settings")
        if (settings.kind) setKind(settings.kind)
        if (settings.format) setFormat(settings.format)
        if (settings.translate) setTranslate(settings.translate)
        if (settings.r18) setR18(settings.r18)
        if (settings.reverse) setReverse(settings.reverse)
        if (settings.speed) setSpeed(settings.speed)
    }

    const handleKind = (kind: string) => {
        if (kind === "ugoira") {
            if (format !== "gif" && format !== "zip" && format !== "webp") setFormat("gif")
        } else if (kind === "novel") {
            setFormat("txt")
        } else {
            if (format !== "png" && format !== "jpg") setFormat("png")
        }
        setKind(kind)
    }
    
    const handleTranslate = () => {
        setTranslate(!translate)
    }

    const handleR18 = () => {
        setR18(!r18)
    }

    const handleReverse = () => {
        setReverse(!reverse)
    }

    const handleSpeed = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (value.replace(".", "").length > 2) return
        if (Number.isNaN(Number(value))) return
        setSpeed(value)
    }

    const handleSpeedKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowUp") {
            const getNewSpeed = () => {
                if (Number(speed) + 1 > 99) return Number(speed)
                if (String(speed).includes(".")) return (Number(speed) + 1).toFixed(1)
                return Number(speed) + 1
            }
            setSpeed(String(getNewSpeed()))
        } else if (event.key === "ArrowDown") {
            const getNewSpeed = () => {
                if (Number(speed) - 1 < 0) return Number(speed)
                if (String(speed).includes(".")) return (Number(speed) - 1).toFixed(1)
                return Number(speed) - 1
            }
            setSpeed(String(getNewSpeed()))
        }
    }

    return (
        <section className="options-bar">
            <div className="options-bar-box">
                <p className="options-bar-text">Kind: </p>
                <DropdownButton title={kind} drop="down">
                    <Dropdown.Item active={kind === "illust"} onClick={() => handleKind("illust")}>illust</Dropdown.Item>
                    <Dropdown.Item active={kind === "manga"} onClick={() => handleKind("manga")}>manga</Dropdown.Item>
                    <Dropdown.Item active={kind === "novel"} onClick={() => handleKind("novel")}>novel</Dropdown.Item>
                    <Dropdown.Item active={kind === "ugoira"} onClick={() => handleKind("ugoira")}>ugoira</Dropdown.Item>
                </DropdownButton>
            </div>
            <div className="options-bar-box">
                <p className="options-bar-text">Format: </p>
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
                {translate ? 
                <CheckboxCheckedIcon className="options-bar-checkbox" onClick={handleTranslate}/> :
                <CheckboxIcon className="options-bar-checkbox" onClick={handleTranslate}/>}
                <p className="options-bar-text pointer" onClick={handleTranslate}>Translate</p>
            </div>
            <div className="options-bar-box">
                {r18 ? 
                <CheckboxCheckedIcon className="options-bar-checkbox" onClick={handleR18}/> :
                <CheckboxIcon className="options-bar-checkbox" onClick={handleR18}/>}
                <p className="options-bar-text pointer" onClick={handleR18}>R18</p>
            </div>
            <div className="options-bar-box">
                {reverse ? 
                <CheckboxCheckedIcon className="options-bar-checkbox" onClick={handleReverse}/> :
                <CheckboxIcon className="options-bar-checkbox" onClick={handleReverse}/>}
                <p className="options-bar-text pointer" onClick={handleReverse}>Reverse</p>
            </div>
            <div className="options-bar-box">
                <p className="options-bar-text">Speed: </p>
                <input className="options-bar-input" type="text" min="0.5" max="100" value={speed} onChange={handleSpeed} onKeyDown={handleSpeedKey}/>
            </div>
        </section>
    )
}

export default OptionsBar