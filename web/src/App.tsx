import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import MapEditor from './components/MapEditor';
import LandingPage from './components/LandingPage';
import type { Evidence, MapData } from './types/types';
import './App.css';

function MapEditorPage() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [baseImage, setBaseImage] = useState<string>('');
  const [edgesImage, setEdgesImage] = useState<string>('');

  const handleUploadComplete = (data: any) => {
    setMapData(data.map);
    setEvidence(data.evidence);
    setBaseImage(data.baseImage);

    if (data.edgesImage) {
      setEdgesImage(data.edgesImage);
      console.log('LIDAR edge detection available');
    } else {
      setEdgesImage('');
    }
  };

  const handleReset = () => {
    setMapData(null);
    setEvidence([]);
    setBaseImage('');
    setEdgesImage('');
  };

  return (
    <>
      {!mapData ? (
        <FileUpload onUploadComplete={handleUploadComplete} />
      ) : (
        <MapEditor
          baseImage={baseImage}
          edgesImage={edgesImage}
          mapData={mapData}
          evidence={evidence}
          onEvidenceUpdate={setEvidence}
          onReset={handleReset}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<MapEditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;