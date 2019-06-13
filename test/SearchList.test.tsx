import { Component } from 'react';
import * as React from 'react';
import * as TestRenderer from 'react-test-renderer';
import * as _ from 'lodash'
import * as enzyme from 'enzyme';
import { Location } from 'history';
import SearchList from '@/SearchList';
import moment from 'moment';

/**
 * SearchList 组件依赖:
 * * dispatch
 * * location
 * * form antd 组件库的 form props, 可以 mock
 * * umi/router 组件允许使用 DO_NOT_USE_THIS_OPTIONS_ROUTER 进行覆盖
 */

function connect(dispatch: Function, location: Location, otherProps: object = {}) {
  return WrappedComponent => {
    return class extends Component {
      static displayName: string = `connect(${WrappedComponent.displayName || WrappedComponent.name})`
      public render() {
        return <WrappedComponent dispatch={dispatch} location={location} {...otherProps} />
      }
    } as typeof WrappedComponent
  }
}

const OriginComponent = function (props) {
    return <div>
      <div className="searchButton" onClick={props.handleSubmit}>form 表单搜索</div>
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

  const compose = _.flowRight(
    connect(dispatch, location),
    SearchList({
      listRequestType: 'testDispatch/getList',
    })
  )

  const Component = compose(OriginComponent)

  const testRenderer = TestRenderer.create(<Component />)

  const tree = testRenderer.toJSON()

  expect(tree).toMatchSnapshot()
})

test('should: 从 location props 中正确的初始化参数(无需特殊处理的 url 参数)', () => {
  const mockQuery = {
    drugName: '阿司匹林',
    companyName: '阿里',
  }
  const dispatch = jest.fn(() => {})
  const location = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
    query: {
      ...mockQuery
    },
  }

  const compose = _.flowRight(
    connect(dispatch, location),
    SearchList({
      listRequestType: 'testDispatch/getList',
    })
  )

  const Component = compose(OriginComponent)

  const testRenderer = TestRenderer.create(<Component />)
  const testInstance = testRenderer.root;

  expect(testInstance.findByType(OriginComponent).props.urlQueryParams).toEqual(mockQuery);
})

test('should: 从 location props 中正确的初始化参数, 含有特殊的 singleFields 参数', () => {
  const mockQuery = {
    isAssocStdElement: -1,
    isAssocStdIndication: 1,
  }

  const dispatch = jest.fn(() => {})
  const location = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
    query: {
      ...mockQuery
    },
  }

  const compose = _.flowRight(
    connect(dispatch, location),
    SearchList({
      listRequestType: 'testDispatch/getList',
      singleFields: ['stdElement', 'stdIndication'],
      singleFieldPrefix: 'isAssoc',
    })
  )

  const Component = compose(OriginComponent)

  const testRenderer = TestRenderer.create(<Component />)
  const testInstance = testRenderer.root;

  expect(testInstance.findByType(OriginComponent).props.urlQueryParams).toEqual(mockQuery);
})

test('should: 从 location props 中正确的初始化参数, 含有特殊的 timeRangeFields 参数', () => {
  const mockQuery = {
    updateTimeStart: 3443,
    updateTimeEnd: 4324,
  }

  const dispatch = jest.fn(() => {})
  const location = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
    query: {
      ...mockQuery
    },
  }

  const compose = _.flowRight(
    connect(dispatch, location),
    SearchList({
      listRequestType: 'testDispatch/getList',
      timeRangeFields: ['updateTime'],
    })
  )

  const Component = compose(OriginComponent)

  const testRenderer = TestRenderer.create(<Component />)
  const testInstance = testRenderer.root;

  expect(testInstance.findByType(OriginComponent).props.urlQueryParams).toEqual(mockQuery);
})

describe('should: 在点击搜索按钮的时候调用正确的函数和传入正确的参数', () => {
  test('should: 只入参 singleFields, singleFieldPrefix. 正确的调用 dispatch, validateFields, Router.replace.', () => {
    const mockQuery = {
      id: '123456',
    }
    const dispatch = jest.fn(() => {})
    const validateFields = jest.fn((callback) => {
      callback(null, {
        id: '123456',
      })
    })
    const routerReplace = jest.fn(() => {})
    const location = {
      pathname: '/trending',
      search: '',
      state: '',
      hash: '',
      query: {
        ...mockQuery
      },
    }
    const Router = {
      replace: routerReplace,
      push: () => {},
      go: () => {},
      goBack: () =>{},
    }
  
    const compose = _.flowRight(
      connect(dispatch, location, {
        form: {
          validateFields
        }
      }),
      SearchList({
        listRequestType: 'testDispatch/getList',
        singleFieldPrefix: 'isAssoc',
        singleFields: ['stdElement'],
        DO_NOT_USE_THIS_OPTIONS_ROUTER: Router,
      })
    )
  
    const Component = compose(OriginComponent)
  
    const testRenderer = enzyme.mount(<Component />);
  
    const originComponent = testRenderer.find(OriginComponent)
    originComponent.find('.searchButton').simulate('click')
  
    expect(validateFields).toBeCalled()
    expect(routerReplace).toBeCalledWith({
      pathname: '/trending',
      query: {
        p: 1,
        pageSize: 15,
        id: '123456',
      }
    })
    expect(dispatch).toBeCalledWith({
      type: 'testDispatch/getList',
      payload: {
        p: 1,
        pageSize: 15,
        id: '123456',
      },
    })
  })

  test('should: 只入参 timeRangeFields. 正确的调用 dispatch, validateFields, Router.replace', () => {
    const mockQuery = {
      id: '123456',
    }
    const dispatch = jest.fn(() => {});
    const validateFields = jest.fn((callback) => {
      callback(null, {
        updateTime: [moment(1560407706310), moment(1560407857997)],
      })
    })
    const routerReplace = jest.fn(() => {})
    const location = {
      pathname: '/trending',
      search: '',
      state: '',
      hash: '',
      query: {
        ...mockQuery
      },
    }
    const Router = {
      replace: routerReplace,
      push: () => {},
      go: () => {},
      goBack: () =>{},
    }

    const compose = _.flowRight(
      connect(dispatch, location, {
        form: {
          validateFields
        }
      }),
      SearchList({
        listRequestType: 'testDispatch/getList',
        timeRangeFields: ['updateTime', 'createTime'],
        DO_NOT_USE_THIS_OPTIONS_ROUTER: Router,
      })
    )
  
    const Component = compose(OriginComponent)
  
    const testRenderer = enzyme.mount(<Component />)

    const originComponent = testRenderer.find(OriginComponent)
    originComponent.find('.searchButton').simulate('click')

    expect(validateFields).toBeCalled()
    expect(routerReplace).toBeCalledWith({
      pathname: '/trending',
      query: {
        p: 1,
        pageSize: 15,
        id: '123456',
        updateTimeStart: 1560407706310,
        updateTimeEnd: 1560407857997,
      }
    })
    expect(dispatch).toBeCalledWith({
      type: 'testDispatch/getList',
      payload: {
        p: 1,
        pageSize: 15,
        id: '123456',
        updateTimeStart: 1560407706310,
        updateTimeEnd: 1560407857997,
      }
    })
  })
})

describe('should: 在表格变化的时候调用合适的函数和传递响应的参数', () => {
  test('should: 点击表格中单选项的 reset 按钮来重置筛选项', () => {
    const OriginComponent = function (props) {
      return (
        <div onClick={() => {
          props.handleTableChange({
            current: 1,
            pageSize: 15,
          }, {
            // ant design 中, 传递空数组来重置
            stdElement: [],
          })
        }} className="resetStdElement">重置 stdElement 筛选项的按钮</div>
      )
    }
    const mockQuery = {
      isAssocStdElement: 1,
    }
    const dispatch = jest.fn(() => {})
    const validateFields = jest.fn((callback) => { callback(null, {}) })
    const routerReplace = jest.fn(() => {})
    const location = {
      pathname: '/',
      search: '',
      state: '',
      hash: '',
      query: {
        ...mockQuery
      },
    }
    const Router = {
      replace: routerReplace,
      push: () => {},
      go: () => {},
      goBack: () =>{},
    }

    const compose = _.flowRight(
      connect(dispatch, location, {
        form: {
          validateFields
        }
      }),
      SearchList({
        listRequestType: 'testDispatch/getList',
        singleFieldPrefix: 'isAssoc',
        singleFields: ['stdElement'],
        DO_NOT_USE_THIS_OPTIONS_ROUTER: Router,
      })
    )
  
    const Component = compose(OriginComponent)
  
    const testRenderer = enzyme.mount(<Component />)

    const originComponent = testRenderer.find(OriginComponent)
    expect(originComponent.prop('urlQueryParams')).toEqual({
      isAssocStdElement: 1,
    })
    
    const resetBtn = originComponent.find('.resetStdElement')

    resetBtn.simulate('click')

    expect(dispatch).toBeCalledWith({
      type: 'testDispatch/getList',
      payload: {
        p: 1,
        pageSize: 15,
      },
    })

    expect(routerReplace).toBeCalledWith({
      pathname: '/',
      query: {
        p: 1,
        pageSize: 15,
      }
    })
  })
})