import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { createBookPage } from "./createBookPage"

export const createPagesByISBN = async (form: HTMLFormElement): Promise<void> => {
  const textarea = form.querySelector('textarea')
  if (!(textarea instanceof HTMLTextAreaElement)) return
  const isbnCodes = textarea.value.trim().split('\n')
  if (isbnCodes.length === 0) return
  //10桁もしくは13桁のISBNコードのみを抽出
  const isbnCodesFiltered = isbnCodes.filter((isbn) => isbn.match(/^[0-9]{10,13}$/))
  if (isbnCodesFiltered.length === 0) return

  //すでに存在しているページをリスト化
  let existPages: string[] = []
  //検索結果が見つからなかった場合のリスト
  let notFoundPages: string[] = []

  for (let i = 0; i < isbnCodesFiltered.length; i++) {
    console.log("try fetch >>> ISBN code: " + isbnCodesFiltered[i])
    await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnCodesFiltered[i]}`)
      .then((response) => response.json())
      .then(async (data) => {
        if (data.items) {
          const selectedTitle = data.items[0].volumeInfo.title.replaceAll("/", " ")// 「/」を含むタイトルは不可。「/」を「\」に変換する
          const FullTitle = t("Book") + "/" + selectedTitle
          if (await logseq.Editor.getPage(FullTitle) as { uuid: PageEntity["uuid"] } | null) { //ページチェック
            console.log(t("Page already exists") + ": " + FullTitle)
            logseq.UI.showMsg(t("Page already exists") + ": " + FullTitle, "warning", { timeout: 2200 })
            existPages.push(FullTitle)
          } else {
            createBookPage(data, selectedTitle, FullTitle) //ページが存在していない場合
            await new Promise((resolve) => setTimeout(resolve, 3300)) //3秒待機
          }
        } else {
          console.log(t("No search results found") + ": " + isbnCodesFiltered[i])
          logseq.UI.showMsg(t("No search results found") + ": " + isbnCodesFiltered[i], "warning", { timeout: 2200 })
          notFoundPages.push(isbnCodesFiltered[i])
        }
        await new Promise((resolve) => setTimeout(resolve, 500)) //0.5秒待機
      })
      .catch((error) => {
        console.error(error)
      })
    await new Promise((resolve) => setTimeout(resolve, 2000)) //2秒待機
  }
  if (existPages.length > 0
    || notFoundPages.length > 0) {
    console.log("existPages: " + existPages)
    console.log("notFoundPages: " + notFoundPages)
    logseq.UI.showMsg(
      t("Number of existing pages") + ": " + existPages.length + "\n" +
      existPages.join("\n") + "\n" +
      t("Number of pages not found") + ": " + notFoundPages.length + "\n" +
      notFoundPages.join("\n") + "\n",
      "warning", { timeout: 12000 }
    )
  }
  return
}