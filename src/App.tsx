import React from 'react';
import { Music, VolumeX } from 'lucide-react';
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

  // Detect if user is on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const [showIOSWarning, setShowIOSWarning] = React.useState(false);

  // Check for iOS mute switch issue
  React.useEffect(() => {
    if (isIOS && audioEngine.isReady()) {
      // Test if audio can play by attempting a very quiet test
      const testAudio = () => {
        try {
          const ctx = audioEngine.getAudioContext();
          if (ctx && ctx.state === 'running') {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.frequency.value = 440;
            gainNode.gain.value = 0.001; // Very quiet
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.01);
            
            // If we get here without error, audio should work
            // But iOS mute switch can still block it
            setTimeout(() => {
              if (audioEngine.isReady() && ctx.state === 'running') {
                setShowIOSWarning(true);
              }
            }, 1000);
          }
        } catch (error) {
          console.log('Audio test failed:', error);
        }
      };
      
      // Delay the test to allow user interaction
      const timer = setTimeout(testAudio, 2000);
      return () => clearTimeout(timer);
    }
  }, [isIOS]);

  // Initialize audio on user interaction - CRITICAL for iOS Safari
  const handleUserInteraction = () => {
    if (!audioEngine.isReady()) {
      console.log('User interaction detected, initializing audio...');
      const initialized = audioEngine.initializeSync();
      console.log('Audio initialized:', initialized, 'State:', audioEngine.getAudioContextState());
      
      // Play a test beep to verify audio is working (optional)
      if (initialized) {
        setTimeout(() => {
          console.log('Playing test beep...');
          audioEngine.testBeep();
        }, 100);
      }
    } else if (audioEngine.getAudioContextState() === 'suspended') {
      // Try to recover if suspended
      console.log('Audio context suspended, attempting recovery...');
      audioEngine.recoverAudioContext();
    }
  };

  // Add effect to handle audio recovery on app focus
  React.useEffect(() => {
    const handleFocus = () => {
      if (audioEngine.isInitialized && !audioEngine.isReady()) {
        console.log('App focused and audio needs recovery');
        audioEngine.recoverAudioContext();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div 
      className="min-h-screen bg-gray-900" 
      onClick={handleUserInteraction} 
      onTouchStart={handleUserInteraction}
      onTouchEnd={handleUserInteraction}
    >
      <div className="h-screen max-w-4xl mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="text-center flex-shrink-0 p-3 pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Music className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Audio Sequencer</h1>
          </div>
          
          {/* Audio Status Indicator for debugging */}
          <div className="text-xs text-gray-500 mt-1">
            Audio: {audioEngine.isReady() ? '✓ Ready' : '⚠ Tap to initialize'} 
            {audioEngine.isReady() && ` (${audioEngine.getAudioContextState()})`}
          </div>
        </div>

        {/* iOS Mute Switch Warning */}
        {isIOS && showIOSWarning && (
          <div className="flex-shrink-0 px-4 pb-3">
            <div className="bg-orange-600 border border-orange-500 rounded-lg p-3 flex items-start gap-3">
              <VolumeX className="w-5 h-5 text-orange-100 flex-shrink-0 mt-0.5" />
              <div className="text-orange-100 text-sm">
                <p className="font-medium mb-1">iPhone Audio Tip:</p>
                <p>If you can't hear sounds, check that your iPhone's Ring/Silent switch (on the left side) is set to Ring mode. iOS Safari requires this for web audio to work.</p>
                <button 
                  onClick={() => setShowIOSWarning(false)}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

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