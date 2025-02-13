export const drawTable = (data: any, head: string[]) => {
    const table: any = [];
    if (_.isArray(data)) { // 数组
        table.push(...data);
    } else {
        for (const k of Object.keys(data)) {
            table.push([k.toString()]);
            if (_.isArray(data[k])) {
                table.at(-1).push(...data[k].map(v=>v.toString()));
            } else {
                table.at(-1).push(data[k].toString());
            }
        }
    }

    if (!table || table.length === 0 || table[0].length != head.length) {
        return '';
    }
    const header = '<tr>' + head.map(v=> `<th style="min-width: 120px;text-align: center;">${v}</th>`).join('') + '</tr>';
    let rows = [];
    for (let i = 0; i < table.length; i++) {
        rows.push(
            '<tr>' + table[i].map(v=>`<td style="text-align: center;">${v}</td>`).join('') + '</tr>'
        )
    }
    return `<table border="1">${header}${rows.join('')}</table>`;
}