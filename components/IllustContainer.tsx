import functions from "../structures/functions"
import React, {useState, useEffect, useRef, useReducer, useContext} from "react"
import {ProgressBar} from "react-bootstrap"
import closeContainer from "../assets/icons/closeContainer.png"
import locationButton from "../assets/icons/location.png"
import trashButton from "../assets/icons/trash.png"
import closeContainerHover from "../assets/icons/closeContainer-hover.png"
import locationButtonHover from "../assets/icons/location-hover.png"
import trashButtonHover from "../assets/icons/trash-hover.png"
import pSBC from "shade-blend-color"
import bookmarks from "../assets/icons/bookmarks.png"
import likes from "../assets/icons/likes.png"
import views from "../assets/icons/views.png"
import type {PixivIllust} from "pixiv.ts"
import {useActionSelector, useSearchSelector} from "../store"
import path from "path"
import "./styles/illustcontainer.less"

export interface IllustContainerProps {
    id: number
    illust: PixivIllust
    remove: (id: number) => void
}

const IllustContainer: React.FunctionComponent<IllustContainerProps> = (props: IllustContainerProps) => {
    const {previewVisible} = useActionSelector()
    const {translateTitles} = useSearchSelector()
    const [deleted, setDeleted] = useState(false)
    const [output, setOutput] = useState("")
    const [hover, setHover] = useState(false)
    const [hoverClose, setHoverClose] = useState(false)
    const [hoverLocation, setHoverLocation] = useState(false)
    const [hoverTrash, setHoverTrash] = useState(false)
    const [progressColor, setProgressColor] = useState("")
    const [backgroundColor, setBackgroundColor] = useState("")
    const [clearSignal, setClearSignal] = useState(false)
    const [deleteSignal, setDeleteSignal] = useState(false)
    const [drag, setDrag] = useState(false)
    const [title, setTitle] = useState(props.illust.title)
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0)
    const progressBarRef = useRef(null) as React.RefObject<HTMLDivElement>
    const illustContainerRef = useRef(null) as React.RefObject<HTMLElement>
    
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
        if (clearSignal) {
            if (output) closeDownload()
            setClearSignal(false)
        }
        if (deleteSignal) deleteDownload()
    })

    const updateTitle = async () => {
        if (translateTitles) {
            const title = await window.ipcRenderer.invoke("translate-title", props.illust.title)
            setTitle(title)
        } else {
            setTitle(props.illust.title)
        }
    }

    const deleteDownload = async () => {
        if (deleted) return
        setDeleteSignal(false)
        const success = await window.ipcRenderer.invoke("delete-download", props.id)
        if (success) setDeleted(true)
    }

    const closeDownload = async () => {
        if (!output) window.ipcRenderer.invoke("delete-download", props.id)
        props.remove(props.id)
    }

    const openLocation = async () => {
        window.ipcRenderer.invoke("open-location", output)
    }

    const updateBackgroundColor = async () => {
        const colors = ["#3447f6"]
        const container = illustContainerRef.current?.querySelector(".illust-container") as HTMLElement
        if (!container) return
        if (!backgroundColor) {
            const color = colors[Math.floor(Math.random() * colors.length)]
            setBackgroundColor(color)
        }
        const theme = await window.ipcRenderer.invoke("get-theme")
        if (theme === "light") {
            const text = illustContainerRef.current?.querySelectorAll(".illust-text, .illust-text-alt") as NodeListOf<HTMLElement>
            text.forEach((t) => {
                t.style.color = "black"
            })
            container.style.backgroundColor = backgroundColor
            container.style.border = `2px solid ${pSBC(0.4, backgroundColor)}`
        } else {
            const text = illustContainerRef.current?.querySelectorAll(".illust-text, .illust-text-alt") as NodeListOf<HTMLElement>
            text.forEach((t) => {
                t.style.color = backgroundColor
            })
            container.style.backgroundColor = "#090409"
            container.style.border = `2px solid #090409`
        }
    }

    const updateProgressColor = () => {
        const colors = ["#214dff"]
        const progressBar = progressBarRef.current?.querySelector(".progress-bar") as HTMLElement
        if (!output) {
             setProgressColor("#214dff")
        } else {
            // if (progressColor === "#214dff") setProgressColor(colors[Math.floor(Math.random() * colors.length)])
            if (output) setProgressColor("#3e63fa")
            if (deleted) setProgressColor("#6721ff")
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
                        <img className="illust-stat-img" src={bookmarks}/>
                        <p className="illust-text">{props.illust.total_bookmarks}</p>
                    </div>
                    <div className="illust-stat">
                        <img className="illust-stat-img" src={views}/>
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
                {hover ? <img className="illust-button close-container" width="28" height="28" onMouseDown={(event) => event.stopPropagation()} src={hoverClose ? closeContainerHover : closeContainer} onClick={closeDownload} onMouseEnter={() => setHoverClose(true)} onMouseLeave={() => setHoverClose(false)}/> : null}
                <div className="illust-button-row">
                    {output ? <img className="illust-button" width="50" height="50" onMouseDown={(event) => event.stopPropagation()} src={hoverLocation ? locationButtonHover : locationButton} onClick={openLocation} onMouseEnter={() => setHoverLocation(true)} onMouseLeave={() => setHoverLocation(false)}/> : null}
                    {output ? <img className="illust-button" width="50" height="50" onMouseDown={(event) => event.stopPropagation()} src={hoverTrash ? trashButtonHover : trashButton} onClick={deleteDownload} onMouseEnter={() => setHoverTrash(true)} onMouseLeave={() => setHoverTrash(false)}/> : null}    
                </div>
            </div>
            </div>
        </section>
    )
}

export default IllustContainer