import React from 'react';
import { Play, Pause, Trash2, Minus, Plus } from 'lucide-react';
import { SoundType } from '../types';
import { audioEngine } from '../utils/audioEngine';

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
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg" data-testid="control-strip">
      <div className="flex flex-col gap-4">
        {/* Transport Controls */}
        <div className="flex items-center gap-3 sm:gap-6">
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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-white font-medium flex-shrink-0 font-mono text-sm">
              {bpm} BPM
            </label>
            <button
              onClick={() => onTempoChange(Math.max(30, tempo - 1))}
              className="flex items-center justify-center w-7 h-7 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors duration-200 flex-shrink-0"
              aria-label="Decrease tempo"
              title="Decrease tempo by 1"
            >
              <Minus className="w-3 h-3" />
            </button>
            <div className="w-32 flex-shrink-0">
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
              className="flex items-center justify-center w-7 h-7 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors duration-200 flex-shrink-0"
              aria-label="Increase tempo"
              title="Increase tempo by 1"
            >
              <Plus className="w-3 h-3" />
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button clicked:', type);
                  
                  // Check if audio context needs recovery first
                  if (audioEngine.getAudioContextState() === 'suspended') {
                    console.log('Audio context suspended, recovering...');
                    audioEngine.recoverAudioContext();
                  }
                  
                  // Initialize audio synchronously - CRITICAL for iOS Safari
                  const initialized = audioEngine.initializeSync();
                  console.log('Audio initialized:', initialized, 'State:', audioEngine.getAudioContextState());
                  
                  onSoundSelect(type);
                  
                  // Small delay to ensure audio context is ready
                  setTimeout(() => {
                    onSoundPreview(type);
                  }, 50);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  // Initialize audio on touch start for iOS Safari
                  if (audioEngine.getAudioContextState() === 'suspended') {
                    audioEngine.recoverAudioContext();
                  }
                  const initialized = audioEngine.initializeSync();
                  console.log('Touch - Audio initialized:', initialized, 'State:', audioEngine.getAudioContextState());
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Delete button clicked');
                onSoundSelect('delete');
              }}
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