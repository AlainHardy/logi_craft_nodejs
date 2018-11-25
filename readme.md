# logi_craft_nodejs
Small app to the fonctionnality of the crown from the Logitech Craft Keyboad. The app has been tested and works with Windows 7.

## Requirements
The value in parenthesis are the version of the materials used
- Logitech Options (version 6.80.372)
- node.js (v8.9.1)
- a Logitech Craft Keyboard (Firmware 007.000.00014)


## Copy the plugin in the Logitech Options Third party Plugins
Copy the folder `LogiOptionsPlugins` into `%programdata%\Logishrd`.

## Make the craft.exe
Run the command `npm run make` to generate the executable application that will work with the keyboard.

## Controls
Turn the wheel to change the value (from 0 to 255) of a color. Tap the crown to switch between colors.