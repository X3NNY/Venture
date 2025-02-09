
/**
 * 字符串格式化
 * @author X3NNY
 * 
 * v0.2 去除正则，从头至尾字符匹配
 * v0.1
 */

const formatString = (template: string, ...values: any[]): string => {
    let result = '';
    let startIndex = 0;
    let match;

    while ((match = template.indexOf('{', startIndex)) !== -1) {
        const endIndex = template.indexOf('}', match);
        if (endIndex === -1) {
            result += template.slice(startIndex);
            break;
        }
        result += template.slice(startIndex, match);
        const placeholderIndex = parseInt(template.slice(match + 1, endIndex), 10);
        if (placeholderIndex < values.length) {
            result += values[placeholderIndex];
        } else {
            result += template.slice(match, endIndex + 1);
        }
        startIndex = endIndex + 1;
    }
    result += template.slice(startIndex);
    return result;
}
interface String {
    format(...values: any[]): string;
}

String.prototype.format = function(...values: any[]): string {
    return formatString(this as string, ...values);
};