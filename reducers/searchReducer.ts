import {createSlice} from "@reduxjs/toolkit"
import {useSelector, useDispatch} from "react-redux"
import type {StoreState, StoreDispatch} from "../store"

type PixivKind = "illust" | "novel" | "manga" | "ugoira"
type PixivBookmarks =  "0" | "50" | "100" | "300" | "500" | "1000" | "3000" | "5000" | "10000"
type PixivSort =  "date_desc" | "date_asc" | "popular_desc" | "popular_asc"
type PixivSearchTarget = "partial_match_for_tags" | "exact_match_for_tags" | "title_and_caption"
type PixivRestrict = "public" | "private" | "all"

const searchSlice = createSlice({
    name: "search",
    initialState: {
        directory: "",
        kind: "illust" as PixivKind,
        format: "png",
        translate: true,
        r18: false,
        reverse: false,
        speed: "1",
        template: "{id}*_p{page}*",
        folderMap: "",
        sort: "date_desc" as PixivSort,
        target: "partial_match_for_tags" as PixivSearchTarget,
        illustLimit: "100",
        mangaLimit: "25",
        ugoiraLimit: "10",
        translateTitles: false,
        restrict: "public" as PixivRestrict,
        moe: false,
        bookmarks: "0" as PixivBookmarks,
        bookmarkFilter: 0,
        ai: false,
        advSettings: false,
        flattenDirectory: false,
        fetchText: ""
    },
    reducers: {
        setDirectory: (state, action) => {state.directory = action.payload},
        setKind: (state, action) => {state.kind = action.payload},
        setFormat: (state, action) => {state.format = action.payload},
        setTranslate: (state, action) => {state.translate = action.payload},
        setR18: (state, action) => {state.r18 = action.payload},
        setReverse: (state, action) => {state.reverse = action.payload},
        setSpeed: (state, action) => {state.speed = action.payload},
        setTemplate: (state, action) => {state.template = action.payload},
        setFolderMap: (state, action) => {state.folderMap = action.payload},
        setSort: (state, action) => {state.sort = action.payload},
        setTarget: (state, action) => {state.target = action.payload},
        setIllustLimit: (state, action) => {state.illustLimit = action.payload},
        setMangaLimit: (state, action) => {state.mangaLimit = action.payload},
        setUgoiraLimit: (state, action) => {state.ugoiraLimit = action.payload},
        setTranslateTitles: (state, action) => {state.translateTitles = action.payload},
        setRestrict: (state, action) => {state.restrict = action.payload},
        setMoe: (state, action) => {state.moe = action.payload},
        setBookmarks: (state, action) => {state.bookmarks = action.payload},
        setBookmarkFilter: (state, action) => {state.bookmarkFilter = action.payload},
        setAI: (state, action) => {state.ai = action.payload},
        setAdvSettings: (state, action) => {state.advSettings = action.payload},
        setFlattenDirectory: (state, action) => {state.flattenDirectory = action.payload},
        setFetchText: (state, action) => {state.fetchText = action.payload}
    }    
})

const {
    setDirectory, setKind, setFormat, setTranslate, setR18,
    setReverse, setSpeed, setTemplate, setFolderMap, setSort,
    setTarget, setIllustLimit, setMangaLimit, setUgoiraLimit,
    setTranslateTitles, setRestrict, setMoe, setBookmarks,
    setBookmarkFilter, setAI, setAdvSettings, setFlattenDirectory,
    setFetchText
} = searchSlice.actions

export const useSearchSelector = () => {
    const selector = useSelector.withTypes<StoreState>()
    return {
        directory: selector((state) => state.search.directory),
        kind: selector((state) => state.search.kind),
        format: selector((state) => state.search.format),
        translate: selector((state) => state.search.translate),
        r18: selector((state) => state.search.r18),
        reverse: selector((state) => state.search.reverse),
        speed: selector((state) => state.search.speed),
        template: selector((state) => state.search.template),
        folderMap: selector((state) => state.search.folderMap),
        sort: selector((state) => state.search.sort),
        target: selector((state) => state.search.target),
        illustLimit: selector((state) => state.search.illustLimit),
        mangaLimit: selector((state) => state.search.mangaLimit),
        ugoiraLimit: selector((state) => state.search.ugoiraLimit),
        translateTitles: selector((state) => state.search.translateTitles),
        restrict: selector((state) => state.search.restrict),
        moe: selector((state) => state.search.moe),
        bookmarks: selector((state) => state.search.bookmarks),
        bookmarkFilter: selector((state) => state.search.bookmarkFilter),
        ai: selector((state) => state.search.ai),
        advSettings: selector((state) => state.search.advSettings),
        flattenDirectory: selector((state) => state.search.flattenDirectory),
        fetchText: selector((state) => state.search.fetchText)
    }
}

export const useSearchActions = () => {
    const dispatch = useDispatch.withTypes<StoreDispatch>()()
    return {
        setDirectory: (state: string) => dispatch(setDirectory(state)),
        setKind: (state: string) => dispatch(setKind(state)),
        setFormat: (state: string) => dispatch(setFormat(state)),
        setTranslate: (state: boolean) => dispatch(setTranslate(state)),
        setR18: (state: boolean) => dispatch(setR18(state)),
        setReverse: (state: boolean) => dispatch(setReverse(state)),
        setSpeed: (state: string) => dispatch(setSpeed(state)),
        setTemplate: (state: string) => dispatch(setTemplate(state)),
        setFolderMap: (state: string) => dispatch(setFolderMap(state)),
        setSort: (state: string) => dispatch(setSort(state)),
        setTarget: (state: string) => dispatch(setTarget(state)),
        setIllustLimit: (state: string) => dispatch(setIllustLimit(state)),
        setMangaLimit: (state: string) => dispatch(setMangaLimit(state)),
        setUgoiraLimit: (state: string) => dispatch(setUgoiraLimit(state)),
        setTranslateTitles: (state: boolean) => dispatch(setTranslateTitles(state)),
        setRestrict: (state: string) => dispatch(setRestrict(state)),
        setMoe: (state: boolean) => dispatch(setMoe(state)),
        setBookmarks: (state: string) => dispatch(setBookmarks(state)),
        setBookmarkFilter: (state: number) => dispatch(setBookmarkFilter(state)),
        setAI: (state: boolean) => dispatch(setAI(state)),
        setAdvSettings: (state: boolean) => dispatch(setAdvSettings(state)),
        setFlattenDirectory: (state: boolean) => dispatch(setFlattenDirectory(state)),
        setFetchText: (state: string) => dispatch(setFetchText(state))
    }
}

export default searchSlice.reducer