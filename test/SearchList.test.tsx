import { Component } from 'react';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import { Location } from 'history';
import SearchList from '@/SearchList';

/**
 * SearchList 组件依赖:
 * * dispatch
 * * location
 * * form antd 组件库的 form props, 可以 mock
 * * umi/router 组件允许使用 DO_NOT_USE_THIS_OPTIONS_ROUTER 进行覆盖
 */

function connect(dispatch: Function, location: Location) {
  return WrappedComponent => {
    return class extends Component {
      static displayName: string = `connect(${WrappedComponent.displayName || WrappedComponent.name})`
      public render() {
        return <WrappedComponent dispatch={dispatch} location={location} />
      }
    } as typeof WrappedComponent
  }
}

const OriginComponent = function (props) {
    return <div>
      <div onClick={props.handleSubmit}>搜索</div>
      <div onClick={props.handleTableChange}>表格</div>
    </div>
  }

test('should be render without error', () => {
  const dispatch = jest.fn(() => {})
  const location = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
    query: {},
  }

  const Component = connect(dispatch, location)(SearchList({
    listRequestType: 'testDispatch/getList',
  })(OriginComponent))

  const testRenderer = TestRenderer.create(<Component />)

  const tree = testRenderer.toJSON()

  expect(tree).toMatchSnapshot()
})

test('should: 从 location props 中正确的初始化参数', () => {
  const mockQuery = {
    p: 2,
    pageSize: 15,
    sorter: 'id,desand',
  }
  const dispatch = jest.fn(() => {})
  const location = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
    query: {
      ...mockQuery
    }
  }

  const Component = connect(dispatch, location)(SearchList({
    listRequestType: 'testDispatch/getList',
  })(OriginComponent))

  const testRenderer = TestRenderer.create(<Component />)
  const testInstance = testRenderer.root;

  expect(testInstance.findByType(OriginComponent).props.urlQueryParams).toEqual(mockQuery);
})