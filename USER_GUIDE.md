# User Guide - PATH# Path-Specific Node Editing System

## 🚀 Quick Start

### 1. Start the Application
```bash
npm run dev
```

Wait for the output:
```
[Server] ✅ Running at http://localhost:3000
```

### 2. Open in Browser
```
http://localhost:3000
```

You'll see the plugin selection screen.

---

## 📋 How to Use

### Step 1: Select Hub View
Click on **"PATH Hub"** in the plugin list.

**What you see**:
- Title: "PATH# Hub"
- Subtitle: "Your path to clarity"
- Recent Paths section (empty if first time)
- System Status showing paths and nodes

### Step 2: Create Your First Path
Click the **"+ Create Path"** button.

**A dialog appears**:
- **Path title** (required): e.g., "My First Project"
- **Path description** (required): e.g., "Learning the system"

Click **"Create"** to save.

**Result**: 
- Path appears in "Recent Paths" list
- Shows title, description, and "0 nodes"
- Shows creation date

### Step 3: Open a Path
Click on any **path card** in the Recent Paths list.

**You're now in Node Editor View**:
- **Header**: Shows path title (e.g., "My First Project")
- **Top buttons**: 
  - "← Back to Hub" (return to path list)
  - "+ Add Node" (create new node)
- **Main area**: List of nodes for this path
- **Empty state**: "No nodes yet" if path has no nodes

### Step 4: Add Your First Node
Click the **"+ Add Node"** button.

**A dialog appears**:
- **Node title** (required): e.g., "Setup Environment"
- **Node description** (optional): e.g., "Install dependencies"

Click **"Create"** to save.

**Result**:
- Page reloads automatically
- New node appears in the node list
- Shows title, description, and creation date
- Node count in header updates

### Step 5: Add More Nodes
Repeat Step 4 to add more nodes to your path.

**You can now**:
- See all nodes in a grid layout
- Each node shows title, description, and date
- Hover over nodes for visual feedback

### Step 6: Return to Hub
Click the **"← Back to Hub"** button at the top.

**You're back in Hub View**:
- Recent paths list is updated
- Your path now shows the correct node count
- Last opened time is updated (shows current time)

### Step 7: Verify Persistence
**Restart the application**:
```bash
# Stop with Ctrl+C
# Then restart:
npm run dev
```

Open http://localhost:3000 again.

**You'll find**:
- ✅ All your paths are still there
- ✅ All your nodes are preserved
- ✅ Node counts are correct
- ✅ Recent paths sorted by last opened time

---

## 📊 Understanding the UI

### Hub View Layout
```
┌─────────────────────────────────────┐
│  ✓ Back button                      │
│  Sidebar: PATH# navigation          │
├─────────────────────────────────────┤
│  PATH# Hub                          │
│  Your path to clarity               │
│                                     │
│  📊 System Status                   │
│  • Paths: 3                         │
│  • Nodes: 12                        │
│                                     │
│  ⏱️ Recent Paths                   │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ My Project  │  │ Work Nodes  │  │
│  │ Learning... │  │ Plan the   │  │
│  │ 5 nodes     │  │ 8 nodes    │  │
│  │ 2 days ago  │  │ 1 day ago  │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  [+ Create Path]                    │
└─────────────────────────────────────┘
```

### Node Editor View Layout
```
┌──────────────────────────────────────┐
│  Sidebar: PATH#                      │
│  Navigation → Nodes (highlighted)    │
├──────────────────────────────────────┤
│  CURRENT PATH                        │
│  My First Project                    │
│  [← Back to Hub]  [+ Add Node]       │
├──────────────────────────────────────┤
│  Nodes                      3 nodes  │
│                                      │
│  ┌──────────────┐  ┌───────────────┐│
│  │ Setup Tools  │  │ Configure App ││
│  │ Install and  │  │ Set up config ││
│  │ configure... │  │ files...      ││
│  │ Jan 29       │  │ Jan 29        ││
│  └──────────────┘  └───────────────┘│
│                                      │
│  ┌──────────────┐                   │
│  │ Run Tests    │                   │
│  │ Execute test │                   │
│  │ suite...     │                   │
│  │ Jan 29       │                   │
│  └──────────────┘                   │
└──────────────────────────────────────┘
```

### Error View Layout
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          ⚠️ Warning            │
│   No Path Selected             │
│                                 │
│   Please select a path first   │
│   to manage nodes.             │
│                                 │
│  [← Back to Hub]               │
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 Visual Design

### Color Scheme
| Element | Color | Usage |
|---------|-------|-------|
| Background | #0d0d0d | Main area |
| Sidebar | #141414 | Navigation |
| Panels | #1a1a1a | Content areas |
| Accent | #4a9eff | Buttons, links |
| Text | #e5e5e5 | Main text |
| Muted | #8c8c8c | Secondary text |
| Border | #252525 | Card borders |

### Interactive Elements

**Buttons**:
- Blue background (#4a9eff)
- Hover: Darker blue (#3b7ec9)
- Rounded corners (10px)
- Smooth transitions (0.15s)

**Cards**:
- Dark background (#1a1a1a)
- Subtle border (#252525)
- Hover: Lighter border, darker bg
- Rounded corners (10px)

**Modals**:
- Dark semi-transparent backdrop
- Centered dialog with backdrop blur
- Keyboard support (Escape to close)

---

## 💾 What Gets Saved

### When You Create a Path
```json
File: DEMOCOMPONENTS/paths/{pathId}.json
{
  "id": "1769713203202",
  "title": "My First Path",
  "description": "Learning the system",
  "createdAt": "2026-01-29T15:00:00Z",
  "lastOpened": "2026-01-29T15:05:00Z",
  "nodes": []
}
```

### When You Add a Node
```json
File: DEMOCOMPONENTS/paths/{pathId}.json (updated)
{
  "id": "1769713203202",
  "title": "My First Path",
  "description": "Learning the system",
  "createdAt": "2026-01-29T15:00:00Z",
  "lastOpened": "2026-01-29T15:05:00Z",
  "nodes": [
    {
      "id": "node-1",
      "title": "Setup Environment",
      "description": "Install dependencies",
      "createdAt": "2026-01-29T15:05:30Z"
    }
  ]
}
```

### When You Open a Path Again
```
lastOpened timestamp updates to current time
File saved immediately
Recent paths re-sorted by lastOpened
```

---

## ⌨️ Keyboard Shortcuts

| Action | Keyboard |
|--------|----------|
| Close modal | Escape |
| Create path | Ctrl+N (if implemented) |
| Add node | Ctrl+Alt+N (if implemented) |
| Search | Ctrl+F (browser default) |

---

## ✅ Checklist for First Time Use

- [ ] Start application with `npm run dev`
- [ ] Open http://localhost:3000 in browser
- [ ] Select "PATH Hub" from plugin list
- [ ] Click "Create Path" button
- [ ] Enter path title and description
- [ ] Click "Create"
- [ ] Click on your new path
- [ ] See "No nodes yet" message
- [ ] Click "+ Add Node"
- [ ] Enter node title
- [ ] (Optional) Enter node description
- [ ] Click "Create"
- [ ] See page reload with new node
- [ ] Click "Back to Hub"
- [ ] Verify path shows "1 nodes"
- [ ] Verify recent time shows current
- [ ] Stop application (Ctrl+C)
- [ ] Restart with `npm run dev`
- [ ] Open HubUI again
- [ ] Verify path and nodes still there ✅

---

## 🐛 Troubleshooting

### Issue: "No Path Selected" error when clicking path
**Solution**: This shouldn't happen in normal use. Try:
1. Go back to Hub
2. Click the path again
3. If still failing, restart the app

### Issue: Page doesn't reload after creating node
**Solution**: This is the normal behavior - the page should reload. If not:
1. Refresh manually (F5)
2. Check browser console (F12) for errors
3. Check server logs

### Issue: Path doesn't appear in Recent list
**Solution**: Try:
1. Go back to Hub
2. Look for "No paths" empty state
3. Click "Create Path" to verify it works
4. Restart app to reload from disk

### Issue: Node count shows wrong number
**Solution**: Try:
1. Go back to Hub (updates node count)
2. Click path again
3. Restart app (reloads from disk)

### Issue: Server won't start
**Solution**: 
1. Verify Node.js is installed: `node --version`
2. Check port 3000 isn't in use: `netstat -ano | findstr :3000`
3. Clear node_modules: `rm -r node_modules && npm install`
4. Rebuild: `npm run build`

---

## 📝 Tips & Best Practices

### Naming Paths
- Use clear, descriptive titles
- Examples: "Q1 Goals", "Website Redesign", "Bug Fixes"
- Avoid single words like "Work" or "Ideas"

### Naming Nodes
- Use action-oriented titles
- Examples: "Setup Database", "Deploy API", "Test UI"
- First word often a verb (Setup, Configure, Create, Test)

### Organizing Information
- Keep descriptions brief (1-2 sentences)
- One main topic per path
- Related nodes in same path

### Recent Paths
- Most recently opened paths appear first
- Useful for quick access to active work
- Dates show when last accessed

---

## 🎯 Common Tasks

### Task: Create a New Project
1. Hub → Create Path
2. Title: "Project Name"
3. Description: "What is this project"
4. Click Create
5. Opens in Node Editor
6. Add nodes for each task

### Task: Add Steps to a Path
1. Open path in Node Editor
2. Click "+ Add Node"
3. Enter step title
4. Add description (optional)
5. Click Create
6. Repeat for more steps

### Task: View All Your Paths
1. Click "Back to Hub"
2. See Recent Paths section
3. All paths sorted by last opened

### Task: Check System Status
1. Go to Hub
2. Look at System Status block
3. Shows total paths and nodes

---

## 🔄 Data Backup

### Where Files Are Stored
```
DEMOCOMPONENTS/paths/
```

### How to Backup
1. Copy the `DEMOCOMPONENTS` folder
2. Save to external drive or cloud

### How to Restore
1. Stop the application
2. Replace `DEMOCOMPONENTS` folder
3. Restart application

---

## 📱 Browser Compatibility

**Tested and working**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

**Requirements**:
- Modern browser with ES6 support
- JavaScript enabled
- Local storage available

---

## 💡 FAQ

**Q: Can I edit path title or description?**
A: Not yet in this version. Feature planned for Phase 2.

**Q: Can I delete paths or nodes?**
A: You can delete paths in HubUI. Node deletion planned for Phase 2.

**Q: Can I move nodes between paths?**
A: Not yet. Planned enhancement.

**Q: Can I export my paths?**
A: Paths are stored as JSON in DEMOCOMPONENTS/paths/. You can copy them manually.

**Q: How many paths can I create?**
A: Technically unlimited. Performance may vary with very large numbers (100+).

**Q: Are paths shared across browsers?**
A: No, paths are stored on the server. Only accessible from the same computer.

**Q: What happens if I delete the DEMOCOMPONENTS folder?**
A: All paths and nodes will be lost. It will recreate on next path creation.

---

## 🎓 Learning Path

**Beginner**:
1. Create first path
2. Add a few nodes
3. Try back button
4. Restart app to verify persistence

**Intermediate**:
1. Create multiple paths
2. Track node counts
3. Monitor recent paths sorting
4. Experiment with descriptions

**Advanced**:
1. Organize complex project
2. Use paths for different purposes
3. Monitor system status
4. Explore disk files (advanced)

---

## 🚀 Next Features (Coming Soon)

- Edit existing path details
- Delete individual nodes
- Search paths and nodes
- Tag and categorize paths
- Node completion tracking
- Export as markdown/PDF

---

## ⚙️ Settings & Personalization

### Accessing Settings
1. Click **Settings** icon in the left sidebar
2. Or click your profile/settings button in the top bar

### Available Settings

#### Theme Selection
Switch between **Dark** and **Light** themes:
- **Dark Theme** (default): Black background, white text, blue accents
- **Light Theme** (NEW!): Modern off-white background, dark text, soft shadows

**How to change**:
1. Open Settings tab
2. Find **General** section
3. Select **Theme** dropdown
4. Choose "light" or "dark"
5. Theme applies instantly (no page reload needed)

**Light Theme Features**:
- Professional off-white background (#F7F7F9, not pure white)
- Soft text colors (#111827, not pure black)
- Gentle shadows for depth (not hard borders)
- Logo automatically turns dark
- Same animations and layout as dark theme

See [LIGHT_THEME_GUIDE.md](./LIGHT_THEME_GUIDE.md) for technical details.

#### Display Options
- **Grid Display**: Show paths as cards (grid) vs list
- **Highlight Active Nodes**: Emphasize currently selected node
- **Autosave Nodes**: Save changes immediately
- **Quick Chain Mode**: Fast node creation mode

#### Achievements
- **Show Notifications**: Display popup when you earn achievements
- **Display Difficulty**: Show difficulty rating (1-10) on achievement cards

#### Developer Options
- **Engine Logs**: Enable verbose logging in console
- **UI Debug Mode**: Show debug information in UI

### Resetting Settings
Click **"Reset All Settings"** button in Settings tab to restore defaults.

---

## 📞 Need Help?

1. Check the troubleshooting section
2. Review the system architecture guide
3. Check server logs (terminal output)
4. Check browser console (F12)

---

## ✨ You're Ready!

Your path-specific node editor is set up and ready to use.

**Start with**:
1. `npm run dev`
2. Open http://localhost:3000
3. Create your first path
4. Add your first nodes
5. Explore the system

**Enjoy organizing your work! 🎉**
