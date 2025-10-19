import {app, BrowserWindow, dialog, globalShortcut, ipcMain, shell, session} from "electron"
import {autoUpdater} from "electron-updater"
import Store from "electron-store"
import path from "path"
import process from "process"
import "./dev-app-update.yml"
import pack from "./package.json"
import Pixiv, {PixivIllust} from "pixiv.ts"
import unzip from "unzipper"
import functions from "./structures/functions"
import querystring from "querystring"
import imageSize from "image-size"
import axios from "axios"
import fs from "fs"
import {URL} from "url"
require("@electron/remote/main").initialize()

let webpPath = path.join(app.getAppPath(), "./node_modules/pixiv.ts/webp")
if (!fs.existsSync(webpPath)) webpPath = path.join(__dirname, "../webp")
process.setMaxListeners(0)
let window: Electron.BrowserWindow | null
let website: Electron.BrowserWindow | null
autoUpdater.autoDownload = false
const store = new Store()

let pixiv = null as unknown as Pixiv

const active: Array<{id: number, dest: string, frameFolder?: string, action: null | "kill"}> = []
let code_verifier = ""

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
    website = new BrowserWindow({width: 800, height: 650, minWidth: 790, minHeight: 550, frame: false, roundedCorners: false, backgroundColor: "#ffffff", center: false, webPreferences: {nodeIntegration: true, webviewTag: true, contextIsolation: false}})
    await website.loadFile(path.join(__dirname, "website.html"))
    require("@electron/remote/main").enable(website.webContents)
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

ipcMain.handle("trigger-paste", () => {
  window?.webContents.send("trigger-paste")
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
        if (frameFolder) functions.removeDirectory(frameFolder)
        if (fs.statSync(dest).isDirectory()) {
          functions.removeDirectory(dest)
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
      const name = await functions.parseTemplate(illust, template.replace(/^.*\//, ""), i, translateTitles, refreshToken)
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

ipcMain.handle("download", async (event, items: any) => {
  let promises = [] as any
  items.map((item: any) => {
    const promise = new Promise<void>(async (resolve) => {
      await download(item)
      resolve()
    })
    promises.push(promise)
  })
  await Promise.all(promises)
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

ipcMain.handle("install-update", async (event) => {
  if (process.platform === "darwin") {
    const update = await autoUpdater.checkForUpdates()
    const url = `${pack.repository.url}/releases/download/v${update.updateInfo.version}/${update.updateInfo.files[0].url}`
    await shell.openExternal(url)
    app.quit()
  } else {
    await autoUpdater.downloadUpdate()
    autoUpdater.quitAndInstall()
  }
})

ipcMain.handle("check-for-updates", async (event, startup: boolean) => {
  window?.webContents.send("close-all-dialogs", "version")
  const update = await autoUpdater.checkForUpdates()
  const newVersion = update.updateInfo.version
  if (pack.version === newVersion) {
    if (!startup) window?.webContents.send("show-version-dialog", null)
  } else {
    window?.webContents.send("show-version-dialog", newVersion)
  }
})

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
    window = new BrowserWindow({width: 800, height: 600, minWidth: 720, minHeight: 600, frame: false, roundedCorners: false, backgroundColor: "#656ac2", center: true, webPreferences: {nodeIntegration: true, contextIsolation: false, webSecurity: false}})
    window.loadFile(path.join(__dirname, "index.html"))
    window.removeMenu()
    if (process.platform === "darwin") {
      fs.chmodSync(`${webpPath}/img2webp.app`, "777")
    }
    require("@electron/remote/main").enable(window.webContents)
    window.on("close", () => {
      website?.close()
    })
    window.on("closed", () => {
      window = null
    })
    if (process.env.DEVELOPMENT === "true") {
      globalShortcut.register("Control+Shift+I", () => {
        window?.webContents.toggleDevTools()
        website?.webContents.toggleDevTools()
      })
    }
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