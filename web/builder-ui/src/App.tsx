import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Runs from './pages/Runs';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="workflow/:id" element={<Editor />} />
                    <Route path="runs" element={<Runs />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
