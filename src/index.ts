import '@logseq/libs' //https://plugins-doc.logseq.com/
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { logseq as PL } from "../package.json"
import { model } from "./modal"
import { loadLogseqL10n } from "./translations/l10nSetup"
const pluginId = PL.id //set plugin id from package.json

// Google Books API https://developers.google.com/books/docs/v1/using?hl=ja

//参考リンク
//<dialog>: ダイアログ要素 https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog


/* main */
const main = async () => {
  // i18n
  // ユーザー設定言語を取得し、L10Nをセットアップ
  const { preferredLanguage, preferredDateFormat } = await loadLogseqL10n()
  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  const settingsTemplate: SettingSchemaDesc[] = [
    // 画像ファイルをアセットに保存するかどうか
    {
      key: "saveImage",
      title: t("Enable: Save image files to assets"),
      type: "boolean",
      default: true,
      description: t("Save cover images retrieved from the API to assets."),
    },
  ]
  logseq.useSettingsSchema(settingsTemplate)

  //open_toolbar
  logseq.App.registerUIItem('toolbar', {
    key: pluginId,
    template: `<div><a class="button icon" data-on-click="OpenToolbarGoogle" style="font-size: 19px; color: #437D35; background-color: #A5FE8F; border-radius: 0.4em; ">G</a></div>`,
  })

}/* end_main */

logseq.ready(model, main).catch(console.error)