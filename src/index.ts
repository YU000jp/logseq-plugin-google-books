import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import { logseq as PL } from "../package.json"
import { model } from "./modal"
import af from "./translations/af.json"
import de from "./translations/de.json"
import en from "./translations/en.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
import ko from "./translations/ko.json"
import nbNO from "./translations/nb-NO.json"
import nl from "./translations/nl.json"
import pl from "./translations/pl.json"
import ptBR from "./translations/pt-BR.json"
import ptPT from "./translations/pt-PT.json"
import ru from "./translations/ru.json"
import sk from "./translations/sk.json"
import tr from "./translations/tr.json"
import uk from "./translations/uk.json"
import zhCN from "./translations/zh-CN.json"
import zhHant from "./translations/zh-Hant.json"
const pluginId = PL.id //set plugin id from package.json

// Google Books API https://developers.google.com/books/docs/v1/using?hl=ja

//参考リンク
//<dialog>: ダイアログ要素 https://developer.mozilla.org/ja/docs/Web/HTML/Element/dialog


/* main */
const main = async () => {
  // i18n
  await l10nSetup({
    defaultLocale: "ja",
    builtinTranslations: { en, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant }
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

logseq.ready(model, main).catch(console.error)