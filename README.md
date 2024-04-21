# phasmoeditor

Welcome to the phasmoeditor (Phasmophobia Save Editor) web application! This tool allows you to easily edit the save files for the game Phasmophobia, giving you a way to tweak your game experience to your liking.

## Important Notice
Before using the Phasmophobia Save Editor, it is crucial to **disable the Steam Cloud synchronization** for Phasmophobia save files. Failing to do so may result in Steam restoring any changes you've made with the editor once you launch the game.

Here's how to disable Steam Cloud synchronization for Phasmophobia:

1. In your Steam Library, right-click on Phasmophobia.
2. Select 'Properties...'
3. Navigate to the 'General' tab.
4. Uncheck the box next to 'Keep games saves in the Steam Cloud for Phasmaphobia'
5. Close the Properties window.

## Website
Access the Phasmophobia Save Editor online: [phasmoeditor.cnnd.dev](https://phasmoeditor.cnnd.dev/)

## Save File Locations
Before you start using the editor, you need to locate your Phasmophobia save files. Here's how you can find them on different operating systems:

### Windows
```%USERPROFILE%\AppData\LocalLow\Kinetic Games\Phasmophobia\SaveFile.txt```

### Linux (Using Proton)
```~/.steam/steam/steamapps/compatdata/739630/pfx/drive_c/users/steamuser/AppData/LocalLow/Kinetic Games\SaveFile.txt```

## How to Use
1. Disable Steam Cloud synchronization for Phasmophobia (see above).
2. Locate your Phasmophobia save file on your computer.
3. Go to our web application.
4. Upload your save file.
5. Edit the parameters as you wish.
6. Save and download the edited file.
7. Replace the original save file with the edited one (ensure to back up the original file).

## Dependencies
Our project uses a number of dependencies to run smoothly. Here's the list for those who might be interested in contributing to the project or understanding its internals:

- `@types/node`
- `@types/react`
- `@types/react-dom`
- `@vercel/analytics`
- `autoprefixer`
- `eslint`
- `eslint-config-next`
- `next`
- `postcss`
- `react`
- `react-dom`
- `tailwindcss`
- `typescript`

## Support
If you encounter any issues or have suggestions, please file an issue on the GitHub repository.

## Disclaimer
This tool is not officially affiliated with Phasmophobia or Kinetic Games. Please use this save editor responsibly and at your own risk. Always back up your original save files before using the editor, and ensure that Steam Cloud synchronization is turned off for Phasmophobia save files.

Enjoy editing your Phasmophobia save files responsibly!