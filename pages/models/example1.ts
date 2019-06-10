
export interface IListItem {
  /** 数据的 id */
  id: string;
  /** 城市名 */
  name: string;
  /** 城市邮件编码 */
  zip: string;
  /** 人口(万人) */
  population: number;
  /** 数据创建时间戳 */
  createTime: number;
}

const defaultState: {
  listData: Array<IListItem>
} = {
  listData: []
}

export default {
  namespace: 'example1',
  state: defaultState
}