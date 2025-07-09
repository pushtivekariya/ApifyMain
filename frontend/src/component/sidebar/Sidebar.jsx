import React from 'react';
import { Col, Layout, Menu } from 'antd';
import { UserOutlined, HomeOutlined } from '@ant-design/icons';
import styles from './sidebar.module.scss'
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';
const { Sider } = Layout;

// Helper function to generate a Menu item with routing
const getMenuItem = (route, icon, label) => ({
  key: route,
  icon: icon,
  label: <Link to={route}>{label}</Link>,  // Wrap the label with Link
});

const CustomSider = ({ collapsed }) => {
  const location = useLocation()
  return (
    <>
      <Sider
        className={styles.sidebar_wrapper}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className={styles.logo_wrapper}>
          <div className={styles.sidebar_logo}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5em' }}>Apify</span>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[location.pathname]}
          items={[
            getMenuItem(ROUTES.apifyIntegration, <HomeOutlined />, 'Integration'),
          ]}
        />
      </Sider>
    </>
  )
}
  ;

export default CustomSider