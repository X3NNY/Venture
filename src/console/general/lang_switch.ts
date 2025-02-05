export default () => {
    if (Memory.lang === 'cn') Memory.lang = 'us';
    else Memory.lang = 'cn';
    
    if (Memory.lang === 'cn') {
        return '已将切换语言为中文。';
    } else {
        return 'Language has been switched to English.'
    }
}