# Venture

* 适用于「[Screeps](https://screeps.com/a/#!/map)」的自动化机器人。

    设计文档及使用说明请参考「[Venture——Screeps Bot 设计文档](https://xenny.wiki/posts/note/game/screeps.html)」

## 使用

### 部署

1. 下载本项目

    `git clone https://github.com/X3NNY/Venture`

2. 安装依赖

    ```bash
    cd Venture
    npm i
    ```

3. 配置路径

    在项目根目录下创建`.secret.json`文件，并添加以下内容：

    ```json
    {
        "main": {
            "token": "游戏中生成的账户TOKEN",
            "protocol": "https",
            "hostname": "screeps.com",
            "port": 443,
            "path": "/",
            "branch": "main"
        },
        "local": {
            "copyPath": "游戏客户端中的本地代码路径（具体到分支）"
        }
    }
    ```

4. 上传

    `npm run push`

### 二次开发

* 对项目代码进行编辑后，直接`npm run push`即可编译上传至服务器中，若只想测试编译可使用`npm run build`编译项目。

## 其他

* 本项目部分设计/代码实现有参考以下仓库：

    [hoho的Bot](https://github.com/HoPGoldy/my-screeps-ai)

    [Rosmarin-Bot / 迷迭香Bot](https://github.com/kurohanekaoruko/Rosmarin-Bot)


