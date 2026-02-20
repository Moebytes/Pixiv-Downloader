import React, {useState, useEffect, useContext} from "react"
import IllustContainer from "./IllustContainer"
import Reorder from "react-reorder"
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

    const reorder = (event: React.MouseEvent, from: number, to: number) => {
        setContainers(prev => {
            const newState = [...prev]
            newState.splice(to, 0, newState.splice(from, 1)[0])
            return newState
        })
    }

    return (
        <Reorder reorderId="illust-containers" component="ul" holdTime={50} onReorder={reorder}>{
            containers.map((c) => (
                <li key={c.id}>
                    {c.jsx}
                </li>
            ))
        }</Reorder>
    )
}

export default IllustContainerList