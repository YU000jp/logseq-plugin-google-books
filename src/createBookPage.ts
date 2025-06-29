import { t } from "logseq-l10n"
import { createReadingPage, RecodeDateToPage } from "./lib"
import { checkAssets } from "./toAssets"
import { getDateForPage } from "logseq-dateutils"
import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"

export const createBookPage = async (data: any, selectedTitle: string, FullTitle: string) => {
  await createReadingPage()
  //ページを追加する処理
  const selectedBook = data.items.find((item) => item.volumeInfo.title.replaceAll("/", " ") === selectedTitle) // 選択された書籍の情報を取得
  if (selectedBook) {
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string }
    const getDate = getDateForPage(new Date(selectedBook.volumeInfo.publishedDate), "yyyy/MM")

    let itemProperties = {}
    if (selectedBook.volumeInfo.authors !== "undefined"
      || selectedBook.volumeInfo.authors !== "")
      itemProperties["author"] = selectedBook.volumeInfo.authors
    if (selectedBook.volumeInfo.publisher !== "undefined"
      || selectedBook.volumeInfo.publisher !== "")
      itemProperties["publisher"] = selectedBook.volumeInfo.publisher
    if (selectedBook.volumeInfo.imageLinks
      && selectedBook.volumeInfo.imageLinks!.thumbnail !== "undefined"
      || selectedBook.volumeInfo.imageLinks!.thumbnail !== "")
      if (logseq.settings!.saveImage === true)
        await checkAssets(selectedBook.volumeInfo.imageLinks.thumbnail, selectedBook.volumeInfo.title, itemProperties) //画像をアセットに保存する場合
      else
        itemProperties["cover"] = selectedBook.volumeInfo.imageLinks.thumbnail //画像をアセットに保存しない場合

    if (getDate
      && getDate !== "[[NaN/aN]]")
      itemProperties["sales"] = getDate

    //itemProperties["tags"] = ["Reading"]
    const createPage = await logseq.Editor.createPage(
      FullTitle,
      itemProperties,
      {
        redirect: true,
        createFirstBlock: true
      }) as PageEntity

    if (createPage) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      await updatePagePropertiesArray(createPage.uuid)
      await new Promise((resolve) => setTimeout(resolve, 100))

      await logseq.Editor.prependBlockInPage(createPage.uuid,
        `
    [${t("Go to Google Books")}](${selectedBook.volumeInfo.infoLink})
    `)
      if (selectedBook.volumeInfo.description) {
        // 「#」が含まれる場合エスケープする
        let desc: string = selectedBook.volumeInfo.description
        desc = desc.replaceAll("#", "# ")
        await logseq.Editor.prependBlockInPage(createPage.uuid, `
    #+BEGIN_QUOTE
    ${desc}
    #+END_QUOTE
                `)
      }

      console.log("Create book page: ", FullTitle)

      //日付とリンクをReadingページの先頭行にいれる
      RecodeDateToPage(preferredDateFormat, "Reading", ` [[${FullTitle}]]`)

      logseq.UI.showMsg(t("Page created: ") + FullTitle, "success", { timeout: 4200 })
    }
  } else {
    logseq.UI.showMsg(t("Failed to create page: ") + FullTitle, "error")
    console.error("Failed to create page" + FullTitle)
  }
}

const updatePagePropertiesArray = async (pageUuid: PageEntity["uuid"]) => {
  const blocks = await logseq.Editor.getPageBlocksTree(pageUuid) as { uuid: BlockEntity["uuid"] }[]
  if (blocks && blocks[0])
    await logseq.Editor.editBlock(blocks[0].uuid).then(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      // ページのプロパティを更新
      logseq.Editor.insertAtEditingCursor(`
      tags:: [[Reading]],
      `) // アナログで追加
      await new Promise((resolve) => setTimeout(resolve, 100))
    })
}