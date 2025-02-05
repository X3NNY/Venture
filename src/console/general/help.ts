const logo = ` __     __   U _____ u   _   _       _____      _   _     ____     U _____ u 
 \\ \\   /"/u  \\| ___"|/  | \\ |"|     |_ " _|  U |"|u| | U |  _"\\ u  \\| ___"|/ 
  \\ \\ / //    |  _|"   <|  \\| |>      | |     \\| |\\| |  \\| |_) |/   |  _|"   
  /\\ V /_,-.  | |___   U| |\\  |u     /| |\\     | |_| |   |  _ <     | |___   
 U  \\_/-(_/   |_____|   |_| \\_|     u |_|U    <<\\___/    |_| \\_\\    |_____|  
   //         <<   >>   ||   \\\\,-.  _// \\\\_  (__) )(     //   \\\\_   <<   >>  
  (__)       (__) (__)  (_")  (_/  (__) (__)     (__)   (__)  (__) (__) (__)
----------------------------------------------------------------------------
                                            https://github.com/X3NNY/venture
                                                                 Screeps Bot
`

const helpStrings = {
    cn: {
        help: '\n######  指令列表  ######\n' +
            '- 通用：\n' + 
            '    help: 查看帮助\n' +
            '    lang_switch: 切换语言/switch language\n' + 
            '- 功能（直接输入指令名可查看详细功能介绍）：\n' +
            '    room: 房间操控指令\n' +
            '    layout: 布局操控指令\n' +
            '    market: 市场操控指令\n'
    },
    us: {
        help: '\n######  Commands  ######\n' +
            '- General：\n' + 
            '    help: View help\n' +
            '    lang_switch: 切换语言/switch language\n' + 
            '- Function（Input command for more details）：\n' +
            '    room: Room commands\n' +
            '    layout: Layout commands\n' +
            '    market: Market commands\n'
    }
}

export default () => {
    const lang = Memory.lang||'cn';
    return logo + helpStrings[lang].help;
}