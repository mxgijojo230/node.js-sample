# Node js + REST API 
>主要用於嵌入式系統上方便給予使用者來操作管理以及提供系統資訊或是更新系統服務
## 一、提供的功能
- 給使用者建立帳號密碼並且使用bcrypt加密後儲存
- 提供與網路做NTP校正時間服務
- 支援由設定的server IP所產生Https license 
- 支援更新系統image
- 支援REST API 讀取系統狀態
## 二、運行
可使用VS 2017專案來開啟，需先安裝npm與node js 套件
若已有安裝可以在terminal 中輸入下列指令
```sh
npm start
```
或是
```sh
node app
```
即可登入網頁輸入預設網頁網址
```sh
http://localhost:3000/
```
## 三、介面說明
### (1) 登入
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/1.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/1.png?raw=true)
>使用預設帳號密碼登入
```sh
Account: admin
Password: abc123
```
### (2) IP設定
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/2.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/2.png?raw=true)
>能設定嵌入式系統上IP、MASK、DNS、gateway值
>在根據新設定好的IP產生SSL license並提共下載 
### (3) System 資訊
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/3.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/3.png?raw=true)
>讀取嵌入式系統上的硬體訊息
>能讓使用者上傳Fiwrmware檔案，讓系統進行更新
### (4) NTP server
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/4.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/4.png?raw=true)
>需先設定好用戶端的NPT server
>輸入用戶端的IP進行時間校正
### (5) 帳號管理
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/5.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/5.png?raw=true)
>提供帳號及密碼修改
>並將經過bcrypt加密後的帳密會儲存在ae400config.json中
## 四、REST API
網頁支援 REST API 訪問並且設置OAuth2.0 token來提供安全性
訪問API位置為
```
http://localhost/ae400/dm/(API)
```
以下分別為網頁所提供的REST API
- 確認連線狀態
- 登入帳號密碼提取OAuth2.0 token
- 修改帳號密碼
- 讀取裝置系統資訊
- 移除OAuth2.0 token
下面使用Postman做為範例
### (1)連線狀態
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/7.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/7.png?raw=true)
```
Methods=GET
```
>此API不須經過輸入Token就可訪問
```
http://localhost/ae400/dm/ping
```
### (2)獲得Token
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/8.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/8.png?raw=true)
```
Methods=POST
```
>透過輸入正確的帳號密碼來獲得Token
```
http://localhost/ae400/dm/binding
```
### (3)讀取系統資訊
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/9.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/9.png?raw=true)
```
Methods=GET
```
>需要有Toke後才能夠讀取系統資訊
```
http://localhost/ae400/dm/info
```
### (4)修改帳號
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/10.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/10.png?raw=true)
```
Methods=PUT
```
>需要Token，並且帶入要修改的帳號及密碼
```
http://localhost/ae400/dm/account
```
### (5)註銷Token
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/12.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/12.png?raw=true)
```
Methods=DELETE
```
>註銷目前使用的Token，註銷Token後不再具有訪問的權限
>如下圖所示
```
http://localhost/ae400/dm/binding
```
[![](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/13.png?raw=true)](https://github.com/mxgijojo230/for-test-github/blob/master/NodeJs_picture/13.png?raw=true)

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
