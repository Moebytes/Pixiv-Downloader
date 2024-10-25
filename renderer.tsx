import "bootstrap/dist/css/bootstrap.min.css"
import React, {useState} from "react"
import ReactDom from "react-dom"
import TitleBar from "./components/TitleBar"
import LogoBar from "./components/LogoBar"
import SearchBar from "./components/SearchBar"
import DirectoryBar from "./components/DirectoryBar"
import OptionsBar from "./components/OptionsBar"
import IllustContainerList from "./components/IllustContainerList"
import GroupAction from "./components/GroupAction"
import ContextMenu from "./components/ContextMenu"
import Preview from "./components/Preview"
import AdvancedSettings from "./components/AdvancedSettings"
import VersionDialog from "./components/VersionDialog"
import "./index.less"

export const ClearAllContext = React.createContext<any>(null)
export const PreviewContext = React.createContext<any>(null)
export const AdvSettingsContext = React.createContext<any>(null)

export const DirectoryContext = React.createContext<any>(null)
export const KindContext = React.createContext<any>(null)
export const FormatContext = React.createContext<any>(null)
export const TranslateContext = React.createContext<any>(null)
export const R18Context = React.createContext<any>(null)
export const ReverseContext = React.createContext<any>(null)
export const SpeedContext = React.createContext<any>(null)

export const TemplateContext = React.createContext<any>(null)
export const FolderMapContext = React.createContext<any>(null)
export const SortContext = React.createContext<any>(null)
export const TargetContext = React.createContext<any>(null)
export const IllustLimitContext = React.createContext<any>(null)
export const MangaLimitContext = React.createContext<any>(null)
export const UgoiraLimitContext = React.createContext<any>(null)
export const TranslateTitlesContext = React.createContext<any>(null)
export const RestrictContext = React.createContext<any>(null)
export const MoeContext = React.createContext<any>(null)
export const BookmarksContext = React.createContext<any>(null)
export const BookmarkFilterContext = React.createContext<any>(null)
export const AIContext = React.createContext<any>(null)
export const FlattenDirectoryContext = React.createContext<any>(null)
export const FetchTextContext = React.createContext<any>(null)

const App = () => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [clearAll, setClearAll] = useState(false)
  const [directory, setDirectory] = useState("")
  const [kind, setKind] = useState("illust")
  const [format, setFormat] = useState("png")
  const [translate, setTranslate] = useState(true)
  const [r18, setR18] = useState(false)
  const [reverse, setReverse] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [template, setTemplate] = useState("{id}*_p{page}*")
  const [folderMap, setFolderMap] = useState("")
  const [sort, setSort] = useState("date_desc")
  const [target, setTarget] = useState("partial_match_for_tags")
  const [illustLimit, setIllustLimit] = useState(100)
  const [mangaLimit, setMangaLimit] = useState(25)
  const [ugoiraLimit, setUgoiraLimit] = useState(10)
  const [translateTitles, setTranslateTitles] = useState(false)
  const [restrict, setRestrict] = useState("public")
  const [moe, setMoe] = useState(false)
  const [bookmarks, setBookmarks] = useState(0)
  const [bookmarkFilter, setBookmarkFilter] = useState(0)
  const [ai, setAI] = useState(false)
  const [advSettings, setADVSettings] = useState(false)
  const [flattenDirectory, setFlattenDirectory] = useState(false)
  const [fetchText, setFetchText] = useState("")

  return (
    <main className="app">
      <FetchTextContext.Provider value={{fetchText, setFetchText}}>
      <FlattenDirectoryContext.Provider value={{flattenDirectory, setFlattenDirectory}}>
      <AdvSettingsContext.Provider value={{advSettings, setADVSettings}}>
      <BookmarkFilterContext.Provider value={{bookmarkFilter, setBookmarkFilter}}>
      <AIContext.Provider value={{ai, setAI}}>
      <BookmarksContext.Provider value={{bookmarks, setBookmarks}}>
      <MoeContext.Provider value={{moe, setMoe}}>
      <RestrictContext.Provider value={{restrict, setRestrict}}>
      <TranslateTitlesContext.Provider value={{translateTitles, setTranslateTitles}}>
      <TargetContext.Provider value={{target, setTarget}}>
      <UgoiraLimitContext.Provider value={{ugoiraLimit, setUgoiraLimit}}>
      <MangaLimitContext.Provider value={{mangaLimit, setMangaLimit}}>
      <IllustLimitContext.Provider value={{illustLimit, setIllustLimit}}>
      <SortContext.Provider value={{sort, setSort}}>
      <FolderMapContext.Provider value={{folderMap, setFolderMap}}>
      <PreviewContext.Provider value={{previewVisible, setPreviewVisible}}>
      <TemplateContext.Provider value={{template, setTemplate}}>
      <ClearAllContext.Provider value={{clearAll, setClearAll}}>
      <DirectoryContext.Provider value={{directory, setDirectory}}>
      <KindContext.Provider value={{kind, setKind}}>
      <FormatContext.Provider value={{format, setFormat}}>
      <TranslateContext.Provider value={{translate, setTranslate}}>
      <R18Context.Provider value={{r18, setR18}}>
      <ReverseContext.Provider value={{reverse, setReverse}}>
      <SpeedContext.Provider value={{speed, setSpeed}}>
        <TitleBar/>
        <ContextMenu/>
        <VersionDialog/>
        <AdvancedSettings/>
        <Preview/>
        <LogoBar/>
        <SearchBar/>
        <DirectoryBar/>
        <OptionsBar/>
        <GroupAction/>
        <IllustContainerList/>
      </SpeedContext.Provider>
      </ReverseContext.Provider>
      </R18Context.Provider>
      </TranslateContext.Provider>
      </FormatContext.Provider>
      </KindContext.Provider>
      </DirectoryContext.Provider>
      </ClearAllContext.Provider>
      </TemplateContext.Provider>
      </PreviewContext.Provider>
      </FolderMapContext.Provider>
      </SortContext.Provider>
      </IllustLimitContext.Provider>
      </MangaLimitContext.Provider>
      </UgoiraLimitContext.Provider>
      </TargetContext.Provider>
      </TranslateTitlesContext.Provider>
      </RestrictContext.Provider>
      </MoeContext.Provider>
      </BookmarksContext.Provider>
      </AIContext.Provider>
      </BookmarkFilterContext.Provider>
      </AdvSettingsContext.Provider>
      </FlattenDirectoryContext.Provider>
      </FetchTextContext.Provider>
    </main>
  )
}

ReactDom.render(<App/>, document.getElementById("root"))
