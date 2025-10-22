/**
 * 决策表的默认表格数据
 */
export const defaultMockDecisionTableData = [
    {
        id: "row1",
        index: 1,
        Input: [
            { paramName: "CXHD", paramValue: "", paramType: "string", paramCode: "CXHD", isCustom: 0 },
        ],
        Output: [
            { paramName: "name名", paramValue: "", paramType: "string", paramCode: "name", isCustom: 0 },
        ],
        Annotations: [
            { paramName: "描述备注名", paramValue: "", paramType: "string", paramCode: "desc", isCustom: 0 }
        ]
    }
];

/**
 * 决策表的默认表格数据(旧数据，目前没用到)
 */
export const defaultMockDecisionTableDatadecisionModelData = [
    {
        id: "row1",
        index: 1,
        Input: [
            { paramName: "CXHD", paramValue: "", paramType: "string", paramCode: "CXHD", isCustom: 0 },
        ],
        Output: [
            { paramName: "name名", paramValue: "", paramType: "string", paramCode: "name", isCustom: 0 },
        ],
        Annotations: [
            { paramName: "描述备注名", paramValue: "", paramType: "string", paramCode: "desc", isCustom: 0 }
        ]
    },
    
    {
        id: "row1",
        index: 1,
        Input: [
            { paramName: "CXHD", paramValue: "", paramType: "string", paramCode: "CXHD", isCustom: 0 },
        ],
        Output: [
            { paramName: "name名", paramValue: "", paramType: "string", paramCode: "name", isCustom: 0 },
        ],
        Annotations: [
            { paramName: "描述备注名", paramValue: "", paramType: "string", paramCode: "desc", isCustom: 0 }
        ]
    },
    
    {
        id: "row1",
        index: 1,
        Input: [
            { paramName: "CXHD", paramValue: "", paramType: "string", paramCode: "CXHD", isCustom: 0 },
        ],
        Output: [
            { paramName: "name名", paramValue: "", paramType: "string", paramCode: "name", isCustom: 0 },
        ],
        Annotations: [
            { paramName: "描述备注名", paramValue: "", paramType: "string", paramCode: "desc", isCustom: 0 }
        ]
    }

]

/**
 * 决策表模板数据
 * 用于下载模板功能
 */
export const decisionTableTemplateData = [
    // 第一行：分组标题
    ['Input (上传前请删除该列, 避免上传无法识别变量)', 'Input', 'Output (上传前请删除该列, 避免上传无法识别变量)', 'Output', 'Annotations'],
    
    // 第二行：变量代码示例
    ['code (变量代码示例, 白色区域录入时按需修改)', 'H', 'code (变量代码示例, 白色区域录入时按需修改)', 'riskPredict', 'desc'],
    
    // 第三行：变量名称
    ['变量名称 (变量示例, 录入时按需修改)', '高度', '变量名称 (变量示例, 录入时按需修改)', '风险预测', '备注'],
    
    // 第四行：数据类型
    ['数据类型 (string/boolean/number)', 'number', '数据类型 (string/boolean/Number)', 'string', 'string'],
    
    // 第五行：示例数据1
    ['变量数据行1', 'H<10000', '输出结果', '可安装', '通过检测'],
    
    // 第六行：示例数据2
    ['变量数据行2', 'H=10000', '输出结果', '需加固', '需要增加物料'],
    
    // 第七行：示例数据3
    ['变量数据行3', 'H>10000', '输出结果', '需拆分', '打回拆分后重新下单']
];

