
/** 列表数据统一数据结构 */
export interface PaginationData<Item extends any = any> {
  page: number
  size: number
  total: number
  totalPage: number
  list: Item[]
}
