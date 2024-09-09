# Logseq Plugin: Google-Books

> It would be useful to import book information and cover images retrieved from the API into Logseq. I have made it happen.

> [!WARNING]
This plugin does not work with Logseq db version.

<div align="right">
   
[English](https://github.com/YU000jp/logseq-plugin-google-books) | [日本語](https://github.com/YU000jp/logseq-plugin-google-books/blob/master/README.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-google-books)](https://github.com/YU000jp/logseq-plugin-google-books/releases)
[![License](https://img.shields.io/github/license/YU000jp/logseq-plugin-google-books?color=blue)](https://github.com/YU000jp/logseq-plugin-google-books/blob/main/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-google-books/total.svg)](https://github.com/YU000jp/logseq-plugin-google-books/releases) <a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

### Overview

- This is a plugin that searches the database of [Google Books](https://books.google.com/) and creates book pages in Logseq.
> No Google account is required for use.

## Getting Started

### Install from Marketplace

1. Click on the [---] in the upper right toolbar and open [Plugins].
1. Select Marketplace.
1. Type `Google` in the search bar, choose from the search results, and install.

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/95d3bf4e-59ef-4de8-b7ec-2741ef42768e)

### Usage

1. Press the `G` button in the upper right toolbar to open the keyword input screen.

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/95cabefd-ef37-4a26-9ae7-c0d877a287f7)

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/75cbf770-b18d-4325-9c8c-07624d8372d7)
1. Once the search results appear, press the selection button on the left to start creating a book page.

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/52041143-0fec-4155-9b6d-28de6cacff41)
1. The plugin retrieves book information from Google Books API and creates a page.

   ![image](https://github.com/YU000jp/logseq-plugin-google-books/assets/111847207/8d9db0aa-a2d7-453b-a771-138c2b261196)

### Taking Reading Notes

- Pattern 1 -> Add links or tags (`#[[Books/Title]]`) from pages like journals and nest them.
- Pattern 2 -> Write directly on the book page (adding a date link makes it convenient to know when it was written later within the same page).
- Pattern 3 -> Create subpages on the book page and write on those pages (examples of subpages: `Books/Title/Impressions`)

## Notes

### Pages Created by Plugin

1. A summary page named `Reading` will be created with a default query.
1. Pages for each book (`Books/Title` or `Ebooks/Title` format).

### About Book Cover Images

1. The plugin retrieves and saves those images to the `assets/storages/google-books/` folder.
   > It's also possible to turn off saving in the plugin settings.

### About Database Information

- Book information is retrieved from the database using the API provided by [Google Books](https://books.google.com/). Items like release dates may differ from confirmed information.

## Credit / Prior arts

- Logseq Plugin-> [@LuloDev/logseq-book-fetch](https://github.com/LuloDev/logseq-book-fetch)
- [Google Books API](https://developers.google.com/books/docs/v1/using)
- Icon-> [icooon-mono.com](https://icooon-mono.com/11122-%e3%81%88%e3%82%93%e3%81%b4%e3%81%a4%e4%bb%98%e3%81%8d%e3%81%ae%e3%83%8e%e3%83%bc%e3%83%88%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3/)
- Author > [@YU000jp](https://github.com/YU000jp)
