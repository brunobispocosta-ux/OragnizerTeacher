import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Billing from './pages/Billing';
import SessionControl from './pages/SessionControl';
import ScheduleSession from './pages/ScheduleSession';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="billing" element={<Billing />} />
          <Route path="session/:id" element={<SessionControl />} />
          <Route path="schedule" element={<ScheduleSession />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;