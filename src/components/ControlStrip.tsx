import React from 'react';
import { Play, Pause, Trash2 } from 'lucide-react';
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
  const bpm = Math.round(60000 / (tempo * 4)); // Convert to BPM (assuming 16th notes)

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center gap-6">
        {/* Transport Controls */}
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-4 min-w-64">
          <label className="text-white font-medium">Tempo</label>
          <div className="flex-1">
            <input
              type="range"
              min="50"
              max="1000"
              value={tempo}
              onChange={(e) => onTempoChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <span className="text-white text-sm font-mono w-16 text-right">
            {bpm} BPM
          </span>
        </div>

        {/* Sound Selection */}
        <div className="flex items-center gap-3">
          <label className="text-white font-medium">Sounds:</label>
          <div className="flex gap-2">
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
                  onSoundSelect(type);
                  onSoundPreview(type);
                }}
                className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 ${color} ${
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
              className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 flex items-center gap-2 ${
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
  );
};

export default ControlStrip;