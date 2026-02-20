import crypto from "crypto"
import base64url from "base64url"
import fileType from "magic-bytes.js"

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

    public static getOauthURL = () => {
        const login_url = "https://app-api.pixiv.net/web/v1/login"
        const code_verifier = crypto.randomBytes(32).toString("hex")
        window.ipcRenderer.invoke("update-code-verifier", code_verifier)
        const code_challenge = base64url.encode(crypto.createHash("sha256").update(code_verifier).digest())
        return `${login_url}?code_challenge=${code_challenge}&code_challenge_method=S256&client=pixiv-android`
    }

    public static bufferFileType = (buff: Uint8Array | ArrayBuffer | Buffer) => {
        const buffer = Buffer.from(new Uint8Array(buff))
        const majorBrand = buffer.toString("utf8", 8, 12)
        if (majorBrand === "avif" || majorBrand === "avis") {
            return [{typename: "avif", mime: "image/avif", extension: "avif"}]
        }
        return fileType(new Uint8Array(buffer))
    }
}
