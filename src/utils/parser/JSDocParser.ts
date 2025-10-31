type ParamsType = 'number' | 'string' | 'object'

interface FuncTag {
  tag: string
  content: string
}

interface FuncTags {
  desc: string
  tags: FuncTag[]
}

export interface FunctionInputAndOutput {
  name: string
  type: string
  desc: string
  typeRecord?: {
    [key: string]: string
  }
}

export interface Function {
  desc: string
  input: FunctionInputAndOutput[]
  output: FunctionInputAndOutput[],
  examples: string[]
}

export interface JsDocData {
  metadata: {
    parsedAt: string,
    version: string
  },
  functions: Function[],
  classes: Array<any>
  summary: {
    totalFunctions: number
    totalClasses: number
    totalTags: number
  }
}

const shouldTypeRecord = (str: string) => {
  console.log('shouldTypeRecord', str)
  return str === 'object' || str === 'object[]'
}

export default class JSDocParser {
  private funcTags: Array<FuncTags>
  constructor() {
    this.init()
  }

  init() {
    this.funcTags = [];
  }
  /**
   * 解析JavaScript代码并提取JSDoc注释
   * @param {string} code - JavaScript源代码
   * @returns {JsDocData} 包含JSDoc信息的JSON对象
   */
  parseCode(code: string): JsDocData {
    this.init()
    try {
      this.extractJSDocComments(code);
      return this.generateOutput();
    } catch (error) {
      throw new Error(`解析失败: ${error.message}`);
    }
  }

  /**
   * 从代码中提取JSDoc注释
   * @param {string} code - JavaScript源代码
   */
  extractJSDocComments(code: string) {
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    const comments = code.match(jsdocRegex) || [];

    comments.forEach(comment => {
      const jsdocInfo = this.parseJSDocComment(comment);
      if (jsdocInfo) {
        this.funcTags.push(jsdocInfo);
      }
    });
  }

  /**
   * 解析单个JSDoc注释块
   * @param {string} comment - JSDoc注释文本
   * @returns {FuncTags|null} 解析后的JSDoc信息
   */
  parseJSDocComment(comment: string): FuncTags {
    let content = comment
      .replace(/^\/\*\*?/, '')
      .replace(/\*\/$/, '')
      .trim();

    const lines = content.split('\n').map(line =>
      line.replace(/^\s*\*?\s?/, '')
    );

    const funcTags = {
      desc: '',
      tags: []
    };

    // 函数描述可能会换行
    let funcDescList = [];

    lines.forEach(line => {
      if (line.startsWith('@')) {
        const tagMatch = line.match(/^@(\w+)\s+(.*)/);
        if (tagMatch) {
          const [, tagName, tagContent] = tagMatch;
          funcTags.tags.push({
            tag: tagName,
            content: tagContent.trim()
          });
        }
      } else {
        funcDescList.push(line);
      }
    });
    funcTags.desc = funcDescList.join('\n').trim();
    return funcTags.desc || funcTags.tags.length > 0 ? funcTags : null;
  }

  /**
   * 生成输出JSON
   * @returns {JsDocData} 格式化后的JSON输出
   */
  generateOutput(): JsDocData {
    const output: JsDocData = {
      metadata: {
        parsedAt: new Date().toLocaleDateString().replaceAll('/', '-') + " "+  new Date().toLocaleTimeString(),
        version: '1.0.0'
      },
      functions: [],
      classes: [],
      summary: {
        totalFunctions: 0,
        totalClasses: 0,
        totalTags: 0
      }
    };

    this.funcTags.forEach((item: FuncTags) => {
      const functionInfo: Function = this.extractFunctionInfo(item);
      if (functionInfo) {
        output.functions.push(functionInfo);
      }
    });

    output.summary.totalFunctions = output.functions.length;
    output.summary.totalClasses = output.classes.length;
    output.summary.totalTags = this.funcTags.reduce((sum, curr) =>
      sum + curr.tags.length, 0
    );

    return output;
  }

  /**
   * 从JSDoc信息中提取函数信息
   * @param {FuncTags} funcTag - JSDoc解析信息
   * @returns {Function|null} 函数信息对象
   */
  extractFunctionInfo(funcTag: FuncTags): Function {
    const functionInfo: Function = {
      desc: funcTag.desc,
      input: [],
      output: [],
      examples: []
    };
    let tagType = '';
    for (let i = 0; i < funcTag.tags.length; i++) {
      const tag = funcTag.tags[i];
      switch (tag.tag) {
        case 'param':
          tagType = this.matchAndPush(tag.content, tagType, functionInfo, 'input')
          break;
        case 'return':
        case 'returns':
          tagType = this.matchAndPush(tag.content, tagType, functionInfo, 'output')
          break;
        case 'example':
          functionInfo.examples.push(tag.content);
          break;
        case 'class':
          // 处理类信息
          break;
      }
    }


    console.log('functionInfo', functionInfo)
    return functionInfo.input.length > 0 || functionInfo.output ? functionInfo : null;
  }

  matchAndPush(tagContent: string, tagType: string, functionInfo: Function, pushKey: 'input' | 'output') {
    const paramMatch = tagContent.match(/\{([^}]+)\}\s+(\S+)(?:\s+-\s+(.*))?/);
    if (paramMatch) {
      const type = paramMatch[1];
      const name = paramMatch[2];
      const index = functionInfo[pushKey].length - 1
      // 说明是前面对象的参数
      if (name.includes('.') && !shouldTypeRecord(type) && tagType === name.split('.')[0]) {
        if (!functionInfo[pushKey][index]['typeRecord']) {
          functionInfo[pushKey][index]['typeRecord'] = {}
        }
        functionInfo[pushKey][index]['typeRecord'][name.split('.')[1]] = type
      } else {
        tagType = name;
        functionInfo[pushKey].push({
          name, type, desc: paramMatch[3] || ''
        });
      }
    }
    return tagType
  }
}
