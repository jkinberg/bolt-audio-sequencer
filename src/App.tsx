import React from 'react';
import { Music } from 'lucide-react';
import ControlStrip from './components/ControlStrip';
import SequencerGrid from './components/SequencerGrid';
import { useSequencer } from './hooks/useSequencer';
import { audioEngine } from './utils/audioEngine';

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

  // Initialize audio on any user interaction for iOS compatibility
  const handleUserInteraction = () => {
    audioEngine.initialize().catch(console.error);
  };

  return (
    <div className="min-h-screen bg-gray-900" onClick={handleUserInteraction} onTouchStart={handleUserInteraction}>
      <div className="h-screen max-w-4xl mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="text-center flex-shrink-0 p-3 pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Music className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Audio Sequencer</h1>
          </div>
        </div>

        {/* Control Strip */}
        <div className="flex-shrink-0 px-4 pb-3">
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
        <div className="flex-1 min-h-0 px-4">
          <SequencerGrid
            steps={sequencerState.steps}
            currentStep={sequencerState.currentStep}
            isPlaying={sequencerState.isPlaying}
            selectedSound={selectedSound}
            onStepClick={assignSoundToStep}
          />
        </div>
      </div>

      {/* Usage Instructions - Below the fold */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-gray-800 p-6 mx-4 mb-8 rounded-lg shadow-lg">
          <h3 className="text-white font-semibold mb-4 text-lg">How to Use:</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li><span className="text-blue-400 font-bold">1.</span> Select a sound (Kick, Snare, Hi-Hat, Cymbal, Hand Clap, or Cow Bell) from the control strip</li>
            <li><span className="text-blue-400 font-bold">2.</span> Click on any step in the 16-step grid to assign that sound</li>
            <li><span className="text-blue-400 font-bold">3.</span> Click sound buttons to preview them</li>
            <li><span className="text-blue-400 font-bold">4.</span> Use the Delete button to remove sounds from steps</li>
            <li><span className="text-blue-400 font-bold">5.</span> Adjust the tempo slider to change the playback speed</li>
            <li><span className="text-blue-400 font-bold">6.</span> Press Play to start the sequence - watch as each step lights up!</li>
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