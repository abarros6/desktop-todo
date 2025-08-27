# Desktop Todo

A beautiful, modern desktop todo application built with Electron. Features daily habit tracking with streaks, priority levels, due dates, Pomodoro timer, and a clean glassmorphism UI.

## ✨ Features

### 📋 **Smart Todo Management**
- **Three Tab System**: Regular, Daily, and Focus tabs for organized productivity
- **Priority Levels**: High (red), Medium (yellow), Low (green) with color-coded borders
- **Due Dates**: Visual indicators for overdue, due today, and upcoming deadlines
- **Rich Editing**: Inline editing, expandable notes, and completion states
- **Movable & Resizable**: Drag header to move window, resize from edges

### 🔥 **Daily Habit Tracking** 
- **Streak System**: Visual streak indicators (🔥3) for daily habit consistency
- **Auto-Reset**: Daily todos reset each day but maintain completion history
- **Habit Building**: Perfect for building consistent daily routines

### 🍅 **Focus & Productivity**
- **Pomodoro Timer**: 25-minute work sessions with 5-minute breaks
- **Customizable Durations**: Adjust work and break periods to your preference
- **Audio Alerts**: Notifications when work/break sessions complete
- **Centered Design**: Clean, distraction-free timer interface

### 💾 **Data Management**
- **Dropdown Menu**: Clean ⋯ menu with Export, Import, Backup, and Help
- **Export/Import**: Save and restore your todos from any location
- **Quick Backup**: Instant backup to home directory
- **Help System**: Built-in guide explaining all features and icons

### 🎨 **Modern Interface**
- **Glassmorphism Design**: Beautiful blur effects and gradients
- **Responsive Layout**: Fits any window size without content overflow
- **Smooth Animations**: Polished transitions and hover effects
- **Launch at Startup**: Convenient toggle in bottom status bar

## 🚀 Installation

### Download Release
1. Download the latest `.dmg` file from [Releases](../../releases)
2. Open the DMG and drag "Desktop Todo" to Applications
3. Launch from Applications or Spotlight

### Build from Source
```bash
# Clone the repository
git clone https://github.com/yourusername/desktop-todo.git
cd desktop-todo

# Install dependencies
npm install

# Run in development
npm start

# Build for production
npm run build-mac    # macOS
npm run build-win    # Windows
npm run build-linux  # Linux
```

## 🎯 Usage

### Getting Started
1. **Window Controls**: Drag the header area to move the window, resize from edges/corners
2. **Menu Access**: Click the ⋯ button in the top-right for Export, Import, Backup, and Help
3. **Help Guide**: Click ❓ Help for detailed instructions on all features

### Regular Todos Tab
- **Add Todos**: Type task, select priority level, set due date (optional)
- **Priority Levels**: Choose High/Medium/Low for color-coded organization
- **Due Dates**: Set deadlines with visual indicators (overdue=red, today=yellow, soon=blue)
- **Edit**: Double-click text to edit inline
- **Notes**: Click 📄/📝 to expand and add detailed notes

### Daily Todos Tab  
- **Habit Tracking**: Add daily routines that reset each day
- **Build Streaks**: Complete daily habits consistently to build streaks
- **Visual Feedback**: 🔥 badges show current streak count
- **History**: Completion history maintained even after daily reset

### Focus Tab
- **Pomodoro Timer**: Click Start for focused 25-minute work sessions
- **Break Reminders**: Automatic 5-minute break alerts between sessions
- **Customization**: Adjust work and break durations in settings
- **Audio Alerts**: Notifications when sessions complete

### Menu Functions
- **❓ Help**: Complete guide to all features and icons
- **💾 Export**: Save all todos to a file anywhere you choose
- **📂 Import**: Restore todos from a backup file
- **🔄 Backup**: Quick backup to your home directory

## 🛠️ Development

### Tech Stack
- **Electron** - Desktop app framework
- **Vanilla JS** - No heavy frameworks, pure performance
- **CSS3** - Modern glassmorphism styling
- **auto-launch** - System startup integration

### Project Structure
```
├── main.js          # Electron main process
├── preload.js       # Context bridge security layer
├── renderer.js      # Frontend logic and UI interactions
├── index.html       # App structure
├── styles.css       # Modern UI styling
└── package.json     # Dependencies and build config
```

### Data Storage
- Regular todos: `~/.desktop-todos.json`
- Daily todos + streaks: `~/.desktop-daily-todos.json` 
- Backups: `~/.desktop-todo-backup-[timestamp].json`

## 🎨 Screenshots

*Beautiful glassmorphism interface with gradient backgrounds*

*Streak tracking for daily habits*

*Clean backup and export functionality*

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

Found a bug or have a feature request? [Open an issue](../../issues)

---

Built with ❤️ using Electron