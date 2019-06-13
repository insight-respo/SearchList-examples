
import * as React from 'react';
import { Form, Input, DatePicker, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Table, { ColumnProps } from 'antd/lib/table';
import { connect } from 'dva'
import moment = require('moment');
import SearchList, { ISearchListWrappedComponentProps } from '../SearchList'
import { IListItem, IExample1State, IExample1StateListData } from './models/example1';

import styles = require('./index.css');
import 'antd/dist/antd.css'

const FormItem = Form.Item;

interface IExample1Props extends FormComponentProps, ISearchListWrappedComponentProps<IListItem> {
  listData: IExample1StateListData
}

const assocFilters = [
  {
    text: '已关联',
    value: '1',
  },
  {
    text: '未关联',
    value: '-1',
  },
];



/**
 * @description 初始化 rangePicker 的初始值
 * @param {number} start
 * @param {number} end
 */
const initialRangePickerValue = (start: number, end: number) => {
  if (!start || !end) {
    return [];
  }

  return [moment(+start), moment(+end)];
};


@connect(({ example1 }: { example1: IExample1State }) => ({
  listData: example1.listData,
}))
@SearchList<IListItem>({
  listRequestType: 'example1/getListData',
  singleFieldPrefix: 'isAssoc',
  singleFields: ['stdName'],
  timeRangeFields: ['createTime'],
})
class Example1 extends React.Component<IExample1Props, {}> {
  private getColumns = (): Array<ColumnProps<IListItem>> => {
    return [
      {
        title: 'id',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '标准城市名',
        dataIndex: 'stdName',
        filters: assocFilters,
        filterMultiple: false,
        filteredValue: this.props.urlQueryParams.isAssocStdName
          ? [this.props.urlQueryParams.isAssocStdName]
          : [],
      },
      {
        title: 'zip',
        dataIndex: 'zip',
      },
      {
        title: '人口',
        dataIndex: 'population',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      }
    ]
  }

  public componentDidMount() {
    // 发起请求获取第一次数据
  }

  public render() {
    const columns = this.getColumns();
    return (
      <div className={styles.normal}>
        <div>
          <h2>本实例展现了该组件的能力</h2>
          <ul>
            <li>同步 url 参数</li>
            <li>处理 filter form search 请求</li>
            <li>处理表格的 filter 请求</li>
          </ul>
          <h2>注意:</h2>
          <ul>
            <li>
              <details>
                <summary>
                  如果想要 table 的 columns 和 url 中的 query 部分同步, 必须在 render 中重新渲染 columns
                </summary>
                <pre>
                  {`
private getColumns = (): Array<ColumnProps<IListItem>> => {
    return [
      {
        title: 'id',
        dataIndex: 'id',
        sorter: true,
      },
      {
        title: '标准城市名',
        dataIndex: 'stdName',
        filters: assocFilters,
        filterMultiple: false,
        filteredValue: this.props.urlQueryParams.isAssocStdName
          ? [this.props.urlQueryParams.isAssocStdName]
          : [],
      },
      {
        title: 'zip',
        dataIndex: 'zip',
      },
      {
        title: '人口',
        dataIndex: 'population',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      }
    ]
  }
                `}
                {`
public render() {
  const columns = this.getColumns();
}
                  `}
                </pre>
              </details>
            </li>
          </ul>
        </div>

        {this.renderFilterForm()}
        <Table pagination={{...this.props.listData.paginaton}} onChange={this.props.handleTableChange} rowKey="id" columns={columns} dataSource={this.props.listData.list} />
      </div>
    );
  }

  private renderFilterForm() {
    const { form: { getFieldDecorator } } = this.props
    return (
      <Form layout="inline" onSubmit={this.props.handleSubmit} style={{ marginBottom: 25 }}>
        <FormItem label="id">
          {getFieldDecorator('id', {
            initialValue: this.props.urlQueryParams.id,
          })(
            <Input placeholder="id" />
          )}
        </FormItem>
        <FormItem label="zip">
          {getFieldDecorator('zip', {
            initialValue: this.props.urlQueryParams.zip,
          })(
            <Input placeholder="zip" />
          )}
        </FormItem>
        <FormItem label="人口">
          {getFieldDecorator('population', {
            initialValue: this.props.urlQueryParams.population
          })(
            <Input placeholder="population" />
          )}
        </FormItem>
        <FormItem label="创建时间">
          {getFieldDecorator('createTime', {
            initialValue: initialRangePickerValue(
              this.props.urlQueryParams.createTimeStart,
              this.props.urlQueryParams.createTimeEnd,
            ),
          })(
            <DatePicker.RangePicker />
          )}
        </FormItem>
        <FormItem>
          <Button htmlType="submit" type="primary">搜索</Button>
        </FormItem>
      </Form>
    )
  }
}

export default Form.create<IExample1Props>({})(Example1);
