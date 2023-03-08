import { ref } from 'vue';
import { RightOutlined } from '@ant-design/icons-vue';
import { Button } from 'ant-design-vue';

interface TableElement {
    type: 'object' | 'code' | 'text';

    [key: string]: string | TableElement;
}

interface TableProps {
    keys: string;
    data: TableElement;
    n: number;
}

/**
 * 表格渲染器
 * @param props 数据
 */
export function TableRenderer(props: TableProps) {
    const data = props.data;

    if (data.type === 'object') {
        const toRender: Record<string, TableElement> = {};
        for (const [key, d] of Object.entries(data)) {
            if (typeof d !== 'string') toRender[key] = d;
        }
        const opened = ref(true);

        return (
            <div class={'table-root'}>
                <div
                    class={'table-folder'}
                    onClick={() => (opened.value = !opened.value)}
                    style={{ maxWidth: `${500 - 12 * props.n}px` }}
                >
                    <RightOutlined
                        class={'table-fold-icon'}
                        style={{
                            transition: `transform 0.3s ease`,
                            transform: opened.value ? `rotate(90deg)` : `none`
                        }}
                    />
                    <span class={'table-fold-key'}>{data.text}</span>
                </div>
                {opened.value && (
                    <div class={'table-content'}>
                        {Object.entries(toRender).map(v => {
                            return (
                                <TableRenderer
                                    keys={v[0]}
                                    data={v[1]}
                                    n={props.n + 1}
                                ></TableRenderer>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div
                class={'table-one'}
                style={{ maxWidth: `${500 - 12 * props.n}px` }}
            >
                <span class={'table-key'}>{props.keys}</span>
                <span class={'table-text'}>{data.text ?? ''}</span>
                <span class={'table-edit'}>
                    <Button style="font-size: 16px">编辑</Button>
                </span>
            </div>
        );
    }
}
