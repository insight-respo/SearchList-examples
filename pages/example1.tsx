
import * as React from 'react';
import SearchList, { ISearchListWrappedComponentProps } from '../SearchList'
import { Form } from 'antd';
import styles from './index.css';
import { FormComponentProps } from 'antd/lib/form';

interface IListItem {
  /** 数据的 id */
  id: string;
  /** 城市名 */
  name: string;
  /** 城市邮件编码 */
  zip: string;
  /** 人口(万人) */
  population: number;
}

interface IExample1Props extends FormComponentProps, ISearchListWrappedComponentProps<IListItem> {

}

class Example1 extends React.Component<IExample1Props, {}> {
  public render() {
    return (
      <div className={styles.normal}>
        <h1>Page index</h1>
      </div>
    );
  }
}

export default Form.create<IExample1Props>({})(Example1);
