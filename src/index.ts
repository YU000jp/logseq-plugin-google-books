import '@logseq/libs' //https://plugins-doc.logseq.com/
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { getDateForPage } from 'logseq-dateutils' //https://github.com/hkgnp/logseq-dateutils
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import Swal from 'sweetalert2' //https://sweetalert2.github.io/
import { logseq as PL } from "../package.json"
import { closeModal, createReadingPage, openModal, RecodeDateToPage, setCloseButton, setMainUIapp } from './lib'
import { checkAssets } from './toAssets'
import en from "./translations/en.json"
const pluginId = PL.id //set plugin id from package.json

// Google Books API https://developers.google.com/books/docs/v1/using?hl=ja

//参考リンク
//<dialog>: ダイアログ要素 https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog


/* main */
const main = async () => {
  // i18n
  await l10nSetup({
    defaultLocale: "ja",
    builtinTranslations: { en }
  })
  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  const settingsTemplate: SettingSchemaDesc[] = [
    // 画像ファイルをアセットに保存するかどうか
    {
      key: "saveImage",
      title: t("有効にする: 画像ファイルをアセットに保存"),
      type: "boolean",
      default: true,
      description: t("APIから取得したカバー画像をアセットに保存します。"),
    },
  ]
  logseq.useSettingsSchema(settingsTemplate)

  //open_toolbar
  logseq.App.registerUIItem('toolbar', {
    key: pluginId,
    template: `<div><a class="button icon" data-on-click="OpenToolbarGoogle" style="font-size: 19px; color: #437D35; background-color: #A5FE8F; border-radius: 0.4em; ">G</a></div>`,
  })

}/* end_main */


/* on click open_toolbar */
const model = {
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
    </dialog>
    `

    // モーダルウィンドウを表示
    setMainUIapp(appHtml)

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
    const input = form.querySelector('input[type="text"]')
    if (!(input instanceof HTMLInputElement)) return
    const inputValue = input.value.trim()
    if (inputValue.length === 0) return

    let apiUrl = "https://www.googleapis.com/books/v1/volumes?q=" //Google Books API

    switch (form.id) {
      case 'searchTitle':
        apiUrl += `intitle:${inputValue}`
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
        console.log(data) //TODO:
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
  })
}


const choiceRadioButton = (radio: Element, closeModal: () => void, openModal: () => void, data: any) => {
  radio.addEventListener('change', async (event) => {

    event.preventDefault()
    if (!(event.target instanceof HTMLInputElement)) return
    const selectedTitle = event.target.value
    const FullTitle = t("本") + "/" + selectedTitle

    closeModal()

    if (Object.keys(await logseq.Editor.getPage(FullTitle) || []).length !== 0) //ページチェック
      createBookPageCancel(openModal) //ページが存在していた場合
    else
      createBookPage(FullTitle, data, selectedTitle, openModal) //ページが存在していない場合
  })
}


const createBookPage = (FullTitle: string, data: any, selectedTitle: string, openModal: () => void) => {
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
            await checkAssets(selectedBook.volumeInfo.imageLinks.thumbnail, selectedBook.volumeInfo.title, itemProperties)//画像をアセットに保存する場合
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
              let desc:string = selectedBook.volumeInfo.description
              desc = desc.replaceAll("#","# ")
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
      } else
        logseq.UI.showMsg(t("作成に失敗しました"))
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

logseq.ready(model, main).catch(console.error)