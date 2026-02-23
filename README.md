# Neovim Dynamic UI elements colors

Adjust cursor and status bar colors dynamically based on Neovim mode (normal, insert, visual, command, replace). Requires the [VSCode Neovim](https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim) extension.

## Features

- **Mode-aware colors**: Cursor and status bar change color when switching between Neovim modes
- **Customizable**: Configure colors per mode in settings
- **Smooth transitions**: Debounced updates for visual mode to avoid flicker

## Requirements

- [VSCode Neovim](https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim) extension

## Configuration

Open Settings and search for "Neovim Color Modes" or edit `settings.json`:

```json
{
  "nvim-ui-modes.colorCustomizations": {
    "normal": {
      "editorCursor.foreground": "#abb2bf",
      "statusBar.background": "#3e4451",
      "statusBar.foreground": "#abb2bf"
    },
    "insert": {
      "editorCursor.foreground": "#50fa7b",
      "statusBar.background": "#1f4b2f",
      "statusBar.foreground": "#50fa7b"
    },
    "visual": {
      "editorCursor.foreground": "#8be9fd",
      "statusBar.background": "#1f4b5c",
      "statusBar.foreground": "#8be9fd"
    },
    "command": {
      "editorCursor.foreground": "#f1fa8c",
      "statusBar.background": "#4b4b1f",
      "statusBar.foreground": "#f1fa8c"
    },
    "replace": {
      "editorCursor.foreground": "#ff79c6",
      "statusBar.background": "#4b2f4b",
      "statusBar.foreground": "#ff79c6"
    }
  }
}
```

### Supported keys per mode

- `editorCursor.foreground`
- `editorCursor.background`
- `statusBar.background`
- `statusBar.foreground`

## License

MIT
