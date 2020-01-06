export function fetchImg(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    function onload() {
      img.removeEventListener("load", onload)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      img.removeEventListener("error", onerror)
      resolve(img)
    }
    function onerror(e: ErrorEvent) {
      img.removeEventListener("load", onload)
      img.removeEventListener("error", onerror)
      reject(e)
    }
    img.addEventListener("load", onload)
    img.addEventListener("error", onerror)
    img.src = url
  })
}
