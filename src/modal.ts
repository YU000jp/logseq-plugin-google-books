import { t } from "logseq-l10n"
import Swal from "sweetalert2"
import { createBookPage } from "./createBookPage"
import { setCloseButton, setMainUIApp, setReadingPageButton } from "./lib"
import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { createPagesByISBN } from "./createPagesByISBN"
import { search } from "./search"

/* on click open_toolbar */
export const model = {
  async OpenToolbarGoogle() {
    let appHtml: string = `
        <dialog id="appDialog">
          <h1>${t("Google Books API Book Search")}</h1>
          <main>
            <form id="searchTitle">
              ${t("Search by Title")}
              <input type="text" placeholder="${t("Enter keywords")}" required/><input type="submit"/>
            </form>
            <form id="searchAuthor">
             ${t("Search by Author")}
              <input type="text" placeholder="${t("Enter keywords")}" required/><input type="submit"/>
            </form>
            <form id="searchISBN">
              ${t("Search by ISBN")}
              <input type="text" maxlength="13" placeholder="${t("10 or 13 digits")}" required/><input type="submit"/>
            </form>
          <output aria-live="polite" id="outputFromAPI"></output>
          </main>
          <menu>
            <button id="closeBtn">${t("Close")}</button> | <button id="ReadingBtn">Reading</button>
          </menu>
          <hr/>
          <footer>
            <form id="inputISBN">
              ${t("Option: Bulk Create")}
              <textarea id="inputISBN" placeholder="${t("Enter ISBN codes separated by line breaks")}" required style="height: 3em; width: 13em"></textarea>
              <input type="submit"/>
            </form>
          </footer> 
        </dialog>
        `

    // モーダルウィンドウを表示
    setMainUIApp(appHtml)

    // 閉じるボタン
    setCloseButton()

    // Readingページを開くボタン
    setReadingPageButton()

    // 検索フォーム送信時の処理
    const searchForms = document.querySelectorAll('form')
    if (!searchForms) return
    for (const form of searchForms)
      formSubmitEvent(form as HTMLFormElement)
  }
}

export const createTable = (data) => {
  let tableInner: string = ""
  for (const item of data) {
    const imgTag: string = item.volumeInfo.imageLinks?.thumbnail ?
      `<img src="${item.volumeInfo.imageLinks.thumbnail}"/>`
      : ""
    const truncatedTitle = item.volumeInfo.title.slice(0, 60)
    tableInner += `
    <li class="item">
      <div class="item-picture" title="${t("Book Cover")}">${imgTag}</div>
      <div class="item-body">
        <div class="item-title">
          <input type="radio" name="selected" value="${item.volumeInfo.title}" title="${t("Select Button")}" style="background-color:orange"/>
          <a href="${item.volumeInfo.infoLink}" target="_blank" title="${t("Title")}">${truncatedTitle}</a>
        </div>
        <div class="item-text">
          ${item.volumeInfo.authors ? `<span title="${t("Author")}">${item.volumeInfo.authors}</span>` : ""}<br/>
          ${item.volumeInfo.publisher ? `<span title="${t("Publisher")}">${item.volumeInfo.publisher}</span>` : ""}<br/>
          ${item.volumeInfo.publishedDate ? `<span title="${t("Publication Date")} ${t("(estimated)")}">${item.volumeInfo.publishedDate}</span>` : ""}
        </div>
      </div>
    </li>
    `
  }

  return (`
    <h2>${t("Search Results")}</h2>
    <p>${t("Click the ○ on the left to create a page in Logseq. <small>(Click the title to open the Google Books product page)</small>")}</p>
    <ul id="createTable">
      ${tableInner}
    </ul>
    `)
}


const formSubmitEvent = (form: HTMLFormElement) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (form.id === "inputISBN") {

      //ISBNコードでまとめて作成
      const msg = await logseq.UI.showMsg(t("Processing (Batch create by ISBN codes)"), "info", { timeout: 1000 * 60 * 5 })

      await createPagesByISBN(form)

      logseq.UI.closeMsg(msg) //awaitを使っているので終わったら、メッセージが閉じる
      logseq.UI.showMsg(t("Processing completed."), "success", { timeout: 3200 })
      console.log(t("Processing completed."))
    } else
      search(form)
  })
}


export const choiceRadioButton = (radio: Element, closeModal: () => void, openModal: () => void, data: any) => {
  radio.addEventListener('change', async (event) => {

    event.preventDefault()
    if (!(event.target instanceof HTMLInputElement)) return
    const selectedTitle = event.target.value.replaceAll("/", " ")// 「/」を含むタイトルは不可。「/」を「\」に変換する
    const FullTitle = t("Book") + "/" + selectedTitle

    closeModal()

    if (await logseq.Editor.getPage(FullTitle) as { uuid: PageEntity["uuid"] } | null) //ページチェック
      createBookPageCancel(openModal) //ページが存在していた場合
    else
      createBookPageModal(FullTitle, data, selectedTitle, openModal) //ページが存在していない場合
  })
}


const createBookPageModal = (FullTitle: string, data: any, selectedTitle: string, openModal: () => void) => {
  Swal.fire({
    title: t("Do you want to continue?"),
    text: `${t("Create a new page.")}\n\n[[${FullTitle}]]`,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  }).then(async (result) => {
    if (result.isConfirmed) {
      //"Reading"ページの作成
      await createBookPage(data, selectedTitle, FullTitle)
    } else
      await userCancel(openModal) //作成キャンセルボタン
    logseq.hideMainUI()
  })
}

const createBookPageCancel = (openModal: () => void) => {
  logseq.hideMainUI()
  logseq.UI.showMsg(t("Page already exists"), "warning")
  openModal()
  logseq.showMainUI()
}

const userCancel = async (openModal: () => void) => {
  logseq.hideMainUI()
  await logseq.UI.showMsg(t("Cancelled"), "warning")
  openModal()
  logseq.showMainUI()
}