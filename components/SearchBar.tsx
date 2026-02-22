import React, {useState, useEffect, useRef} from "react"
import {useSearchSelector, useSearchActions} from "../store"
import SearchIcon from "../assets/svg/search.svg"
import ErrorMessage from "./ErrorMessage"
import "./styles/searchbar.less"

const SearchBar: React.FunctionComponent = () => {
    const {kind, format, directory, r18, speed, reverse, translate, template, folderMap, 
        illustLimit, mangaLimit, ugoiraLimit, sort, target, translateTitles, restrict, moe, 
        bookmarks, bookmarkFilter, ai, flattenDirectory
    } = useSearchSelector()
    const {setKind, setFormat, setFetchText} = useSearchActions()
    const [id, setID] = useState(1)
    const [searchHover, setSearchHover] = useState(false)
    const searchBoxRef = useRef(null) as React.RefObject<HTMLInputElement>
    
    useEffect(() => {
        const downloadURL = (event: any, url: string) => {
            if (url) download(url)
        }
        const updateFetchText = (event: any, text: string) => {
            setFetchText(text)
        }
        const updateID = (event: any, id: number) => {
            setID(id)
        }
        const updateFormat = (event: any, format: string) => {
            setFormat(format)
        }
        const updateKind = (event: any, kind: string) => {
            setKind(kind)
        }
        window.ipcRenderer.on("download-url", downloadURL)
        window.ipcRenderer.on("update-fetch-text", updateFetchText)
        window.ipcRenderer.on("update-id", updateID)
        window.ipcRenderer.on("update-format", updateFormat)
        window.ipcRenderer.on("update-kind", updateKind)
        return () => {
            window.ipcRenderer.removeListener("download-url", downloadURL)
            window.ipcRenderer.removeListener("update-fetch-text", updateFetchText)
            window.ipcRenderer.removeListener("update-id", updateID)
            window.ipcRenderer.removeListener("update-format", updateFormat)
            window.ipcRenderer.removeListener("update-kind", updateKind)
        }
    }, [])

    const search = () => {
        let searchText = searchBoxRef.current?.value.trim() ?? ""
        searchBoxRef.current!.value = ""
        if (searchText) return download(searchText)
    }

    const download = async (query: string) => {
        await window.ipcRenderer.invoke("search", query, {directory, id, kind, format, template, translate, sort,
            restrict, translateTitles, flattenDirectory, folderMap, speed, reverse, bookmarks, bookmarkFilter,
            target, moe, r18, ai, illustLimit, mangaLimit, ugoiraLimit
        })
    }

    const enterSearch = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter") search()
    }

    return (
        <section className="search-container">
            <ErrorMessage/>
            <div className="search-location">
                <div className="search-bar">
                    <input className="search-box" type="search" ref={searchBoxRef} spellCheck="false" placeholder="Pixiv link or query..." onKeyDown={enterSearch}/>
                    <button className="search-button" type="submit" id="submit" onClick={search}>
                        <SearchIcon className="search-button-img"/>
                    </button>
                </div>
            </div>
        </section>
    )
}

export default SearchBar