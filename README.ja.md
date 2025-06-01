# Logseq Plugin: Google-Books

APIから取得した書籍情報や表紙画像をLogseqに取り込んで、読書ログをつけられたら便利だと思います。それを実現させるために作ったプラグインです。([Rakuten Booksプラグイン](https://github.com/YU000jp/logseq-plugin-rakuten-books))

> [!WARNING]
> このプラグインは、Logseq ファイルベースのグラフで動作します。データベースのグラフでは動作しません。

<div align="right">

[English](https://github.com/YU000jp/logseq-plugin-google-books) | [日本語](https://github.com/YU000jp/logseq-plugin-google-books/blob/master/README.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-google-books)](https://github.com/YU000jp/logseq-plugin-google-books/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-google-books?color=blue)](https://github.com/YU000jp/logseq-plugin-google-books/blob/main/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-google-books/total.svg)](https://github.com/YU000jp/logseq-plugin-google-books/releases) <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

### 概要

- [Google ブックス](https://books.google.com/)のデータベースを検索し、Logseqに書籍のページを作成するためのプラグインです。
> 利用にあたってGoogleアカウントは一切不要です

## はじめに

### マーケットプレースからインストール

1. 右上ツールバーの[---]を押し、[プラグイン]を開きます。
1. マーケットプレースを選択してください。
1. 検索欄に`Google`と入力し、検索結果から選び、インストールしてください。

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/95d3bf4e-59ef-4de8-b7ec-2741ef42768e)

### 使い方

1. 右上ツールバーにある`G`ボタンを押して、キーワード入力画面を開いてください。

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/95cabefd-ef37-4a26-9ae7-c0d877a287f7)

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/75cbf770-b18d-4325-9c8c-07624d8372d7)
1. 検索結果がでたら、左側の選択ボタンを押すと、書籍ページの作成が開始されます。

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/52041143-0fec-4155-9b6d-28de6cacff41)
1. プラグインがGoogle Books APIから書籍情報を取得し、ページを作成します。
   
   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/8d9db0aa-a2d7-453b-a771-138c2b261196)

### 読書メモをとる方法

- パターン1-> ジャーナルなどのページから、リンクやタグ(`#[[本/タイトル]]`)をつけて、入れ子にする
- パターン2-> 書籍のページに直接書く (日付リンクをつければ、1ページ内で、後からいつ書いたのかが分かるので便利)
- パターン3-> 書籍のページにサブページを作成し、そのページに書く (サブページの例：`本/タイトル/感想`)

## 備考

### プラグインによって作成されるページ

1. `Reading`という、まとめページが作成されます。クエリーがデフォルトで設置されています。
1. 各書籍のページ (`本/タイトル`もしくは`電子書籍/タイトル`のような形式)

### 書影カバー画像について

1. プラグインによってその画像を取得し、`assets/storages/google-books/` フォルダに保存します。
   > プラグイン設定で、保存をオフにすることも可能です。

### データベースの情報について

- [Google ブックス](https://books.google.com/)が提供するAPIを利用し、そのデータベースから書籍情報を取得しています。発売日などの項目は確定情報とは異なる場合があります

## Credit / Prior arts

- Logseq プラグイン > [@LuloDev/logseq-book-fetch](https://github.com/LuloDev/logseq-book-fetch)
- [Google Books API](https://developers.google.com/books/docs/v1/using)
- アイコン > [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)
- 製作者 > [@YU000jp](https://github.com/YU000jp)
