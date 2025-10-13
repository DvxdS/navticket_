import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import SearchResults from '@/pages/SearchResults';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    
  );
}

export default App;