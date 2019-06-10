
import * as React from 'react';
import { Form, Input, DatePicker, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import Table, { ColumnProps } from 'antd/lib/table';
import SearchList, { ISearchListWrappedComponentProps } from '../SearchList'
import { IListItem } from './models/example1';

import 'antd/dist/antd.css'

const FormItem = Form.Item;

interface IExample1Props extends FormComponentProps, ISearchListWrappedComponentProps<IListItem> {

}

const mockData: Array<IListItem> = [{
  id: '1',
  name: '徐州',
  zip: '000001',
  population: 5000,
  createTime: 1560160103273,
}, {
  id: '2',
  name: '江西',
  zip: '000002',
  population: 2000,
  createTime: 1560160800370,
}]

// @connect(({ example1 }) => ({
//   listData: example1.listData,
// }))
@SearchList<IListItem>({
  listRequestType: '',
})
class Example1 extends React.Component<IExample1Props, {}> {
  private columns: Array<ColumnProps<IListItem>> = [
    {
      title: 'id',
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: '城市名',
      dataIndex: 'name',
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

  public componentDidMount() {
    // 发起请求获取第一次数据
  }

  public render() {
    return (
      <div>
        {this.renderFilterForm()}
        <Table rowKey="id" columns={this.columns} dataSource={mockData} />
      </div>
    );
  }

  private renderFilterForm() {
    const { form: { getFieldDecorator } } = this.props
    return (
      <Form layout="inline" onSubmit={this.props.handleSubmit} style={{ marginBottom: 25 }}>
        <FormItem label="id">
          {getFieldDecorator('id')(
            <Input placeholder="id" />
          )}
        </FormItem>
        <FormItem label="zip">
          {getFieldDecorator('zip')(
            <Input placeholder="zip" />
          )}
        </FormItem>
        <FormItem label="人口">
          {getFieldDecorator('population')(
            <Input placeholder="population" />
          )}
        </FormItem>
        <FormItem label="创建时间">
          {getFieldDecorator('createTime')(
            <DatePicker.RangePicker />
          )}
        </FormItem>
        <FormItem>
          <Button htmlType="submit">搜索</Button>
        </FormItem>
      </Form>
    )
  }
}

export default Form.create<IExample1Props>({})(Example1);
