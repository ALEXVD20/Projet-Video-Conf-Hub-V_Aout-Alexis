import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BarreNavigation from './composants/BarreNavigation';
import Accueil from './pages/Accueil';
import DetailChaine from './pages/DetailChaine';
import LectureVideo from './pages/LectureVideo';
import Recherche from './pages/Recherche';
import AVoirPlusTard from './pages/AVoirPlusTard';
import Historique from './pages/Historique';

function App() {
  return (
      <BrowserRouter>
        <div className="min-h-screen bg-[#0a0c10] text-[#f3f4f6]">
          <BarreNavigation />
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/chaine/:identifiantChaine" element={<DetailChaine />} />
            <Route path="/lecture/:identifiantVideo" element={<LectureVideo />} />
            <Route path="/recherche" element={<Recherche />} />
            <Route path="/a-voir" element={<AVoirPlusTard />} />
            <Route path="/historique" element={<Historique />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;