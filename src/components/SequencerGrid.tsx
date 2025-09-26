import React from 'react';
import { Step, SoundType } from '../types';

interface SequencerGridProps {
  steps: Step[];
  currentStep: number;
  isPlaying: boolean;
  selectedSound: SoundType;
  onStepClick: (stepId: number) => void;
}

const SequencerGrid: React.FC<SequencerGridProps> = ({
  steps,
  currentStep,
  isPlaying,
  selectedSound,
  onStepClick,
}) => {
  const getSoundColor = (sound: SoundType): string => {
    switch (sound) {
      case 'kick':
        return 'bg-red-500';
      case 'snare':
        return 'bg-orange-500';
      case 'hihat':
        return 'bg-yellow-500';
      case 'cymbal':
        return 'bg-green-500';
      case 'handclap':
        return 'bg-purple-500';
      case 'cowbell':
        return 'bg-indigo-500';
      default:
        return 'bg-white';
    }
  };

  const getSoundLabel = (sound: SoundType): string => {
    switch (sound) {
      case 'kick':
        return 'K';
      case 'snare':
        return 'S';
      case 'hihat':
        return 'H';
      case 'cymbal':
        return 'C';
      case 'handclap':
        return 'HC';
      case 'cowbell':
        return 'CB';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-4 gap-4 w-full">
        {steps.map((step) => {
          const isCurrentStep = isPlaying && currentStep === step.id - 1;
          const soundColor = getSoundColor(step.sound);
          const soundLabel = getSoundLabel(step.sound);

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`
                relative w-full aspect-square rounded-lg border-2 transition-all duration-200 
                ${isCurrentStep ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-gray-400'}
                ${soundColor}
                hover:scale-105 hover:shadow-lg
                ${selectedSound ? 'cursor-pointer' : 'cursor-default'}
                ${isCurrentStep ? 'animate-pulse' : ''}
              `}
              disabled={!selectedSound}
              title={selectedSound ? `Assign ${selectedSound} to step ${step.id}` : `Step ${step.id}`}
            >
              {/* Step number */}
              <span className={`absolute top-1 left-1 text-xs font-bold ${
                step.sound ? 'text-white' : 'text-gray-600'
              }`}>
                {step.id}
              </span>
              
              {/* Sound indicator */}
              {soundLabel && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                  {soundLabel}
                </span>
              )}
              
              {/* Current step highlight */}
              {isCurrentStep && (
                <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-gray-300 text-sm">
        {selectedSound ? (
          <p>
            {selectedSound === 'delete' ? (
              <>Click on any step to <span className="font-bold text-red-400">remove</span> its sound</>
            ) : (
              <>Click on any step to assign <span className="font-bold">{selectedSound}</span> sound</>
            )}
          </p>
        ) : (
          <p>Select a sound from the control strip above to assign to steps</p>
        )}
      </div>
    </div>
  );
};

export default SequencerGrid;