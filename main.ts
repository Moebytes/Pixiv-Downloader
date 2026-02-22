import {app, BrowserWindow, Menu, MenuItemConstructorOptions, dialog, ipcMain, shell, session} from "electron"
import Store from "electron-store"
import dragAddon from "electron-click-drag-plugin"
import path from "path"
import process from "process"
import Pixiv, {PixivIllust, PixivNovel} from "pixiv.ts"
import functions from "./structures/functions"
import mainFunctions from "./structures/mainFunctions"
import querystring from "querystring"
import imageSize from "image-size"
import axios from "axios"
import fs from "fs"
import {URL} from "url"
import pack from "./package.json"

let webpPath = path.join(app.getAppPath(), "./node_modules/pixiv.ts/webp")
if (!fs.existsSync(webpPath)) webpPath = path.join(__dirname, "../webp")
process.setMaxListeners(0)

let window: Electron.BrowserWindow | null
let website: Electron.BrowserWindow | null
const store = new Store()

let pixiv = null as unknown as Pixiv
let code_verifier = ""

const active: Array<{id: number, dest: string, frameFolder?: string, action: null | "kill"}> = []

ipcMain.handle("close", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
})

ipcMain.handle("minimize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
})

ipcMain.handle("maximize", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
})

ipcMain.on("moveWindow", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const handle = win?.getNativeWindowHandle()
  if (!handle) return
  const windowID = process.platform === "linux" ? handle.readUInt32LE(0) : handle
  dragAddon.startDrag(windowID)
})

ipcMain.handle("delete-cookies", () => {
  session.defaultSession.clearStorageData()
  store.delete("refreshToken")
})

ipcMain.handle("get-refresh-token", () => {
  return store.get("refreshToken", "")
})

ipcMain.handle("update-code-verifier", (event, verifier) => {
  code_verifier = verifier
})

ipcMain.handle("translate-title", async (event, title) => {
  const refreshToken = store.get("refreshToken", "") as string
  if (!refreshToken) return title
  if (!pixiv) pixiv = await Pixiv.refreshLogin(refreshToken)
  return pixiv.util.translateTitle(title)
})

ipcMain.handle("download-url", (event, url) => {
  if (window?.isMinimized()) window?.restore()
  window?.focus()
  window?.webContents.send("download-url", url)
})

const openWebsite = async () => {
  if (!website) {
    website = new BrowserWindow({width: 800, height: 650, minWidth: 790, minHeight: 550, frame: false, 
      backgroundColor: "#ffffff", center: false, webPreferences: {webviewTag: true,
      preload: path.join(__dirname, "../preload/index.js")}})
    await website.loadFile(path.join(__dirname, "../renderer/browser.html"))
    website?.on("closed", () => {
      website = null
    })
  } else {
    if (website.isMinimized()) website.restore()
    website.focus()
  }
}

ipcMain.handle("open-url", async (event, url: string) => {
  await openWebsite()
  website?.webContents.send("open-url", url)
})

ipcMain.handle("open-website", async () => {
  if (website) {
    website.close()
  } else {
    await openWebsite()
  }
})

ipcMain.handle("advanced-settings", () => {
  window?.webContents.send("close-all-dialogs", "settings")
  window?.webContents.send("show-settings-dialog")
})

ipcMain.handle("get-dimensions", async (event, url: string) => {
  const arrayBuffer = await axios.get(url, {responseType: "arraybuffer", headers: {Referer: "https://www.pixiv.net/"}}).then((r) => r.data)
  const dimensions = imageSize(arrayBuffer)
  return {width: dimensions.width, height: dimensions.height}
})

ipcMain.handle("preview", (event, image: string) => {
  window?.webContents.send("preview", image)
})

ipcMain.handle("update-color", (event, color: string) => {
  window?.webContents.send("update-color", color)
})

ipcMain.handle("delete-all", () => {
  window?.webContents.send("delete-all")
})

ipcMain.handle("clear-all", () => {
  window?.webContents.send("clear-all")
})

ipcMain.handle("delete-download", async (event, id: number) => {
  let dest = ""
  let frameFolder = ""
  let index = active.findIndex((a) => a.id === id)
  if (index !== -1) {
    dest = active[index].dest
    frameFolder = active[index].frameFolder ?? ""
    active[index].action = "kill"
  }
  if (dest || frameFolder) {
    let error = true
    while ((frameFolder ? fs.existsSync(dest) && fs.existsSync(frameFolder) : fs.existsSync(dest)) && error) {
      try {
        if (frameFolder) mainFunctions.removeDirectory(frameFolder)
        if (fs.statSync(dest).isDirectory()) {
          mainFunctions.removeDirectory(dest)
        } else {
          fs.unlinkSync(dest)
        }
        error = false
      } catch {
        // ignore
      }
      await functions.timeout(1000)
    }
    return true
  } 
  return false
})

ipcMain.handle("download-error", async (event, info) => {
  window?.webContents.send("download-error", info)
})

const download = async (info: {id: number, illust: PixivIllust, dest: string, format: string, speed: number, reverse: boolean, template: string, translateTitles: boolean}) => {
  const refreshToken = store.get("refreshToken", "") as string
  if (!refreshToken) return window?.webContents.send("download-error", "login")
  if (!pixiv) pixiv = await Pixiv.refreshLogin(refreshToken)
  let {id, illust, dest, format, speed, reverse, template, translateTitles} = info
  window?.webContents.send("download-started", {id, illust})
  const folder = path.dirname(dest)
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, {recursive: true})
  if (illust.type === "ugoira") {
    // Download Ugoira
    if (format === "gif" || format === "webp") {
      if (format === "gif") {
        let dest = path.join(path.dirname(info.dest), path.basename(info.dest, path.extname(info.dest))) + ".gif"
        await pixiv.util.downloadUgoira(illust, dest, {speed: speed + 4, reverse})
      } else if (format === "webp") {
        let dest = path.join(path.dirname(info.dest), path.basename(info.dest, path.extname(info.dest))) + ".webp"
        await pixiv.util.downloadUgoira(illust, dest, {speed: speed + 4, reverse, webp: true, webpPath})
      }
    } else if (format === "zip") {
      let dest = path.join(path.dirname(info.dest), path.basename(info.dest, path.extname(info.dest)))
      active.push({id, dest, action: null})
      await pixiv.util.downloadUgoiraZip(info.illust, dest)
    }
  } else if (illust.type === "novel") {
    // Download Novel
    const text = await pixiv.novel.text({novel_id: illust.id})
    fs.writeFileSync(dest, text.content)
  } else if (illust.meta_pages?.length) {
    // Download Manga
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true})
    active.push({id, dest, action: null})
    for (let i = 0; i < illust.meta_pages.length; i++) {
      const name = await mainFunctions.parseTemplate(illust, template.replace(/^.*\//, ""), i, translateTitles, refreshToken)
      let image = illust.meta_pages[i].image_urls.original ? illust.meta_pages[i].image_urls.original : illust.meta_pages[i].image_urls.large
      if (!image) image = illust.meta_pages[i].image_urls.medium
      const arrayBuffer = await axios.get(image, {responseType: "arraybuffer", headers: {Referer: "https://www.pixiv.net/"}}).then((r) => r.data)
      const fileType = functions.bufferFileType(arrayBuffer)
      const pageDest = `${dest}/${name}.${fileType[0].extension?.replace("jpeg", "jpg")}`
      fs.writeFileSync(pageDest, new Uint8Array(arrayBuffer))
    }
  } else {
    // Download Illust
    active.push({id, dest, action: null})
    let url = illust.meta_single_page.original_image_url ? illust.meta_single_page.original_image_url : illust.image_urls.large
    if (!url) url = illust.image_urls.medium
    const arrayBuffer = await axios.get(url, {responseType: "arraybuffer", headers: {Referer: "https://www.pixiv.net/"}}).then((r) => r.data)
    const fileType = functions.bufferFileType(arrayBuffer)
    dest = path.join(path.dirname(dest), `${path.basename(dest, path.extname(dest))}.${fileType[0].extension?.replace("jpeg", "jpg")}`)
    fs.writeFileSync(dest, new Uint8Array(arrayBuffer))
  }
  window?.webContents.send("download-ended", {id, output: dest})
}

const downloadItems = async (items: any) => {
  let promises = [] as any
  items.map((item: any) => {
    const promise = new Promise<void>(async (resolve) => {
      await download(item)
      resolve()
    })
    promises.push(promise)
  })
  await Promise.all(promises)
}

interface SearchInfo {
  directory: string
  id: number
  kind: any
  format: string
  template: string
  translate: boolean, 
  sort: any
  restrict: any
  translateTitles: boolean
  flattenDirectory: boolean
  folderMap: string
  speed: number
  reverse: boolean
  bookmarks: any
  bookmarkFilter: number
  target: any
  moe: boolean
  r18: boolean
  ai: boolean
  illustLimit: string
  mangaLimit: string
  ugoiraLimit: string
}

const updateFormat = (illust: PixivIllust | PixivNovel, format: string) => {
    if (illust.type === "ugoira") {
        if (format !== "gif" && format !== "webp" && format !== "zip") {
            return "gif"
        }
    } else if (illust.type === "novel") {
        if (format !== "txt") {
            return "txt"
        }
    } else {
        if (format !== "png" && format !== "jpg") {
            return "png"
        }
    }
}

const parseDest = async (illust: PixivIllust, info: SearchInfo, newFormat?: string) => {
    const {directory, template, translateTitles, flattenDirectory, format, folderMap, translate} = info
    let dir = directory.replace(/\\+/g, "/")
    if (dir.endsWith("/")) dir = dir.slice(0, -1)
    const name = await mainFunctions.parseTemplate(illust, template, template.includes("*") ? undefined : 0, translateTitles)
    const tagFolder = await mainFunctions.parseFolderMap(illust, folderMap, translate)
    if (illust.meta_pages?.length) {
        return flattenDirectory ? dir : `${dir}/${tagFolder}${name}`
    } else {
        return `${dir}/${tagFolder}${name}.${newFormat ? newFormat : format}`
    }
}

const search = async (query: string, info: SearchInfo) => {
  const {id, kind, format, template, translate, sort, restrict, translateTitles,
    speed, reverse, bookmarks, bookmarkFilter, target, moe, r18, ai, illustLimit, 
    mangaLimit, ugoiraLimit
  } = info
  const refreshToken = store.get("refreshToken", "") as string
  if (!refreshToken) return window?.webContents.send("download-error", "login")
  const pixiv = await Pixiv.refreshLogin(refreshToken)
  let illustID = /\d{5,}/.test(query) ? Number(query.match(/\d{5,}/)?.[0]) : null
  if (!illustID) illustID = /\d{3,}/.test(query) ? Number(query.match(/\d{3,}/)?.[0]) : null
  if (illustID) {
      if (/users/.test(query)) {
          let illusts: PixivIllust[]
          if (kind === "novel" || /novels/.test(query)) {
              illusts = await pixiv.user.novels({user_id: illustID, sort, restrict, bookmarks}) as any
              if (pixiv.user.nextURL) {
                  if (bookmarkFilter) {
                      illusts = [...illusts, ...await pixiv.util.bookmarkMultiCall({next_url: pixiv.user.nextURL, novels: illusts as any}, bookmarkFilter)]
                  } else {
                      illusts = [...illusts, ...await pixiv.util.multiCall({next_url: pixiv.user.nextURL, novels: illusts as any})]
                  }
              }
          } else {
              illusts = /bookmarks/.test(query) ? await pixiv.user.bookmarksIllust({user_id: illustID, sort, restrict, bookmarks}) : await pixiv.user.illusts({user_id: illustID, sort, restrict, bookmarks})
              if (pixiv.user.nextURL) {
                  if (bookmarkFilter) {
                      illusts = [...illusts, ...await pixiv.util.bookmarkMultiCall({next_url: pixiv.user.nextURL, illusts}, bookmarkFilter)]
                  } else {
                      illusts = [...illusts, ...await pixiv.util.multiCall({next_url: pixiv.user.nextURL, illusts})]
                  }
              }
              illusts = illusts.filter((i) => i.type === kind)
              illusts = illusts.filter((i) => r18 ? i.x_restrict === 1 : i.x_restrict === 0)
              illusts = illusts.filter((i) => ai ? i.illust_ai_type === 2 : i.illust_ai_type !== 2)
          }
          let current = id
          let downloaded = false
          let items = [] as any
          window?.webContents.send("update-fetch-text", `Fetching ${illusts.length}...`)
          for (let i = 0; i < illusts.length; i++) {
              const illust = illusts[i]
              let image = illust.meta_single_page.original_image_url ? illust.meta_single_page.original_image_url : illust.image_urls.large 
              if (!image) image = illust.image_urls.medium
              const dest = await parseDest(illusts[i], info)
              items.push({id: current, illust: illusts[i], dest, format, speed, reverse, template, translateTitles})
              current += 1
              window?.webContents.send("update-id", current)
          }
          try {
              await downloadItems(items)
              downloaded = true
          } catch {}
          window?.webContents.send("update-fetch-text", "")
          if (!downloaded) return window?.webContents.send("download-error", "search")
      } else {
          try {
              const illust = /novel/.test(query) ? await pixiv.novel.get(illustID) as any : await pixiv.illust.get(illustID)
              const newFormat = updateFormat(illust, format)
              window?.webContents.send("update-format", newFormat)
              window?.webContents.send("update-kind", illust.type)
              let current = id
              let image = illust.meta_single_page.original_image_url ? illust.meta_single_page.original_image_url : illust.image_urls.large 
              if (!image) image = illust.image_urls.medium
              const dest = await parseDest(illust, info, newFormat)
              await downloadItems([{id: current, illust, dest, format, speed, reverse, template, translateTitles}])
              window?.webContents.send("update-id", current + 1)
          } catch (e) {
              console.log(e)
              return window?.webContents.send("download-error", "search")
          }
      }
  } else {
      let illusts: PixivIllust[]
      if (query === "day") {
          illusts = kind === "novel" ? await pixiv.search.novels({mode: r18 ? "day_r18" : "day", sort, bookmarks}) as any : await pixiv.search.illusts({mode: r18 ? "day_r18" : "day", sort, bookmarks})
      } else if (query === "week") {
          illusts = kind === "novel" ? await pixiv.search.novels({mode: r18 ? "week_r18" : "week", sort, bookmarks}) as any : await pixiv.search.illusts({mode: r18 ? "week_r18" : "week", sort, bookmarks})
      } else if (query === "month") {
          illusts = kind === "novel" ? await pixiv.search.novels({word: r18 ? "R-18" : "", mode: "month", sort, bookmarks}) as any : await pixiv.search.illusts({word: r18 ? "R-18" : "", mode: "month", sort, bookmarks})
      } else {
          if (kind === "ugoira") query += " うごイラ"
          if (r18) query += " R-18"
          if (kind === "novel") {
              illusts = await pixiv.search.novels({word: query, en: translate, r18, type: kind, sort, search_target: target, restrict, bookmarks}) as any
          } else {
              illusts = await pixiv.search.illusts({word: query, en: translate, r18, type: kind, sort, search_target: target, restrict, bookmarks, moe})
          }
      }
      let current = id
      let downloaded = false
      let limit = (kind === "illust" || kind === "novel") ? illustLimit : (kind === "manga" ? mangaLimit : ugoiraLimit)
      if (kind === "novel") {
          if (pixiv.search.nextURL && illusts.length < Number(limit)) {
              if (bookmarkFilter) {
                  illusts = [...illusts, ...await pixiv.util.bookmarkMultiCall({next_url: pixiv.search.nextURL, novels: illusts as any}, bookmarkFilter, Number(limit))]
              } else {
                  illusts = [...illusts, ...await pixiv.util.multiCall({next_url: pixiv.search.nextURL, novels: illusts as any}, Number(limit))]
              }
          }
          illusts = illusts.slice(0, Number(limit))
      } else {
          if (pixiv.search.nextURL && illusts.length < Number(limit)) {
              if (bookmarkFilter) {
                  illusts = [...illusts, ...await pixiv.util.bookmarkMultiCall({next_url: pixiv.search.nextURL, illusts}, bookmarkFilter, Number(limit))]
              } else {
                  illusts = [...illusts, ...await pixiv.util.multiCall({next_url: pixiv.search.nextURL, illusts}, Number(limit))]
              }
          }
          illusts = illusts.filter((i) => r18 ? i.x_restrict === 1 : i.x_restrict === 0)
          illusts = illusts.filter((i) => ai ? i.illust_ai_type === 2 : i.illust_ai_type !== 2)
          .slice(0, Number(limit))
      }
      let items = [] as any
      window?.webContents.send("update-fetch-text", `Fetching ${illusts.length}...`)
      for (let i = 0; i < illusts.length; i++) {
          let illust = illusts[i]
          let image = illust.meta_single_page.original_image_url ? illust.meta_single_page.original_image_url : illust.image_urls.large 
          if (!image) image = illust.image_urls.medium
          const dest = await parseDest(illusts[i], info)
          items.push({id: current, illust: illusts[i], dest, format, speed, reverse, template, translateTitles})
          current += 1
          window?.webContents.send("update-id", current)
      }
      try {
          await downloadItems(items)
          downloaded = true
      } catch {}
      window?.webContents.send("update-fetch-text", "")
      if (!downloaded) return window?.webContents.send("download-error", "search")
  }
}

ipcMain.handle("search", async (event, query: string, info: SearchInfo) => {
  await search(query, info)
})

ipcMain.handle("init-settings", () => {
  return store.get("settings", null)
})

ipcMain.handle("store-settings", (event, settings) => {
  const prev = store.get("settings", {}) as object
  store.set("settings", {...prev, ...settings})
})

ipcMain.handle("get-downloads-folder", async (event, location: string) => {
  if (store.has("downloads")) {
    return store.get("downloads")
  } else {
    const downloads = app.getPath("downloads")
    store.set("downloads", downloads)
    return downloads
  }
})

ipcMain.handle("open-location", async (event, location: string) => {
  if (!fs.existsSync(location)) return
  shell.showItemInFolder(path.normalize(location))
})

ipcMain.handle("select-directory", async (event, dir: string) => {
  if (!window) return
  if (dir === undefined) {
    const result = await dialog.showOpenDialog(window, {
      properties: ["openDirectory"]
    })
    dir = result.filePaths[0]
  }
  if (dir) {
    store.set("downloads", dir)
    return dir
  }
})

ipcMain.handle("get-state", () => {
  return store.get("state", {})
})

ipcMain.handle("save-state", (event, newState: any) => {
  let state = store.get("state", {}) as object
  state = {...state, ...newState}
  store.set("state", state)
})

ipcMain.handle("get-theme", () => {
  return store.get("theme", "light")
})

ipcMain.handle("save-theme", (event, theme: string) => {
  store.set("theme", theme)
})

ipcMain.handle("get-os", () => {
  return store.get("os", "mac")
})

ipcMain.handle("save-os", (event, os: string) => {
  store.set("os", os)
})

ipcMain.handle("context-menu", (event, {hasSelection}) => {
  const template: MenuItemConstructorOptions[] = [
    {label: "Copy", enabled: hasSelection, role: "copy"},
    {label: "Paste", role: "paste"}
  ]

  const menu = Menu.buildFromTemplate(template)
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window) menu.popup({window})
})

const applicationMenu = () =>  {
  const template: MenuItemConstructorOptions[] = [
    {role: "appMenu"},
    {
      label: "Edit",
      submenu: [
        {role: "copy"},
        {role: "paste"}
      ]
    },
    {role: "windowMenu"},
    {
      role: "help",
      submenu: [
        {role: "reload"},
        {role: "forceReload"},
        {role: "toggleDevTools"},
        {type: "separator"},
        {label: "Online Support", click: () => shell.openExternal(pack.repository.url)}
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const singleLock = app.requestSingleInstanceLock()

if (!singleLock) {
  app.quit()
} else {
  app.on("second-instance", (event, argv) => {
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
    }
  })

  app.on("ready", () => {
    window = new BrowserWindow({width: 800, height: 600, minWidth: 720, minHeight: 600, frame: false, 
      show: false, backgroundColor: "#656ac2", center: true, webPreferences: {
      preload: path.join(__dirname, "../preload/index.js")}})
    window.loadFile(path.join(__dirname, "../renderer/index.html"))
    window.removeMenu()
    applicationMenu()
    if (process.platform === "darwin") {
      //fs.chmodSync(`${webpPath}/img2webp.app`, "777")
    }
    window.webContents.on("did-finish-load", () => {
      window?.show()
    })
    window.on("close", () => {
      website?.close()
    })
    window.on("closed", () => {
      window = null
    })
    session.defaultSession.webRequest.onBeforeSendHeaders({urls: ["https://*.pixiv.net/*", "https://*.pximg.net/*"]}, (details, callback) => {
      details.requestHeaders["Referer"] = "https://www.pixiv.net/"
      callback({requestHeaders: details.requestHeaders})
    })
    const webviewSession = session.fromPartition("persist:webview-partition")
    webviewSession.webRequest.onBeforeRedirect({urls: ["https://*.pixiv.net/*"]}, async (details) => {
      if (details.redirectURL.includes("https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback")) {
        website?.webContents.send("navigate-home")
        await functions.timeout(50)
        const code = new URL(details.redirectURL).searchParams.get("code")
        const result = await axios.post("https://oauth.secure.pixiv.net/auth/token", querystring.stringify({
            "client_id": "MOBrBDS8blbauoSck0ZfDbtuzpyT",
            "client_secret": "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj",
            "code": code,
            "code_verifier": code_verifier,
            "grant_type": "authorization_code",
            "include_policy": "true",
            "redirect_uri": "https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback"
          }), {headers: {"user-agent": "PixivAndroidApp/5.0.234 (Android 11; Pixel 5)"}})
        const refreshToken = result.data.refresh_token
        store.set("refreshToken", refreshToken)
      }
    })
  })
}