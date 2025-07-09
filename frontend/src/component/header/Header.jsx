import React from 'react';
import { Button, FloatButton } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import style from './header.module.scss';

const CustomHeader = ({ collapsed, setCollapsed }) => {
  return (
    <header className={style.customHeader}>
      <Button
        type="text"
        size='small'
        className={style.collapsedButton}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
      />
      <FloatButton>test</FloatButton>
    </header>
  );
};

export default CustomHeader;
