# 16-Step Audio Sequencer

A modern, web-based drum machine and audio sequencer built with React, TypeScript, and the Web Audio API. Create beats and rhythms with a classic 16-step sequencer interface.

![Audio Sequencer](https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🎵 Features

- **16-Step Grid**: Classic drum machine interface with 16 programmable steps
- **6 Built-in Sounds**: Kick, Snare, Hi-Hat, Cymbal, Hand Clap, and Cow Bell
- **Real-time Playback**: Watch steps light up as the sequence plays
- **Tempo Control**: Adjustable BPM from 30 to 200 with fine controls
- **Sound Preview**: Click any sound button to preview it instantly
- **Pattern Sharing**: Share your beats via URL with tempo and pattern encoded
- **URL Parameters**: Load patterns directly from shareable links
- **Mobile Optimized**: Touch-friendly interface that works great on phones and tablets
- **iOS Safari Support**: Handles iOS audio context limitations and background recovery
- **Responsive Design**: Adapts to different screen sizes seamlessly

## 🚀 Live Demo

Visit the live application: [https://audio-sequencer-8ygz.bolt.host](https://audio-sequencer-8ygz.bolt.host)

## 🎮 How to Use

1. **Select a Sound**: Click on any sound button (Kick, Snare, Hi-Hat, etc.) to select it
2. **Program Steps**: Click on any of the 16 grid squares to assign the selected sound to that step
3. **Preview Sounds**: Click sound buttons to hear what they sound like
4. **Remove Sounds**: Select the "Delete" button, then click on steps to remove sounds
5. **Adjust Tempo**: Use the slider or +/- buttons to change the playback speed
6. **Play Your Beat**: Hit the play button to start the sequence and watch it come to life!
7. **Share Your Pattern**: Click "Share Pattern" to get a URL you can copy and share with others

## 🔗 URL Sharing

The app supports URL parameters for sharing patterns:

### Query Parameters
- **`t`**: Tempo in BPM (30-200)
- **`p`**: 16-character pattern string where each digit represents a step:
  - `0` = No sound
  - `1` = Kick
  - `2` = Snare
  - `3` = Hi-Hat
  - `4` = Cymbal
  - `5` = Hand Clap
  - `6` = Cow Bell

### Example URLs
```
# Basic kick-snare pattern at 120 BPM
https://audio-sequencer-8ygz.bolt.host/?t=120&p=1000200010002000

# Complex pattern at 140 BPM
https://audio-sequencer-8ygz.bolt.host/?t=140&p=1020304050601234
```

### How to Share
1. Create your pattern in the sequencer
2. Click the "Share Pattern" button below the grid
3. Copy the generated URL
4. Share with friends - they'll see your exact pattern and tempo!
## 📱 Mobile Support

### iOS Safari Notes
- **Audio Initialization**: Tap anywhere on the screen to initialize audio
- **Mute Switch**: On iPhone, ensure the Ring/Silent switch is set to Ring mode for audio to work
- **Background Recovery**: Audio automatically recovers when returning from background apps

### Touch Optimization
- Large, touch-friendly buttons
- Horizontal scrolling for sound selection on small screens
- Optimized layout that fits most mobile screens without scrolling

## 🛠️ Technical Details

### Built With
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Web Audio API** - Real-time audio synthesis
- **Vite** - Fast development and building
- **Lucide React** - Beautiful icons

### Audio Engine
- Custom Web Audio API implementation
- Synthesized drum sounds (no samples required)
- iOS Safari compatibility with automatic context recovery
- Background/foreground audio state management

### Browser Compatibility
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)

## 🏗️ Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd audio-sequencer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run test         # Run Playwright tests
npm run test:mobile  # Run mobile-specific tests
```

### Testing

The application includes comprehensive Playwright tests covering:
- Audio engine functionality
- Mobile Safari compatibility
- Touch interactions
- Responsive design
- Audio context recovery

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run mobile-specific tests
npm run test:mobile
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ControlStrip.tsx    # Play controls and sound selection
│   ├── SequencerGrid.tsx   # 16-step grid interface
│   └── ShareButton.tsx     # URL sharing functionality
├── hooks/
│   └── useSequencer.ts     # Main sequencer logic
├── utils/
│   └── audioEngine.ts      # Web Audio API wrapper
│   └── urlUtils.ts         # URL encoding/decoding utilities
├── types.ts                # TypeScript definitions
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## 🎨 Design Philosophy

- **Minimal & Clean**: Focus on the music-making experience
- **Touch-First**: Designed primarily for mobile interaction
- **Accessible**: High contrast colors and clear visual feedback
- **Performance**: Optimized for smooth real-time audio playback

## 🔧 Configuration

### Audio Settings
- Sample Rate: Uses device default (typically 44.1kHz)
- Buffer Size: Optimized for low latency
- Master Volume: Set to 70% to prevent clipping

### Tempo Range
- Minimum: 30 BPM
- Maximum: 200 BPM
- Default: 64 BPM

## 🐛 Known Issues

- **iOS Mute Switch**: Audio requires Ring mode on iPhone (system limitation)
- **Background Audio**: May pause when browser is backgrounded (auto-recovers)
- **Audio Latency**: Slight delay possible on older devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Web Audio API documentation and community
- React and TypeScript communities
- Tailwind CSS for excellent utility classes
- Lucide React for beautiful icons

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Ensure your browser supports Web Audio API
3. On iOS, verify the mute switch is in Ring mode
4. Try refreshing the page to reinitialize audio

---

**Version**: 1.0.0  
**Last Updated**: 2025

Made with ❤️ and Web Audio API