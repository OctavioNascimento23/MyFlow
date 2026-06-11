import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './features/dashboard/Dashboard';
import Launcher from './features/launcher/Launcher';
import ClockPomodoro from './features/clock-pomodoro/ClockPomodoro';
import Tasks from './features/tasks/Tasks';
import Reminders from './features/reminders/Reminders';
import Notes from './features/notes/Notes';
import Automations from './features/automations/Automations';
import Settings from './features/settings/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/launcher" element={<Launcher />} />
          <Route path="/clock-pomodoro" element={<ClockPomodoro />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/automations" element={<Automations />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

// Made with Bob
