export type TableColumn = {
  key: string
  type?: string
  label?: string
  width?: string
  showOverflowTooltip?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => any
  // setting的时候有用
  hidden?: boolean
  [key: string]: any;
}
