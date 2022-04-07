import { PaginationData } from '../request/types'
import { ref, computed } from 'vue'

const defaultOptions = {
  firstPage: 0 as 0 | 1,
  pageSize: 10,
  pageSizes: [10, 20, 30, 40, 50],
}

export interface PaginationOptions {
  /** 服务端API第一页的index */
  firstPage?: 0 | 1
  /** 每页数据条数 */
  pageSize?: number
  /** 可供切换的每页数据条数选项 */
  pageSizes?: number[]
}

export function usePagination(options: PaginationOptions = defaultOptions) {
  options = { ...defaultOptions, ...options }
  const currentPageOffset = options.firstPage === 0 ? 1 : 0
  /** 当前页，Pagination组件使用 */
  const currentPage = ref<number>(options.firstPage === 0 ? 1 : options.firstPage || 1)
  /** 当前页，网络请求时使用 */
  const page = computed(() => currentPage.value - currentPageOffset)
  /** 每页数据条数 */
  const pageSize = ref(options.pageSize || defaultOptions.pageSize)
  /** 可供切换的每页数据条数选项 */
  const pageSizes = ref(options.pageSizes || defaultOptions.pageSizes)
  /** 总数据条数 */
  const total = ref(0)
  /** 总页数 */
  const totalPage = ref(0)

  const updatePageData = (paginationData: PaginationData) => {
    currentPage.value = paginationData.page + currentPageOffset
    total.value = paginationData.total
    totalPage.value = paginationData.totalPage
  }

  return {
    /** 当前页，Pagination组件使用 */
    page,
    /** 当前页，网络请求时使用 */
    currentPage,
    /** 每页数据条数 */
    pageSize,
    /** 总数据条数 */
    total,
    /** 总页数 */
    totalPage,
    /** 可供切换的每页数据条数选项 */
    pageSizes,
    /** 更新分页信息回调 */
    updatePageData,
  }
}
