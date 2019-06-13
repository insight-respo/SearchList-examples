
import { TABLE_DEFAULT_PAGE_SIZE } from '@/constants';

export interface IListItem {
  /** 数据的 id */
  id: string;
  /** 城市名 */
  stdName: string;
  /** 城市邮件编码 */
  zip: string;
  /** 人口(万人) */
  population: number;
  /** 数据创建时间戳 */
  createTime: number;
}

const mockData: Array<IListItem> = [{
  id: '1',
  stdName: '徐州',
  zip: '000001',
  population: 5000,
  createTime: 1560160103273,
}, {
  id: '2',
  stdName: '江西',
  zip: '000002',
  population: 2000,
  createTime: 1560160800370,
}]

export interface IExample1StateListData {
  list: Array<IListItem>,
  paginaton: {
    current: number,
    pageSize: number,
    total: number,
  }
}

export interface IExample1State {
  listData: IExample1StateListData
}

const defaultState: IExample1State = {
  listData: {
    list: mockData,
    paginaton: {
      current: 0,
      pageSize: TABLE_DEFAULT_PAGE_SIZE,
      total: 0,
    }
  }
}

export default {
  namespace: 'example1',
  state: defaultState,
  effects: {
    *getListData({ payload }, { call, put }) {

    }
  },
  reducers: {
    saveListData(state, action) {
      return {
        ...state,
        listData: [...action.payload]
      }
    }
  }
}