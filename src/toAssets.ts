import { IAsyncStorage } from "@logseq/libs/dist/modules/LSPlugin.Storage"
import '@logseq/libs' //https://plugins-doc.logseq.com/

export const checkAssets = async (imgUrl: string, name: string, itemProperties: {}) => {
  const storage = logseq.Assets.makeSandboxStorage() as IAsyncStorage
  name = name + ".jpg" //For Google Books API
  if (await storage.hasItem(name) as boolean) //チェック
    itemProperties["cover"] = `![${name}](../assets/storages/${logseq.baseInfo.id}/${name})` //アセットに保存済みの場合
  else
    await saveToAssets(imgUrl, storage, name, itemProperties)//画像をアセットに保存
}
const saveToAssets = async (imgUrl: string, storage: IAsyncStorage, name: string, itemProperties: {}) => {
  const response = await fetch(imgUrl)
  const blob = await response.blob()
  const fileReader = new FileReader()
  fileReader.onload = () =>
    storage.setItem(name, fileReader.result as string)
  fileReader.readAsArrayBuffer(blob)
  itemProperties["cover"] = `![${name}](../assets/storages/${logseq.baseInfo.id}/${name})`
}
