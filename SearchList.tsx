/**
 * @fileoverview 搜索列表的高阶组件
 * @author 蒋璇 <jiangxuan@dxy.cn>
 * @see https://github.com/insight-respo/SearchList-examples
 * @description 修改该组件请 file issue 到上面的仓库中告知
 */

// tslint:disable: member-ordering
import { TABLE_DEFAULT_PAGE_SIZE } from '@/constants';
import { FormComponentProps } from 'antd/lib/form';
import { PaginationProps } from 'antd/lib/pagination';
import { SorterResult } from 'antd/lib/table';
import { Location } from 'history';
import { isMoment, Moment } from 'moment';
import * as React from 'react';
import Router, { RouteData } from 'umi/router';

interface IT {
  [x: string]: any;
}

/**
 * @param T list 的一条数据的 结构
 */
export interface ISearchListOptions<T extends IT> {
  /**
   * @description 单选项的字段, 场景
   * * 是否关联成分词, 是否关联靶点... antd 的 table 在单选的场景下依旧是数组, 目前 insight 接口规范中需要是
   * 一个值, 而不是数组, 详情见规范 https://jiang-xuan.github.io/jfrontlife/前后端交互规范#请求规范
   * @default []
   */
  singleFields?: Array<Extract<keyof T, string>>;
  /**
   * @description 在 是否关联成分词, 是否关联靶点 等的场景下, 一般不会直接已字段名进行请求, 而是会加上一个 `isAssoc` 的前缀
   * 该配置可以用来配置该前缀
   * @default 'isAssoc'
   */
  singleFieldPrefix?: string;
  /**
   * @description 在筛选中中有时会存在 时间段 这样的筛选项, 目前 insight 接口规范中对于时间段的参
   * 数会拆分, 而不是作为一个数组, 详情见规范: https://jiang-xuan.github.io/jfrontlife/前后端交互规范#请求规范
   * @default []
   */
  timeRangeFields?: Array<Extract<keyof T, string>>;
  /**
   * @description 请求列表数据的 dispatch 的 type
   */
  listRequestType: string;

  DO_NOT_USE_THIS_OPTIONS_ROUTER?: {
    push: (path: string | RouteData) => void;
    replace: (path: string | RouteData) => void;
    go: (count: number) => void;
    goBack: () => void;
  };
}

export interface ISearchListProps extends FormComponentProps {
  dispatch: (options: { type: string; payload: object }) => void;
  location: Location & {
    query: object;
  };
}

interface IPaginationParams {
  // 当前页码
  p: string;
  // 每页条数
  pageSize: string;
}

type TFormValues = {
  [x: string]: any;
};

/**
 * @description 用于给调用方进行 type 断言
 */
export interface ISearchListWrappedComponentProps<T extends IT> {
  handleSubmit(event: React.SyntheticEvent): void;
  handleTableChange(
    pagination: PaginationProps,
    filters: Record<keyof T, string[] | string>,
    sorter: SorterResult<T>
  ): void;
  handleSearch(): void;
  urlQueryParams: Record<keyof T, string> & IPaginationParams;
}

export default function<T extends IT>(options: ISearchListOptions<T>) {
  const {
    singleFields = [],
    singleFieldPrefix = 'isAssoc',
    timeRangeFields = [],
    listRequestType,
    DO_NOT_USE_THIS_OPTIONS_ROUTER,
  } = options;
  const realRouter = DO_NOT_USE_THIS_OPTIONS_ROUTER || Router;
  return WrappedComponent => {
    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component';
    // 实际组件
    const component = class SearchListHOC extends React.Component<ISearchListProps> {
      public static displayName: string = `SearchList(${wrappedComponentName})`;

      private tablePagination: PaginationProps;

      private tableFilters: Record<keyof T, string[]>;

      private tableSorter: SorterResult<T>;

      private formValues: TFormValues;

      private urlQueryParams: { [x: string]: any };

      private initUrlQueryParams = () => {
        const {
          location: { query },
        } = this.props;

        return query;
      };

      private handleTableChange = (
        pagination: PaginationProps,
        filters: Record<keyof T, string[]>,
        sorter: SorterResult<T>
      ) => {
        this.tablePagination = pagination;

        /**
         * 单选的表单项的参数传递
         */
        const handledFilters = {};
        if (singleFields.length) {
          singleFields.forEach(singleField => {
            if (filters[singleField] && filters[singleField].length) {
              const name = singleFieldPrefix
                ? `${singleFieldPrefix}${singleField.slice(0, 1).toUpperCase()}${singleField.slice(
                    1
                  )}`
                : singleField;
              handledFilters[name] = filters[singleField][0];
            } else {
              // 用户没有选中任何的选项或者是用户点击了重置按钮
              delete this.urlQueryParams[
                `${singleFieldPrefix}${singleField.slice(0, 1).toUpperCase()}${singleField.slice(
                  1
                )}`
              ];
            }
          });
        }

        this.tableFilters = handledFilters;
        this.tableSorter = sorter;

        this.handleSearch();
      };

      private handleSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault();

        this.props.form.validateFields((errors, values: TFormValues) => {
          if (errors) {
            return;
          }

          this.formValues = values;
          this.handleSearch();
        });
      };

      private handleSearch = () => {
        const {
          dispatch,
          location: { pathname },
        } = this.props;

        let params = { ...this.urlQueryParams };

        if (this.formValues) {
          const formatedFormValue = Object.entries(this.formValues).reduce((prev, curr) => {
            const [key, value] = curr;
            // 如果该数据是一个时间 range 选择器
            if (timeRangeFields.includes(key)) {
              prev[key] = (value as Moment[]).map(item => item.unix());
            } else {
              prev[key] = value;
            }

            return prev;
          }, {});
          params = { ...params, ...formatedFormValue };
        }

        if (this.tablePagination) {
          params = {
            ...params,
            p: this.tablePagination.current,
            pageSize: this.tablePagination.pageSize,
          };
        } else {
          params = {
            ...params,
            p: 1,
            pageSize: TABLE_DEFAULT_PAGE_SIZE,
          };
        }

        if (this.tableFilters) {
          params = {
            ...params,
            ...this.tableFilters,
          };
        }

        if (this.tableSorter && this.tableSorter.field) {
          params = {
            ...params,
            sorter: `${this.tableSorter.field},${this.tableSorter.order}`,
          };
        } else {
          delete params.sorter;
        }

        /**
         * 时间 range 参数传递
         */
        if (timeRangeFields) {
          timeRangeFields.forEach(timeRangeField => {
            if (params[timeRangeField]) {
              const [start, end] = params[timeRangeField];
              params[`${timeRangeField}Start`] = start;
              params[`${timeRangeField}End`] = end;
              delete params[timeRangeField];
            }
          });
        }

        // 将所有的参数放置到 url 中
        realRouter.replace({
          pathname,
          query: {
            ...params,
          },
        });

        dispatch({
          type: listRequestType,
          payload: {
            ...params,
          },
        });
      };

      public render() {
        const urlQueryParams = this.initUrlQueryParams();
        this.urlQueryParams = urlQueryParams;
        return (
          <WrappedComponent
            {...this.props}
            handleTableChange={this.handleTableChange}
            handleSubmit={this.handleSubmit}
            handleSearch={this.handleSearch}
            urlQueryParams={urlQueryParams}
          />
        );
      }
    };
    return component as typeof WrappedComponent;
  };
}
