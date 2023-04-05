import { MotaEventInfo, MotaEventParamType } from '../../../event/event';

let loaded = false;
let declareStr = '';
const load = (async () => {
    const str = await window.editor.extra.readl(
        '_editor/event/types',
        'event/types',
        'utf-8'
    );
    for (const [file, content] of str) {
        if (file === 'param.d.ts') {
            declareStr = content;
        }
    }
    loaded = true;
})();

const typeMap: Record<MotaEventParamType, string> = {
    number: 'number',
    text: 'string',
    code: 'string',
    json: 'any',
    checkbox: 'boolean',
    select: 'string',
    colora: '[number, number, number, number]',
    colors: 'string',
    comment: 'undefined',
    block: 'any[]'
};

export async function generateStringifyDeclaration(block: MotaEventInfo) {
    if (!loaded) await load;
    let toReplace = '';
    if (!block.params) toReplace = 'type P = {}';
    else {
        toReplace = 'type P = {';
        let $ = '';
        block.params.forEach((v, i) => {
            const type = typeMap[v.type];
            if (v.key) {
                toReplace += `\n    ${v.key}: ${type};`;
            }
            $ += `\n    \$${i}: ${type};`;
        });
        toReplace += $;
        toReplace += `\n}`;
    }

    const match = declareStr.match(
        /\/{2}\s*\<{3}\s*replace\s+p((\n|\r\n).*){1,}(\n|\r\n)+\/{2}\s*\>{3}\s*replace\s+p/
    )?.[0];
    if (!match) return declareStr;

    return declareStr.replace(match, toReplace);
}
