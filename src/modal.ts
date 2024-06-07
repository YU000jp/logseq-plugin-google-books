import { t } from "logseq-l10n"
import Swal from "sweetalert2"
import { createBookPage } from "./createBookPage"
import { closeModal, openModal, setCloseButton, setMainUIApp } from "./lib"
import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"

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
            <button id="closeBtn">${t("閉じる")}</button>
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

    // 検索フォーム送信時の処理
    const searchForms = document.querySelectorAll('form')
    if (!searchForms) return
    for (const form of searchForms)
      formSubmitEvent(form as HTMLFormElement)
  }
}

const createTable = (data) => {
  let tableInner: string = ""
  for (const item of data) {
    const imgTag: string = (item.volumeInfo.imageLinks.thumbnail) ?
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
  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (form.id === "inputISBN") {

      //ISBNコードでまとめて作成
      logseq.UI.showMsg(t("ISBNコードでまとめて作成します"), "info")
      const textarea = form.querySelector('textarea')
      if (!(textarea instanceof HTMLTextAreaElement)) return
      const isbnCodes = textarea.value.trim().split('\n')
      if (isbnCodes.length === 0) return
      //10桁もしくは13桁のISBNコードのみを抽出
      const isbnCodesFiltered = isbnCodes.filter((isbn) => isbn.match(/^[0-9]{10,13}$/))
      if (isbnCodesFiltered.length === 0) return
      logseq.showMainUI()
      for (let i = 0; i < isbnCodesFiltered.length; i++) {
        console.log("ISBN code: "+isbnCodesFiltered[i])
        fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnCodesFiltered[i]}`)
          .then((response) => response.json())
          .then(async (data) => {
            if (data.items) {
              const selectedTitle = data.items[0].volumeInfo.title
              const FullTitle = t("本") + "/" + selectedTitle
              if (await logseq.Editor.getPage(FullTitle) as { uuid: PageEntity["uuid"] } | null) //ページチェック
                console.log(t("すでにページが存在しています") + ": " + FullTitle)
              else {
                createBookPage(data, selectedTitle, FullTitle) //ページが存在していない場合
                await new Promise((resolve) => setTimeout(resolve, 3300)) //3秒待機
              }
            } else
              console.log(t("検索結果が見つかりませんでした") + ": " + isbnCodesFiltered[i])
            await new Promise((resolve) => setTimeout(resolve, 500)) //0.5秒待機
          })
          .catch((error) => {
            console.error(error)
          })
      }

    } else {

      const input = form.querySelector('input[type="text"]')
      if (!(input instanceof HTMLInputElement)) return
      const inputValue = input.value.trim()
      if (inputValue.length === 0) return

      let apiUrl = "https://www.googleapis.com/books/v1/volumes?q=" //Google Books API

      switch (form.id) {
        case 'searchTitle':
          apiUrl += `${inputValue}`
          break
        case 'searchISBN':
          apiUrl += `isbn:${inputValue}`
          break
        case 'searchAuthor':
          apiUrl += `inauthor:${inputValue}`
          break
        default:
          break
      }

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          const output = document.getElementById('outputFromAPI')
          if (output
            && data.items) {
            const Table = createTable(data.items)
            output.innerHTML = Table

            // ラジオボタンが選択された場合の処理
            const radioButtons = document.querySelectorAll('input[name="selected"]')
            if (radioButtons)
              for (const radio of radioButtons)
                choiceRadioButton(radio, closeModal, openModal, data)
          } else
            logseq.UI.showMsg(t("検索結果が見つかりませんでした"), "warning")
        })
        .catch((error) => {
          console.error(error)
        })
    }
  })
}


const choiceRadioButton = (radio: Element, closeModal: () => void, openModal: () => void, data: any) => {
  radio.addEventListener('change', async (event) => {

    event.preventDefault()
    if (!(event.target instanceof HTMLInputElement)) return
    const selectedTitle = event.target.value
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