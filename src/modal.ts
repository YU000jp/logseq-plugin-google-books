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
          <h1>${t("GoogleブックスAPI 書籍検索")}</h1>
          <main>
            <form id="searchTitle">
              ${t("タイトルで検索")}
              <input type="text" placeholder="${t("キーワードを入力")}" required/><input type="submit"/>
            </form>
            <form id="searchAuthor">
             ${t("著者で検索")}
              <input type="text" placeholder="${t("キーワードを入力")}" required/><input type="submit"/>
            </form>
            <form id="searchISBN">
              ${t("ISBNで検索")}
              <input type="text" maxlength="13" placeholder="${t("10桁もしくは13桁")}" required/><input type="submit"/>
            </form>
          <output aria-live="polite" id="outputFromAPI"></output>
          </main>
          <menu>
            <button id="closeBtn">${t("閉じる")}</button> | <button id="ReadingBtn">Reading</button>
          </menu>
          <hr/>
          <footer>
            <form id="inputISBN">
              ${t("オプション: まとめて作成")}
              <textarea id="inputISBN" placeholder="${t("ISBNコードを改行で区切って入力")}" required style="height: 3em; width: 13em"></textarea>
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
    tableInner += `<tr>
          <td><input type="radio" name="selected" value="${item.volumeInfo.title}"></td>
          <td class="ItemImg">${imgTag}</td>
          <td class="ItemTitle"><a href="${item.volumeInfo.infoLink}" target="_blank">${truncatedTitle}</a></td>
          <td>${item.volumeInfo.authors ? item.volumeInfo.authors : ""}</td>
          <td>${item.volumeInfo.publisher ? item.volumeInfo.publisher : ""}</td>
          <td>${item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate : ""}</td>
        </tr>`
  }
  return (`
    <h2>${t("検索結果")}</h2>
    <p>${t("左側の〇をクリックすると、Logseqにページが作成されます。<small>(タイトルをクリックすると、Googleブックスの商品ページが開きます)</small>")}</p>
    <table id="createTable">
    <thead>
    <tr><th style="background-color:orange">${t("選択ボタン")}</th><th>${t("書影カバー")}</th><th>${t("タイトル")}</th><th>${t("著者")}</th><th>${t("出版社")}</th><th>${t("出版日")}<small>${t("(推定)")}</small></th></tr>
    </thead>
    <tbody>
    `+ tableInner + "</tbody></table>\n")
}


const formSubmitEvent = (form: HTMLFormElement) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    if (form.id === "inputISBN") {

      //ISBNコードでまとめて作成
      const msg = await logseq.UI.showMsg(t("実行中 (ISBNコードでまとめて作成)"), "info", { timeout: 1000 * 60 * 5 })

      await createPagesByISBN(form)

      logseq.UI.closeMsg(msg) //awaitを使っているので終わったら、メッセージが閉じる
      logseq.UI.showMsg(t("処理が終了しました。"), "success", { timeout: 3200 })
      console.log(t("処理が終了しました。"))
    } else
      search(form)
  })
}


export const choiceRadioButton = (radio: Element, closeModal: () => void, openModal: () => void, data: any) => {
  radio.addEventListener('change', async (event) => {

    event.preventDefault()
    if (!(event.target instanceof HTMLInputElement)) return
    const selectedTitle = event.target.value.replaceAll("/", " ")// 「/」を含むタイトルは不可。「/」を「\」に変換する
    const FullTitle = t("本") + "/" + selectedTitle

    closeModal()

    if (await logseq.Editor.getPage(FullTitle) as { uuid: PageEntity["uuid"] } | null) //ページチェック
      createBookPageCancel(openModal) //ページが存在していた場合
    else
      createBookPageModal(FullTitle, data, selectedTitle, openModal) //ページが存在していない場合
  })
}


const createBookPageModal = (FullTitle: string, data: any, selectedTitle: string, openModal: () => void) => {
  Swal.fire({
    title: t("続行しますか？"),
    text: `${t("新しいページを作成します。")}\n\n[[${FullTitle}]]`,
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
  logseq.UI.showMsg(t("すでにページが存在しています"), "warning")
  openModal()
  logseq.showMainUI()
}

const userCancel = async (openModal: () => void) => {
  logseq.hideMainUI()
  await logseq.UI.showMsg(t("キャンセルしました"), "warning")
  openModal()
  logseq.showMainUI()
}