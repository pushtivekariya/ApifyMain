import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainLayout from './component/layout/Layout';
import { ROUTES } from './utils/routes';
import ApifyIntegration from './pages/ApifyIntegration';

const App = () => {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Navigate to={ROUTES.apifyIntegration} />} />
                    <Route path={ROUTES.apifyIntegration} element={<ApifyIntegration />} />
                </Routes> 
            </MainLayout>
        </Router>
    );
};

export default App;
