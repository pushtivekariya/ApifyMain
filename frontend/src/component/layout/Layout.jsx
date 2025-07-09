import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import CustomSider from '../sidebar/Sidebar';
import CustomHeader from '../header/Header';
import styles from './layout.module.scss';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className={styles.layout}>
      <CustomSider collapsed={collapsed} />
      <Layout className={styles.mainContent}>
        <CustomHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          colorBgContainer={colorBgContainer}
        />
        <Content className={styles.content}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
