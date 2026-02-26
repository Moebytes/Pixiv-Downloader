import functions from "../structures/functions"
import React, {useState, useEffect, useEffectEvent, useRef, useReducer} from "react"
import {ProgressBar} from "react-bootstrap"
import CloseContainerIcon from "../assets/svg/close-container.svg"
import LocationIcon from "../assets/svg/location.svg"
import TrashIcon from "../assets/svg/trash.svg"
import BookmarksIcon from "../assets/svg/heart.svg"
import ViewsIcon from "../assets/svg/views.svg"
import pSBC from "shade-blend-color"
import type {PixivIllust} from "pixiv.ts"
import {useActionSelector, useSearchSelector, useThemeSelector} from "../store"
import path from "path"
import "./styles/illustcontainer.less"

export interface IllustContainerProps {
    id: number
    illust: PixivIllust
    remove: (id: number) => void
}

const IllustContainer: React.FunctionComponent<IllustContainerProps> = (props: IllustContainerProps) => {
    const {theme} = useThemeSelector()
    const {previewVisible} = useActionSelector()
    const {translateTitles} = useSearchSelector()
    const [deleted, setDeleted] = useState(false)
    const [output, setOutput] = useState("")
    const [hover, setHover] = useState(false)
    const [progressColor, setProgressColor] = useState("")
    const [backgroundColor, setBackgroundColor] = useState("")
    const [clearSignal, setClearSignal] = useState(false)
    const [deleteSignal, setDeleteSignal] = useState(false)
    const [drag, setDrag] = useState(false)
    const [title, setTitle] = useState(props.illust.title)
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const progressBarRef = useRef<HTMLDivElement>(null)
    const illustContainerRef = useRef<HTMLElement>(null)
    
    useEffect(() => {
        const downloadEnded = (event: any, info: {id: number, output: string}) => {
            if (info.id === props.id) {
                setOutput(info.output)
            }
        }
        const clearAll = () => {
            setClearSignal(true)
        }
        const deleteAll = () => {
            setDeleteSignal(true)
        }
        window.ipcRenderer.on("download-ended", downloadEnded)
        window.ipcRenderer.on("clear-all", clearAll)
        window.ipcRenderer.on("delete-all", deleteAll)
        window.ipcRenderer.on("update-color", forceUpdate)
        return () => {
            window.ipcRenderer.removeListener("download-ended", downloadEnded)
            window.ipcRenderer.removeListener("clear-all", clearAll)
            window.ipcRenderer.removeListener("delete-all", deleteAll)
            window.ipcRenderer.removeListener("update-color", forceUpdate)
        }
    }, [])

    useEffect(() => {
        updateProgressColor()
        updateBackgroundColor()
        updateTitle()
    })

    useEffect(() => {
        if (clearSignal) {
            if (output) closeDownload()
            setClearSignal(false)
        }
        if (deleteSignal) deleteDownload()
    }, [output, clearSignal, deleteSignal])

    const updateTitle = async () => {
        if (title !== props.illust.title) return
        if (translateTitles) {
            const title = await window.ipcRenderer.invoke("translate-title", props.illust.title)
            setTitle(title)
        }
    }

    const deleteDownload = useEffectEvent(async () => {
        if (deleted) return
        setDeleteSignal(false)
        const success = await window.ipcRenderer.invoke("delete-download", props.id)
        if (success) setDeleted(true)
    })

    const closeDownload = useEffectEvent(async () => {
        if (!output) window.ipcRenderer.invoke("delete-download", props.id)
        props.remove(props.id)
    })

    const openLocation = async () => {
        window.ipcRenderer.invoke("open-location", output)
    }

    const updateBackgroundColor = async () => {
        const container = illustContainerRef.current?.querySelector(".illust-container") as HTMLElement
        if (!container) return
        const colors = theme === "light" ? ["#6c9aff"] : ["#2c3c83"]

        if (!colors.includes(backgroundColor)) {
            const color = colors[Math.floor(Math.random() * colors.length)]
            setBackgroundColor(color)
        }

        container.style.backgroundColor = backgroundColor
        container.style.border = `2px solid ${pSBC(0.4, backgroundColor)}`
    }

    const updateProgressColor = () => {
        const progressBar = progressBarRef.current?.querySelector(".progress-bar") as HTMLElement
        if (!output) {
             setProgressColor("#5e7eff")
        } else {
            if (output) setProgressColor("#8fa5ff")
            if (deleted) setProgressColor("#9b6eff")
        }
        progressBar.style.backgroundColor = progressColor
    }

    const generateProgressBar = () => {
        let jsx = <p className="illust-text-progress">Processing...</p>
        let progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        if (output) {
            jsx = <p className="illust-text-progress black">Finished</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        }
        if (deleted) {
            jsx = <p className="illust-text-progress black">Deleted</p>
            progressJSX = <ProgressBar ref={progressBarRef} animated now={100}/>
        }
        return (
            <>
            <div className="illust-text-progress-container">{jsx}</div>
            {progressJSX}
            </>
        )
    }

    const mouseEnter = () => {
        document.documentElement.style.setProperty("--selection-color", pSBC(0.5, backgroundColor))
    }

    const mouseLeave = () => {
        setHover(false)
        document.documentElement.style.setProperty("--selection-color", "#6f4af3")
    }

    const getImage = () => {
        if ((path.extname(output ?? "") === ".gif") || (path.extname(output ?? "") === ".webp") && !deleted) {
            return output
        } else {
            return props.illust.image_urls.large ? props.illust.image_urls.large : props.illust.image_urls.medium
        }
    }

    const preview = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        const source = getImage()
        if (!drag) window.ipcRenderer.invoke("preview", source)
    }

    const delayPress = (event: React.MouseEvent<HTMLElement>) => {
        setDrag(previewVisible)
        if (event.button === 2) {
            return event.stopPropagation()
        } else {
            return
        }
    }

    const openPage = () => {
        let url = `https://www.pixiv.net/en/artworks/${props.illust.id}`
        if (props.illust.type === "novel") url = `https://www.pixiv.net/novel/show.php?id=${props.illust.id}`
        window.ipcRenderer.invoke("open-url", url)
    }

    const openUser = () => {
        window.ipcRenderer.invoke("open-url", `https://www.pixiv.net/en/users/${props.illust.user.id}`)
    }

    return (
        <section ref={illustContainerRef} className="illust-wrap-container" onMouseOver={() => setHover(true)} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
            <div className="illust-container" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="illust-img">
                <img src={getImage()} onMouseDown={delayPress} onContextMenu={preview}/>
            </div>
            <div className="illust-middle">
                <div className="illust-name">
                    <p className="illust-text large hover" onMouseDown={(event) => event.stopPropagation()}><span onClick={() => openPage()}>{title}</span></p>
                </div>
                <div className="illust-info">
                    <p className="illust-text hover" onMouseDown={(event) => event.stopPropagation()}><span onClick={() => openUser()}>{props.illust.user.name}</span></p>
                    <p className="illust-text left" onMouseDown={(event) => event.stopPropagation()}>{props.illust.width}x{props.illust.height}</p>
                </div>
                <div className="illust-stats">
                    <div className="illust-stat">
                        <BookmarksIcon className="illust-stat-img"/>
                        <p className="illust-text">{props.illust.total_bookmarks}</p>
                    </div>
                    <div className="illust-stat">
                        <ViewsIcon className="illust-stat-img"/>
                        <p className="illust-text">{props.illust.total_view}</p>
                    </div>
                    <div className="illust-stat">
                        <p className="illust-text">{functions.prettyFormatDate(props.illust.create_date)}</p>
                    </div>
                </div>
                <div className="illust-progress">
                    {generateProgressBar()}
                </div>
            </div>
            <div className="illust-buttons">
                {hover ? <CloseContainerIcon className="illust-button close-container" onClick={closeDownload}/> : null}
                <div className="illust-button-row">
                    {output ? <LocationIcon className="illust-button" onClick={() => openLocation()} style={{color: "var(--locationButton)"}}/> : null}
                    {output ? <TrashIcon className="illust-button" onClick={() => deleteDownload()} style={{color: "var(--trashButton)"}}/> : null}    
                </div>
            </div>
            </div>
        </section>
    )
}

export default IllustContainer