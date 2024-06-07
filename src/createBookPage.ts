import { t } from "logseq-l10n"
import { createReadingPage, RecodeDateToPage } from "./lib"
import Swal from "sweetalert2"
import { checkAssets } from "./toAssets"
import { getDateForPage } from "logseq-dateutils"

export const createBookPage = async (data: any, selectedTitle: string, FullTitle: string) => {
      await createReadingPage()
      //ページを追加する処理
      const selectedBook = data.items.find((item) => item.volumeInfo.title === selectedTitle) // 選択された書籍の情報を取得
      if (selectedBook) {
        const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string }
        const getDate = getDateForPage(new Date(selectedBook.volumeInfo.publishedDate), preferredDateFormat)
    
        let itemProperties = {}
        if (selectedBook.volumeInfo.authors !== "undefined")
          itemProperties["author"] = selectedBook.volumeInfo.authors
        if (selectedBook.volumeInfo.publisher !== "undefined")
          itemProperties["publisher"] = selectedBook.volumeInfo.publisher
        if (selectedBook.volumeInfo.imageLinks.thumbnail !== "undefined") {
          if (logseq.settings!.saveImage === true)
            await checkAssets(selectedBook.volumeInfo.imageLinks.thumbnail, selectedBook.volumeInfo.title, itemProperties) //画像をアセットに保存する場合
    
          else
            itemProperties["cover"] = selectedBook.volumeInfo.imageLinks.thumbnail //画像をアセットに保存しない場合
        }
    
        if (getDate
          && getDate !== "[[NaN/aN/aN]]"
          && getDate !== "NaN/aN/aN")
          itemProperties["sales"] = getDate
    
        itemProperties["tags"] = ["Reading"]
        const createPage = await logseq.Editor.createPage(
          FullTitle,
          itemProperties,
          {
            redirect: true,
            createFirstBlock: true
          })
        if (createPage) {
          try {
            await logseq.Editor.prependBlockInPage(createPage.uuid,
              `
    [${t("Google Booksサイトへ")}](${selectedBook.volumeInfo.infoLink})
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
            await Swal.fire(t("ページが作成されました。"), `[[${FullTitle}]]`, 'success').then(async (ok) => {
              if (ok) {
                //日付とリンクを先頭行にいれる
                RecodeDateToPage(preferredDateFormat, "Reading", ` [[${FullTitle}]]`)
                logseq.hideMainUI()
              }
            })
          } finally {
            const blocks = await logseq.Editor.getPageBlocksTree(FullTitle)
            if (blocks) {
              await logseq.Editor.editBlock(blocks[0].uuid)
              setTimeout(function () {
                logseq.Editor.insertAtEditingCursor(",") //ページプロパティを配列として読み込ませる処理
              }, 200)
            }
          }
        }
      }
      else
        logseq.UI.showMsg(t("作成に失敗しました"))
    }