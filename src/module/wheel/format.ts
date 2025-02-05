
/**
 * 字符串格式化
 * @author X3NNY
 * v0.1
 */

const formatString = (template: string, ...values: any[]): string => {
    return template.replace(/\{(\d+)\}/g, (match, index) => {
        const value = values[parseInt(index, 10)];
        return value !== undefined ? value.toString() : match;
    });
}
interface String {
    format(...values: any[]): string;
}

String.prototype.format = function(...values: any[]): string {
    return formatString(this as string, ...values);
};