import { t } from "logseq-l10n"
import { closeModal, openModal } from "./lib"
import { createTable, choiceRadioButton } from "./modal"

export const search = (form: HTMLFormElement) => {
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
      }

      else
        logseq.UI.showMsg(t("No search results found"), "warning")
    })
    .catch((error) => {
      console.error(error)
    })
}
