import React, {useEffect, useState} from "react"
import folderButtonHover from "../assets/icons/folder-hover.png"
import folderButton from "../assets/icons/folder.png"
import {useSearchSelector, useSearchActions} from "../store"
import "./styles/directorybar.less"

const DirectoryBar: React.FunctionComponent = (props) => {
    const [defaultDir, setDefaultDir] = useState("")
    const [folderHover, setFolderHover] = useState(false)
    const {directory} = useSearchSelector()
    const {setDirectory} = useSearchActions()

    useEffect(() => {
        window.ipcRenderer.invoke("get-downloads-folder").then((f) => {
            f = f.replace(/\\/g, "/")
            setDefaultDir(f)
            setDirectory(f)
        })
    }, [])

    const changeDirectory = async () => {
        let dir = await window.ipcRenderer.invoke("select-directory")
        if (dir) {
            dir = dir.replace(/\\/g, "/")
            setDefaultDir(dir)
            setDirectory(dir)
        }
    }

    const updateDirectory = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dir = event.target.value.replace(/\\/g, "/")
        if (!dir.includes(defaultDir)) {
            setDirectory(defaultDir)
            window.ipcRenderer.invoke("select-directory", defaultDir)
        } else {
            setDirectory(dir)
            window.ipcRenderer.invoke("select-directory", dir)
        }
    }

    const openDirectory = () => {
        window.shell.openPath(directory)
    }

    return (
        <section className="directory-bar">
            <div className="directory-bar-center">
                <img className="directory-bar-img" width="25" height="25" src={folderHover ? folderButtonHover : folderButton} onMouseEnter={() => setFolderHover(true)} onMouseLeave={() => setFolderHover(false)} onClick={changeDirectory}/>
                <input className="directory-bar-box" type="text" value={directory} onDoubleClick={openDirectory} onChange={updateDirectory}/>
            </div>
        </section>
    )
}

export default DirectoryBar