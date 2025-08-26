# Desktop Todo

A beautiful, modern desktop todo application built with Electron. Features daily habit tracking with streaks, backup functionality, and a clean glassmorphism UI.

## ✨ Features

- **Dual Todo Types**: Regular todos and daily habits with streak tracking
- **Rich Todo Management**: Inline editing, expandable notes, and completion states
- **Streak Tracking**: Visual streak indicators (🔥3) for daily habit consistency
- **Data Backup**: Export, import, and quick backup functionality
- **Modern UI**: Glassmorphism design with smooth animations
- **Auto-launch**: Optional system startup integration
- **Data Persistence**: Your todos survive app updates and reinstalls

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

### Regular Todos
- Add tasks that persist until manually completed or deleted
- Double-click to edit inline
- Click 📄/📝 icon to add/view notes

### Daily Todos  
- Reset each day but maintain completion history
- Build streaks by completing daily habits consistently
- Visual 🔥 badges show current streak count

### Backup & Export
- **💾 Export**: Save todos to a file anywhere
- **📂 Import**: Restore from backup file  
- **🔄 Quick Backup**: Instant backup to home folder

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