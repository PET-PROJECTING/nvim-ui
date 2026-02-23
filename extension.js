"use strict";
const vscode = require("vscode");

exports.activate = activate;
exports.deactivate = deactivate;
function getConfiguration(section = "", resource = null) {
  return vscode.workspace.getConfiguration(section, resource);
}
const MODE_COLOR_KEYS = [
  "editorCursor.foreground",
  "editorCursor.background",
  "statusBar.background",
  "statusBar.foreground",
];

function getColorCustomization(config) {
  const colorCustomizations = config.get("colorCustomizations") || {};
  return colorCustomizations;
}

function extractModeColors(modeColors) {
  if (!modeColors || typeof modeColors !== "object") return {};
  const out = {};
  for (const key of MODE_COLOR_KEYS) {
    if (modeColors[key] != null) out[key] = modeColors[key];
  }
  return out;
}

const DEBOUNCE_MS = 40;
let debounceTimer = null;

function updateColors(workbenchConfig, modeColors) {
  const colors = extractModeColors(modeColors);
  if (Object.keys(colors).length === 0) return;
  const current = workbenchConfig.get("colorCustomizations") || {};
  const merged = { ...current, ...colors };
  workbenchConfig.update(
    "colorCustomizations",
    merged,
    vscode.ConfigurationTarget.Workspace,
  );
}

function scheduleUpdateColors(workbenchConfig, colorCustomizations, mode) {
  if (mode === "visual") {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = null;
    updateColors(workbenchConfig, colorCustomizations[mode]);
  } else {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      updateColors(workbenchConfig, colorCustomizations[mode]);
    }, DEBOUNCE_MS);
  }
}
const luaCreateConfig = [
  "local vscode = require('vscode')",
  "local function send_mode()",
  "  local mode = vim.api.nvim_get_mode().mode",
  "  local first = mode:sub(1, 1)",
  "  if first == 'i' or mode == '' then",
  "    vscode.call('nvim-ui-modes.insert')",
  "  elseif first == 'c' then",
  "    vscode.call('nvim-ui-modes.command')",
  "  elseif first == 'R' then",
  "    vscode.call('nvim-ui-modes.replace')",
  "  elseif first == 'v' or first == 'V' or first == string.char(22) or first == 's' or first == 'S' or first == string.char(19) then",
  "    vscode.call('nvim-ui-modes.visual')",
  "  elseif first == 'n' then",
  "    vscode.call('nvim-ui-modes.normal')",
  "  end",
  "end",
  "local group = vim.api.nvim_create_augroup('nvim-ui-modes', { clear = true })",
  "send_mode()",
  "vim.api.nvim_create_autocmd({ 'InsertEnter', 'InsertLeave', 'ModeChanged' }, {",
  "  group = group,",
  "  callback = function()",
  "    send_mode()",
  "  end,",
  "})",
];
const luaDeleteConfig = [
  "pcall(vim.api.nvim_clear_autocmds, { group = 'nvim-ui-modes' })",
  "pcall(vim.api.nvim_del_augroup_by_name, 'nvim-ui-modes')",
];
function executeCommand(luaCode) {
  const code = Array.isArray(luaCode) ? luaCode.join("\n") : luaCode;
  vscode.commands.executeCommand("vscode-neovim.lua", code);
}
function activate(context) {
  const activeTextEditor = vscode.window.activeTextEditor;
  const resource = activeTextEditor ? activeTextEditor.document.uri : null;
  const workbenchConfig = getConfiguration("workbench", resource);
  const colorCustomizations = getColorCustomization(
    getConfiguration("nvim-ui-modes", resource),
  );
  const modes = ["normal", "command", "insert", "visual", "replace"];
  modes.forEach((mode) => {
    const disposable = vscode.commands.registerCommand(
      `nvim-ui-modes.${mode}`,
      () => {
        scheduleUpdateColors(workbenchConfig, colorCustomizations, mode);
      },
    );
    context.subscriptions.push(disposable);
  });
  const interval = setInterval(async () => {
    const commands = await vscode.commands.getCommands(true);
    if (commands.includes("vscode-neovim.lua")) {
      executeCommand(luaCreateConfig);
      clearInterval(interval);
    }
  }, 100);
}
function deactivate() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  executeCommand(luaDeleteConfig);
}
