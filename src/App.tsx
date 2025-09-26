import React from 'react';
import { Music } from 'lucide-react';
import ControlStrip from './components/ControlStrip';
import SequencerGrid from './components/SequencerGrid';
import { useSequencer } from './hooks/useSequencer';

function App() {
  const {
    sequencerState,
    selectedSound,
    setSelectedSound,
    togglePlayPause,
    updateTempo,
    assignSoundToStep,
    previewSound,
  } = useSequencer();

  return (
    <div className="h-screen bg-gray-900 p-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col space-y-4">
        {/* Header */}
        <div className="text-center flex-shrink-0">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Music className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Audio Sequencer</h1>
          </div>
          <p className="text-gray-400">Create beats with our professional 16-step drum sequencer</p>
        </div>

        {/* Control Strip */}
        <div className="flex-shrink-0">
          <ControlStrip
            isPlaying={sequencerState.isPlaying}
            tempo={sequencerState.tempo}
            selectedSound={selectedSound}
            onPlayPause={togglePlayPause}
            onTempoChange={updateTempo}
            onSoundSelect={setSelectedSound}
            onSoundPreview={previewSound}
          />
        </div>

        {/* Sequencer Grid */}
        <div className="flex-1 min-h-0">
          <SequencerGrid
            steps={sequencerState.steps}
            currentStep={sequencerState.currentStep}
            isPlaying={sequencerState.isPlaying}
            selectedSound={selectedSound}
            onStepClick={assignSoundToStep}
          />
        </div>

        {/* Usage Instructions */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex-shrink-0">
          <h3 className="text-white font-semibold mb-3">How to Use:</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li><span className="text-blue-400">1.</span> Select a sound (Kick, Snare, Hi-Hat, or Cymbal) from the control strip</li>
            <li><span className="text-blue-400">2.</span> Click on any step in the 16-step grid to assign that sound</li>
            <li><span className="text-blue-400">3.</span> Double-click sound buttons to preview them</li>
            <li><span className="text-blue-400">4.</span> Adjust the tempo slider to change the playback speed</li>
            <li><span className="text-blue-400">5.</span> Press Play to start the sequence - watch as each step lights up!</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default App;