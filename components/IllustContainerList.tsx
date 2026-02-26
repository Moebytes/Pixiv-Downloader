import React, {useState, useEffect} from "react"
import IllustContainer from "./IllustContainer"
import {ReactSortable} from "react-sortablejs"
import {useActionActions} from "../store"
import type {PixivIllust} from "pixiv.ts"
import "./styles/illustcontainerlist.less"

const IllustContainerList: React.FunctionComponent = (props) => {
    const {setClearAll} = useActionActions()
    const [containers, setContainers] = useState([] as  Array<{id: number, jsx: any}>)
    useEffect(() => {
        const downloadStarted = async (event: any, info: {id: number, illust: PixivIllust}) => {
            setContainers(prev => {
                let newState = [...prev]
                const index = newState.findIndex((c) => c.id === info.id)
                if (index === -1) newState = [...newState, {id: info.id, jsx: <IllustContainer key={info.id} id={info.id} illust={info.illust} remove={removeContainer}/>}]
                return newState
            })
        }
        window.ipcRenderer.on("download-started", downloadStarted)
        return () => {
            window.ipcRenderer.removeListener("download-started", downloadStarted)
        }
    }, [])

    useEffect(() => {
        update()
    })

    const update = () => {
        let found = containers.length ? true : false
        setClearAll(found)
    }

    const removeContainer = (id: number) => {
        setContainers(prev => {
            const newState = [...prev]
            const index = newState.findIndex((c) => c.id === id)
            if  (index !== -1) newState.splice(index, 1)
            return newState
        })
    }

    return (
        <ReactSortable tag="ul" list={containers} setList={setContainers} animation={150}
            ghostClass="list-ghost" chosenClass="list-chosen" dragClass="list-drag"
            forceFallback={true} fallbackOnBody={true}>
            {containers.map((c) => (
                <li key={c.id}>
                    {c.jsx}
                </li>
            ))}
        </ReactSortable>
    )
}

export default IllustContainerList