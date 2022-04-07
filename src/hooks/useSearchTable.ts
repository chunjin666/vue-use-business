/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { PaginationOptions } from './usePagination'
import { ref, onMounted } from 'vue'
import type { UnwrapRef, UnwrapNestedRefs } from 'vue'
import { usePagination } from './usePagination'
import { useForm } from './useForm'
import { PaginationData } from '../request/types'

/**
 * 分页查询请求
 */
type PaginationDataRequest<RequestParams, ResponseItem> = (
  params: RequestParams,
) => Promise<{ data: PaginationData<ResponseItem> }>

interface PageParams {
  page: number
  size: number
}

// `TableDataItem extends Record<string, any> = ResponseItem` 的意思是：
// 表格列表项 `TableDataItem` 是一个属性为 `string` 值为任意类型的对象，
// 这个对象默认类型与 接口返回的列表项 `ResponseItem` 相同
interface Options<
  FormData extends Record<string, any>,
  RequestParams,
  ResponseItem,
  TableDataItem extends Record<string, any> = ResponseItem,
> {
  /** 分页选项 */
  paginationOptions?: PaginationOptions
  /** 默认表单对象，从这里推断的类型会作为 `paramsGetter` 的参数类型传入 */
  defaultFormData: FormData
  /** 将表单结果和分页参数转化为请求接口需要的对象，支持 `Promise`，非必须。 */
  paramsGetter?: (formData: UnwrapNestedRefs<FormData>, pageParams: PageParams) => RequestParams | Promise<RequestParams>
  /**
   * 请求方法
   *
   * 参数类型需要与 `paramsGetter` 返回值类型匹配；
   *
   * 返回值数据类型需要与定义的相同：`Promise<{data: PaginationData<ResponseItem>}>`
   */
  requestMethod: PaginationDataRequest<RequestParams, ResponseItem>
  /** 调用 `requestMethod` 时额外调用的其他请求 */
  otherRequestMethod?: (params: UnwrapRef<FormData> & PageParams & Record<string, any>) => Promise<any>
  /** 对接口返回的列表数据进行处理的函数，其返回值的类型会作为 `tableData` 的类型 */
  dataFormatter?: (data: ResponseItem[]) => TableDataItem[]
}

const defaultParamsGetter = <T>(formData: T, pageParams: PageParams) => {
  return { ...formData, ...pageParams }
}

/**
 * 查询条件表单+可分页表格 hooks
 *
 * 此处定义的泛型参数都可以通过参数自动推断出来，并在返回值中使用，不需要特别声明
 *
 * @param opts 选项，参考 `Options`。每个参数用法会有具体的提示。
 */
export function useSearchTable<
  FormData extends Record<string, unknown>,
  RequestParams,
  ResponseItem,
  TableDataItem extends Record<string, any> = ResponseItem,
>(opts: Options<FormData, RequestParams, ResponseItem, TableDataItem>) {
  const { formEl, formData, } = useForm({
    defaultFormData: opts.defaultFormData,
  })
  const loading = ref(false)
  const tableData = ref([] as TableDataItem[])
  const { page, currentPage, pageSize, pageSizes, total, totalPage, updatePageData } = usePagination(
    opts.paginationOptions,
  )

  const requestTableData = async (params: any) => {
    const payload = await opts.requestMethod(params)
    tableData.value = (opts.dataFormatter
      ? opts.dataFormatter(payload.data.list)
      : payload.data.list) as any[]
    updatePageData(payload.data)
  }

  const searchData = async () => {
    const pageParams = { page: page.value, size: pageSize.value }
    const paramsGetter = opts.paramsGetter || defaultParamsGetter
    let params = paramsGetter(formData, pageParams)
    if (params instanceof Promise) {
      params = await (params as Promise<any>)
    }

    try {
      loading.value = true
      await Promise.all([requestTableData(params), opts.otherRequestMethod?.(params as any)])
      loading.value = false
    } catch (error) {
      loading.value = false
    }
  }

  const onSearch = () => {
    currentPage.value = 1
    searchData()
  }

  const onCurrentPageChange = (page: number) => {
    currentPage.value = page
    searchData()
  }

  const onPageSizeChange = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    searchData()
  }

  onMounted(() => onSearch())

  return {
    /** 表单元素 */
    formEl,
    /** 表单数据 */
    formData,
    /** 触发搜索 */
    onSearch,
    /** 是否正在加载中 */
    loading,
    /** 表格数据列表 */
    tableData,
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
    /** 触发当前页改变 */
    onCurrentPageChange,
    /** 触发每页数据条数改变 */
    onPageSizeChange,
  }
}
