type ParamsType = 'number' | 'string' | 'object'


interface FuncTag {
  tag: string
  content: string
}

interface FuncTags {
  desc: string
  tags: FuncTag[]
}


interface FunctionInput {
  name: string
  type: string
  desc: string
}

interface Function {
  desc: string
  input: FunctionInput[]
  output: {
    type: string,
    desc: string
  },
  examples: string[]
}

interface JsDocData {
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
   * @returns {Object} 包含JSDoc信息的JSON对象
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
   * @returns {Object|null} 解析后的JSDoc信息
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
   * @returns {Object} 格式化后的JSON输出
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
   * @param {Object} jsdocInfo - JSDoc解析信息
   * @returns {Object|null} 函数信息对象
   */
  extractFunctionInfo(funcTag: FuncTags): Function {
    console.log('funcTag', funcTag)
    const functionInfo: Function = {
      desc: funcTag.desc,
      input: [],
      output: null,
      examples: []
    };

    funcTag.tags.forEach(tag => {
      switch (tag.tag) {
        case 'param':
          const paramMatch = tag.content.match(/\{([^}]+)\}\s+(\S+)(?:\s+-\s+(.*))?/);
          if (paramMatch) {
            functionInfo.input.push({
              name: paramMatch[2],
              type: paramMatch[1],
              desc: paramMatch[3] || ''
            });
          }
          break;
        case 'return':
        case 'returns':
          const returnMatch = tag.content.match(/\{([^}]+)\}\s+(.*)/);
          if (returnMatch) {
            functionInfo.output = {
              type: returnMatch[1],
              desc: returnMatch[2]
            };
          }
          break;
        case 'example':
          functionInfo.examples.push(tag.content);
          break;
        case 'class':
          // 处理类信息
          break;
      }
    });

    console.log('functionInfo', functionInfo)
    return functionInfo.input.length > 0 || functionInfo.output ? functionInfo : null;
  }
}
