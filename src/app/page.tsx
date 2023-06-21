'use client'

import FileLoader from './components/FileLoader'
import FileSaver from './components/FileSaver'
import Editor from './components/Editor'
import { useState } from 'react'

export default function Home() {
  const [saveData, setSaveData] = useState(null)
  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center dark p-16">
      <div className="bg-slate-700 rounded-lg shadow-lg p-8 dark:bg-slate-800 max-w-md flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Phasmophobia Save Editor</h1>

        {saveData && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex gap-2 mb-4">
              <label
                htmlFor="saveFileOutput"
                className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-normal py-2 px-4 rounded-lg cursor-pointer"
              >
                Download Save File
              </label>
              <label
                htmlFor="saveFileOutputUnencrypted"
                className="bg-purple-500 hover:bg-purple-600 transition-colors text-white font-normal py-2 px-4 rounded-lg cursor-pointer"
              >
                Download Save File (unencrypted)
              </label>
              <FileSaver data={saveData} />
              <label
                htmlFor="clearFile"
                className="bg-red-500 hover:bg-red-600 transition-colors text-white font-normal py-2 px-4 rounded-lg cursor-pointer"
              >
                Close loaded file
              </label>
              <input
                type="button"
                id="clearFile"
                className="hidden"
                onClick={() => {
                  setSaveData(null)
                }}
              />
            </div>
            <Editor data={saveData} />
          </div>
        )}

        {!saveData && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex gap-2 mb-4">
              <label
                htmlFor="saveFileInput"
                className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-normal py-2 px-4 rounded-lg cursor-pointer"
              >
                Upload Save File
              </label>
              <label
                htmlFor="saveFileInputUnencrypted"
                className="bg-purple-500 hover:bg-purple-600 transition-colors text-white font-normal py-2 px-4 rounded-lg cursor-pointer"
              >
                Upload Save File (unencrypted)
              </label>
              <FileLoader stateSetter={setSaveData} />
            </div>
            <span className="text-sm mt-4">
              On Windows, save data can be located at{' '}
              <code className="bg-gray-900 rounded-md p-1">
                %appdata%\..\LocalLow\Kinetic Games\Phasmophobia\SaveFile.txt
              </code>
            </span>
            <span className="text-sm mt-2">
              On Linux (Proton), save data can be located at{' '}
              <code className="bg-gray-900 rounded-md p-1">
                ~/.steam/steam/steamapps/compatdata/739630/pfx/drive_c/users/steamuser/AppData/LocalLow/Kinetic
                Games/SaveFile.txt
              </code>
            </span>
          </div>
        )}
      </div>
    </main>
  )
}
