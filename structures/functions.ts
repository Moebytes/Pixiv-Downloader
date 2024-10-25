import {ipcRenderer} from "electron"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import base64url from "base64url"
import fileType from "magic-bytes.js"
import Pixiv, {PixivIllust} from "pixiv.ts"

export default class Functions {
    public static arrayIncludes = (str: string, arr: string[]) => {
        for (let i = 0; i < arr.length; i++) {
            if (str.includes(arr[i])) return true
        }
        return false
    }

    public static arrayRemove = <T>(arr: T[], val: T) => {
        return arr.filter((item) => item !== val)
    }

    public static timeout = async (ms: number) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    public static removeDirectory = (dir: string) => {
        if (!fs.existsSync(dir)) return
        fs.readdirSync(dir).forEach((file: string) => {
            const current = path.join(dir, file)
            if (fs.lstatSync(current).isDirectory()) {
                Functions.removeDirectory(current)
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

    public static decodeEntities(encodedString: string) {
        const regex = /&(nbsp|amp|quot|lt|gt);/g
        const translate = {
            nbsp:" ",
            amp : "&",
            quot: "\"",
            lt  : "<",
            gt  : ">"
        } as any
        return encodedString.replace(regex, function(match, entity) {
            return translate[entity]
        }).replace(/&#(\d+);/gi, function(match, numStr) {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }

    public static logoDrag = (enable?: boolean) => {
        if (enable) {
            // @ts-expect-error
            document.querySelector(".logo-bar-drag")?.style["-webkit-app-region"] = "drag"
        } else {
            // @ts-expect-error
            document.querySelector(".logo-bar-drag")?.style["-webkit-app-region"] = "no-drag"
        }
    }

    public static prettyFormatDate = (date: string) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const arr = date.substring(0, 10).split("-")
        const year = arr[0]
        const month = Number(arr[1])
        const day = Number(arr[2])
        return `${months[month - 1]} ${day}, ${year}`
    }

    public static clean = (text: string) => {
        return text?.replace(/[^a-z0-9_-\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf【】()\[\]&!#. ]/gi, "").replace(/~/g, "").replace(/ +/g, " ") ?? ""
    }

    public static parseTemplate = async (illust: PixivIllust, template: string, pageNum?: number, translateTitles?: boolean, refreshToken?: string) => {
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
                title = await ipcRenderer.invoke("translate-title", illust.title)
            }
        }
        return template
        .replace(/{title}/gi, Functions.clean(title))
        .replace(/{id}/gi, String(illust.id))
        .replace(/{artist}/gi, Functions.clean(illust.user.name))
        .replace(/{user}/gi, illust.user.account)
        .replace(/{user id}/gi, String(illust.user.id))
        .replace(/{page}/gi, String(pageNum))
        .replace(/{date}/gi, illust.create_date.substring(0, 10))
        .replace(/{width}/gi, String(illust.width))
        .replace(/{height}/gi, String(illust.height))
    }

    public static parseFolderMap = async (illust: PixivIllust, folderMap: string, translate?: boolean) => {
        if (!folderMap) return ""
        const refreshToken = await ipcRenderer.invoke("get-refresh-token")
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

    public static getOauthURL = () => {
        const login_url = "https://app-api.pixiv.net/web/v1/login"
        const code_verifier = crypto.randomBytes(32).toString("hex")
        ipcRenderer.invoke("update-code-verifier", code_verifier)
        const code_challenge = base64url.encode(crypto.createHash("sha256").update(code_verifier).digest())
        return `${login_url}?code_challenge=${code_challenge}&code_challenge_method=S256&client=pixiv-android`
    }

    public static bufferFileType = (buffer: Uint8Array | ArrayBuffer | Buffer) => {
        buffer = Buffer.from(buffer)
        const majorBrand = buffer.toString("utf8", 8, 12)
        if (majorBrand === "avif" || majorBrand === "avis") {
            return [{typename: "avif", mime: "image/avif", extension: "avif"}]
        }
        return fileType(new Uint8Array(buffer))
    }
}
