/**
 * 表格全局默认配置
 * 修改此文件可统一调整所有 BlogTable 的默认行为
 */
export default {
  // 默认每页条数
  pageSize: 10,
  // 可选每页条数
  pageSizes: ['10', '20', '50', '100'],
  // 分页组件布局
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  // 表格默认尺寸: 'large' | 'middle' | 'small'
  size: 'middle',
  // 是否默认显示边框
  border: false,
  // 空状态描述文本
  emptyText: '暂无数据'
}
