# Logseq Plugin: Google-Books

- GoogleブックスAPIを利用して、書籍データをインポートする


[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-google-books)](https://github.com/YU000jp/logseq-plugin-google-books/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-google-books?color=blue)](https://github.com/YU000jp/logseq-plugin-google-books/blob/main/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-google-books/total.svg)](https://github.com/YU000jp/logseq-plugin-google-books/releases)

### 概要

- [Google ブックス](https://books.google.com/)のデータベースを検索し、Logseqに書籍のページを作成するためのプラグインです。
> 利用にあたってGoogleアカウントは一切不要です

## はじめに

### マーケットプレースからインストール

1. 右上ツールバーの[---]を押し、[プラグイン]を開きます。
1. マーケットプレースを選択してください。
1. 検索欄に`Google`と入力し、検索結果から選び、インストールしてください。

### 使い方

1. 右上ツールバーにある`G`ボタンを押して、キーワード入力画面を開いてください。
1. 検索結果がでたら、左側の選択ボタンを押すと、書籍ページの作成が開始されます。
1. プラグインがGoogle Books APIから書籍情報を取得し、ページを作成します。

### 読書メモをとる方法

- パターン1-> ジャーナルなどのページから、リンクやタグ(`#[[本/タイトル]]`)をつけて、入れ子にする
- パターン2-> 書籍のページに直接書く (日付リンクをつければ、1ページ内で、後からいつ書いたのかが分かるので便利)
- パターン3-> 書籍のページにサブページを作成し、そのページに書く (サブページの例：`本/タイトル/感想`)

## 備考

### プラグインによって作成されるページ

1. `Reading`という、まとめページが作成されます。クエリーがデフォルトで設置されています。
1. 各書籍のページ (`本/タイトル`もしくは`電子書籍/タイトル`のような形式)

### データベースの情報について

- [Google ブックス](https://books.google.com/)が提供するAPIを利用し、そのデータベースから書籍情報を取得しています。発売日などの項目は確定情報とは異なる場合があります

## Credit

- [Google Books API](https://developers.google.com/books/docs/v1/using)
- [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)
