/**
 * @fileoverview 搜索列表的高阶组件
 * @author 蒋璇 <jiangxuan@dxy.cn>
 */

// tslint:disable: member-ordering
import { TABLE_DEFAULT_PAGE_SIZE } from '@/constants';
import { FormComponentProps } from 'antd/lib/form';
import { PaginationProps } from 'antd/lib/pagination';
import { SorterResult } from 'antd/lib/table';
import { Location } from 'history';
import { isMoment } from 'moment';
import * as React from 'react';
import Router from 'umi/router';

/**
 * @param T list 的一条数据的 结构
 */
export interface ISearchListOptions<T> {
  /**
   * @description 单选项的字段, 场景
   * * 是否关联成分词, 是否关联靶点... antd 的 table 在单选的场景下依旧是数组, 目前 insight 接口规范中需要是
   * 一个值, 而不是数组, 详情见规范 https://jiang-xuan.github.io/jfrontlife/前后端交互规范#请求规范
   */
  singleFields?: Array<keyof T>;
  /**
   * @description 在 是否关联成分词, 是否关联靶点 等的场景下, 一般不会直接已字段名进行请求, 而是会加上一个 `isAssoc` 的前缀
   * 该配置可以用来配置该前缀
   */
  singleFieldPrefix?: string;
  /**
   * @description 在筛选中中有时会存在 时间段 这样的筛选项, 目前 insight 接口规范中对于时间段的参
   * 数会拆分, 而不是作为一个数组, 详情见规范: https://jiang-xuan.github.io/jfrontlife/前后端交互规范#请求规范
   */
  timeRangeFields?: Array<keyof T>;
  /**
   * @description 请求列表数据的 dispatch 的 type
   */
  listRequestType: string;
}

export interface ISearchListProps extends FormComponentProps {
  dispatch: (options: { type: string; payload: object }) => void;
  location: Location;
}

/**
 * @description 用于给调用方进行 type 断言
 */
export interface ISearchListWrappedComponentProps<T> {
  handleSubmit(event: React.SyntheticEvent): void;
  handleTableChange(
    pagination: PaginationProps,
    filters: Record<keyof T, string[]>,
    sorter: SorterResult<T>
  ): void;
  handleSearch(): void;
  urlQueryParams: Record<keyof T, string> & { current: string, pageSize: string };
}

export default function<T>(options: ISearchListOptions<T>) {
  const { singleFields, singleFieldPrefix, timeRangeFields, listRequestType } = options;
  return WrappedComponent => {
    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component';
    // 实际组件
    const component = class SearchListHOC extends React.Component<ISearchListProps> {
      public static displayName: string = `SearchList(${wrappedComponentName})`;

      private tablePagination: PaginationProps;

      private tableFilters: Record<keyof T, string[]>;

      private tableSorter: SorterResult<T>;

      private formValues: object;

      private initUrlQueryParams = () => {
        const {
          location: { query },
        } = this.props;

        return query as object;
      };

      private urlQueryParams = this.initUrlQueryParams();

      private handleTableChange = (
        pagination: PaginationProps,
        filters: Record<keyof T, string[]>,
        sorter: SorterResult<T>
      ) => {
        this.tablePagination = pagination;
        this.tableFilters = filters;

        if (sorter.field) {
          this.tableSorter = sorter;
        }

        this.handleSearch();
      };

      private handleSubmit = (event: React.SyntheticEvent) => {
        event.preventDefault();

        this.props.form.validateFields((errors, values) => {
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
            // 如果数据是一个数组, 那么就说明该数据是一个时间 range 选择器
            prev[key] = Array.isArray(value)
              ? value.map(item => (isMoment(item) ? item.valueOf() : item))
              : value;

            return prev;
          }, {});
          params = { ...params, ...formatedFormValue };
        }

        if (this.tablePagination) {
          params = {
            ...params,
            current: this.tablePagination.current,
            pageSize: this.tablePagination.pageSize,
          };
        } else {
          params = {
            ...params,
            current: 1,
            pageSize: TABLE_DEFAULT_PAGE_SIZE,
          };
        }

        if (this.tableFilters) {
          params = {
            ...params,
            ...this.tableFilters,
          };
        }

        if (this.tableSorter) {
          params = {
            ...params,
            sorter: `${this.tableSorter.field},${this.tableSorter.order}`,
          };
        }

        /**
         * 单选的表单项的参数传递
         */
        if (singleFields) {
          singleFields.forEach(singleField => {
            if (params[singleField]) {
              if (params[singleField].length > 0) {
                const name = singleFieldPrefix
                  ? `${singleFieldPrefix}${singleField
                      .slice(0, 1)
                      .toUpperCase()}${singleField.slice(1)}`
                  : singleField;
                params[name] = params[singleField][0];
              }
              delete params[singleField];
            }
          });
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

        console.log(params);

        // 将所有的参数放置到 url 中
        Router.replace({
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
        return (
          <WrappedComponent
            {...this.props}
            handleTableChange={this.handleTableChange}
            handleSubmit={this.handleSubmit}
            handleSearch={this.handleSearch}
            urlQueryParams={this.urlQueryParams}
          />
        );
      }
    };
    return component as typeof WrappedComponent;
  };
}
