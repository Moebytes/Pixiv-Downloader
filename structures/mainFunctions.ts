import fs from "fs"
import path from "path"
import Pixiv, {PixivIllust} from "pixiv.ts"
import functions from "./functions"

export default class MainFunctions {
    public static parseTemplate = async (illust: PixivIllust, template: string, pageNum?: number, 
        translateTitles?: boolean, refreshToken?: string) => {
        if (pageNum != undefined) {
            template = template.replace(/(\*)/g, "")
        } else {
            template = template.replace(/(\*).*?(\*)/g, "")
        }
        let title = illust.title
        if (translateTitles) {
            if (refreshToken) {
                const pixiv = await Pixiv.refreshLogin(refreshToken as string)
                title = await pixiv.util.translateTitle(illust.title)
            } else {
                title = await window.ipcRenderer.invoke("translate-title", illust.title)
            }
        }
        return template
        .replace(/{title}/gi, functions.clean(title))
        .replace(/{id}/gi, String(illust.id))
        .replace(/{artist}/gi, functions.clean(illust.user.name))
        .replace(/{user}/gi, illust.user.account)
        .replace(/{user id}/gi, String(illust.user.id))
        .replace(/{page}/gi, String(pageNum))
        .replace(/{date}/gi, illust.create_date.substring(0, 10))
        .replace(/{width}/gi, String(illust.width))
        .replace(/{height}/gi, String(illust.height))
    }

    public static parseFolderMap = async (illust: PixivIllust, folderMap: string, translate?: boolean) => {
        if (!folderMap) return ""
        const refreshToken = await window.ipcRenderer.invoke("get-refresh-token")
        let pixiv = null as unknown as Pixiv
        if (refreshToken) {
            pixiv = await Pixiv.refreshLogin(refreshToken)
        } else {
            translate = false
        }
        let mapping = []
        const folderArgs = folderMap.split(",")
        for (let i = 0; i < folderArgs.length; i++) {
            const fArgs = folderArgs[i].split(":")
            const folder = fArgs[0]
            const tag = translate ? await pixiv?.util.translateTag(fArgs[1] ?? "") : fArgs[1]
            mapping.push({tag, folder})
        }
        mapping = mapping.sort((a, b) => b.tag.length - a.tag.length)
        for (let i = 0; i < illust.tags.length; i++) {
            for (let j = 0; j < mapping.length; j++) {
                const folder = mapping[j].folder
                const tag = mapping[j].tag
                if (tag.includes(illust.tags[i].name)) {
                    return `${folder}/`
                }
            }
        }
        return ""
    }

    public static removeDirectory = (dir: string) => {
        if (!fs.existsSync(dir)) return
        fs.readdirSync(dir).forEach((file: string) => {
            const current = path.join(dir, file)
            if (fs.lstatSync(current).isDirectory()) {
                MainFunctions.removeDirectory(current)
            } else {
                fs.unlinkSync(current)
            }
        })
        try {
            fs.rmdirSync(dir)
        } catch (e) {
            console.log(e)
        }
    }
}