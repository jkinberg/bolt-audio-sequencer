import { useState, useEffect, useCallback, useRef } from 'react';
import { SequencerState, Step, SoundType } from '../types';
import { audioEngine } from '../utils/audioEngine';

export const useSequencer = () => {
  const [sequencerState, setSequencerState] = useState<SequencerState>({
    isPlaying: false,
    currentStep: 0,
    tempo: 64, // BPM
    steps: Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      sound: null,
      isActive: false,
    })),
  });

  const [selectedSound, setSelectedSound] = useState<SoundType>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playStep = useCallback((step: Step) => {
    if (step.sound) {
      audioEngine.playSound(step.sound);
    }
  }, []);

  const nextStep = useCallback(() => {
    setSequencerState(prev => {
      const nextStepIndex = (prev.currentStep + 1) % 16;
      const currentStep = prev.steps[nextStepIndex];
      
      // Play sound for the current step
      playStep(currentStep);
      
      return {
        ...prev,
        currentStep: nextStepIndex,
      };
    });
  }, [playStep]);

  const startSequencer = useCallback(() => {
    if (intervalRef.current) return;
    
    // Initialize audio engine and wait for it to be ready
    audioEngine.initialize().then(() => {
      console.log('Audio engine initialized for playback');
    }).catch(error => {
      console.error('Failed to initialize audio engine:', error);
    });
    
    setSequencerState(prev => ({ ...prev, isPlaying: true }));
    
    // Convert BPM to milliseconds per step (16th notes)
    const msPerStep = 60000 / (sequencerState.tempo * 4);
    
    intervalRef.current = setInterval(() => {
      nextStep();
    }, msPerStep);
  }, [nextStep, sequencerState.tempo]);

  const stopSequencer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setSequencerState(prev => ({
      ...prev,
      isPlaying: false,
      currentStep: 0,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (sequencerState.isPlaying) {
      stopSequencer();
    } else {
      startSequencer();
    }
  }, [sequencerState.isPlaying, startSequencer, stopSequencer]);

  const updateTempo = useCallback((newTempo: number) => {
    setSequencerState(prev => ({ ...prev, tempo: newTempo }));
    
    // Restart the sequencer with new tempo if playing
    if (sequencerState.isPlaying && intervalRef.current) {
      clearInterval(intervalRef.current);
      const msPerStep = 60000 / (newTempo * 4);
      intervalRef.current = setInterval(() => {
        nextStep();
      }, msPerStep);
    }
  }, [sequencerState.isPlaying, nextStep]);

  const assignSoundToStep = useCallback((stepId: number) => {
    if (!selectedSound) return;
    
    setSequencerState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { 
          ...step, 
          sound: selectedSound === 'delete' 
            ? null 
            : step.sound === selectedSound 
              ? null 
              : selectedSound 
        } : step
      ),
    }));
  }, [selectedSound]);

  const previewSound = useCallback((sound: SoundType) => {
    if (sound) {
      audioEngine.initialize().then(() => {
        audioEngine.playSound(sound);
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    sequencerState,
    selectedSound,
    setSelectedSound,
    togglePlayPause,
    updateTempo,
    assignSoundToStep,
    previewSound,
  };
};