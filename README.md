# tender-backend

```
node -v
v17.4.0
```

## 如何使用此專案

```
Windos:
可以打開 Powershell

Mac:
打開 終端機

進入你喜歡的地方，可以放置專案的的地方
```

### 1. 下載專案至你的電腦

> `git clone https://github.com/Fionn88/tender-backend.git`

### 2. 進入目錄

> `cd tender-backend`

### 3. 你有 npm 了嗎？？

> `npm install`
```
如 command not found
請google 搜尋下載 node
```

### 4. 查看你的 node version 是不是 version 17

> `node -v`

```
不一樣沒關係，還是可以跑跑看，能不能啟動.
如不能還請下載至跟我一樣的version
```

### 5. 啟動服務

> `npm start`

```
如失敗，可能是沒有開資料庫，請注意報錯的行數
```

### 6. 測試你的API

> `http://localhost:3000/tender`

```
透過這個連結，你可以確定，你的服務沒有問題，你看得到的資料是假資料
```

### 7. 測試你的資料庫

> `http://localhost:3000/tenderquery`

```
如你可以看得到資料，代表你資料庫沒問題
```

### 8. 測試你的 POST 功能

```
請下載 POSTMAN，無法透過點連結去確認服務是否正常
```

> `http://localhost:3000/createCertificate`

