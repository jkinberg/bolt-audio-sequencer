import React from 'react';
import { Play, Pause, Trash2, Minus, Plus } from 'lucide-react';
import { SoundType } from '../types';

interface ControlStripProps {
  isPlaying: boolean;
  tempo: number;
  selectedSound: SoundType;
  onPlayPause: () => void;
  onTempoChange: (tempo: number) => void;
  onSoundSelect: (sound: SoundType) => void;
  onSoundPreview: (sound: SoundType) => void;
}

const ControlStrip: React.FC<ControlStripProps> = ({
  isPlaying,
  tempo,
  selectedSound,
  onPlayPause,
  onTempoChange,
  onSoundSelect,
  onSoundPreview,
}) => {
  const bpm = tempo; // Tempo is now directly in BPM

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
      <div className="flex flex-col gap-4">
        {/* Transport Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={onPlayPause}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-200"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
          </div>

          {/* Tempo Control */}
          <div className="flex items-center gap-4 w-full sm:min-w-64 sm:w-auto">
            <label className="text-white font-medium flex-shrink-0 font-mono min-w-16 text-center">
              {bpm} BPM
            </label>
            <button
              onClick={() => onTempoChange(Math.max(30, tempo - 1))}
              className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors duration-200 flex-shrink-0"
              aria-label="Decrease tempo"
              title="Decrease tempo by 1"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-32">
              <input
                type="range"
               min="10"
                max="200"
                value={tempo}
                onChange={(e) => onTempoChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <button
              onClick={() => onTempoChange(Math.min(200, tempo + 1))}
              className="flex items-center justify-center w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors duration-200 flex-shrink-0"
              aria-label="Increase tempo"
              title="Increase tempo by 1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sound Selection */}
        <div className="w-full">
          <label className="text-white font-medium mb-3 block">Sounds:</label>
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 touch-scroll">
            <div className="flex gap-2 flex-nowrap">
            {[
              { type: 'kick' as const, label: 'Kick', color: 'bg-red-600 hover:bg-red-700' },
              { type: 'snare' as const, label: 'Snare', color: 'bg-orange-600 hover:bg-orange-700' },
              { type: 'hihat' as const, label: 'Hi-Hat', color: 'bg-yellow-600 hover:bg-yellow-700' },
              { type: 'cymbal' as const, label: 'Cymbal', color: 'bg-green-600 hover:bg-green-700' },
              { type: 'handclap' as const, label: 'Hand Clap', color: 'bg-purple-600 hover:bg-purple-700' },
              { type: 'cowbell' as const, label: 'Cow Bell', color: 'bg-indigo-600 hover:bg-indigo-700' },
            ].map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => {
                  console.log('Button clicked:', type);
                  // Initialize audio on first user interaction for iOS
                  audioEngine.initialize();
                  onSoundSelect(type);
                  onSoundPreview(type);
                }}
                className={`px-3 py-2 rounded-md text-white font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${color} ${
                  selectedSound === type ? 'ring-2 ring-white scale-105' : ''
                }`}
                title={`Click to select and preview ${label}`}
              >
                {label}
              </button>
            ))}
            
            {/* Delete Button */}
            <button
              onClick={() => onSoundSelect('delete')}
              className={`px-3 py-2 rounded-md text-gray-300 font-medium transition-all duration-200 border-2 border-transparent hover:bg-gray-600/30 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                selectedSound === 'delete' ? 'ring-2 ring-white scale-105' : ''
              }`}
              title="Click to select delete mode, then click steps to remove sounds"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlStrip;