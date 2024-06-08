import { AppUserConfigs, BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { getDateForPage } from 'logseq-dateutils'
import '@logseq/libs' //https://plugins-doc.logseq.com/

export function closeModal() {
  const appDialog = document.getElementById('appDialog') as HTMLDialogElement
  if (appDialog) {
    appDialog.close()
  }
}

export function openModal() {
  const appDialog = document.getElementById('appDialog') as HTMLDialogElement
  if (appDialog) {
    appDialog.showModal()
  }
}

export function setCloseButton() {
  const btn = document.getElementById('closeBtn') as HTMLButtonElement
  if (btn) {
    btn.addEventListener('click', () => {
      closeModal()
      logseq.hideMainUI()
    })
  }
}

export function setReadingPageButton() {
  const btn = document.getElementById('ReadingBtn') as HTMLButtonElement
  if (btn) {
    btn.addEventListener('click', (ev) => {
      closeModal()
      logseq.hideMainUI()
      pageOpen("Reading", ev.shiftKey)
    })
  }
}

export const pageOpen = async (pageName: string, shiftKey: boolean) => {
  const page = await logseq.Editor.getPage(pageName) as { uuid: PageEntity["uuid"] } | null
  if (page) {
    if (shiftKey)
      logseq.Editor.openInRightSidebar(page.uuid)
    else
      logseq.Editor.scrollToBlockInPage(pageName, page.uuid)
  }
}

export function setMainUIApp(appHtml: string) {
  const MainUIapp = document.getElementById("app") as HTMLDivElement
  if (MainUIapp) {
    MainUIapp.innerHTML = appHtml
    openModal()
    logseq.showMainUI()
  }
}

export const RecodeDateToPage = async (
  userDateFormat: AppUserConfigs["preferredDateFormat"],
  ToPageName: string,
  pushPageLink: string
) => {
  const blocks = await logseq.Editor.getPageBlocksTree(ToPageName) as BlockEntity[]
  if (blocks)
    //ページ先頭行の下に追記
    await logseq.Editor.insertBlock(blocks[0].uuid,
      (getDateForPage(new Date(), userDateFormat) + pushPageLink),
      { sibling: false })
}
export const createReadingPage = async () => {
  const MainPageObj = await logseq.Editor.getPage("Reading") || [] //ページチェック
  if (Object.keys(MainPageObj).length === 0) {
    //ページが存在しない場合
    const createMainPage = await logseq.Editor.createPage("Reading", {}, { redirect: false, createFirstBlock: true })
    if (createMainPage)
      await logseq.Editor.prependBlockInPage(createMainPage.uuid, "{{query (page-tags Reading)}}")
  }
}
