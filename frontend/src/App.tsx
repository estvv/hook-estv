import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HookCreator } from './components/HookCreator';
import { HookViewer } from './components/HookViewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HookCreator />} />
        <Route path="/hook/:slug" element={<HookViewerWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

function HookViewerWrapper() {
  const slug = window.location.pathname.split('/hook/')[1] || '';
  const handleBack = () => {
    window.location.href = '/';
  };
  return <HookViewer slug={slug} onBack={handleBack} />;
}

export default App;