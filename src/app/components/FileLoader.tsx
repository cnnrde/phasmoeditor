'use client'

import crypto from 'crypto'
import { Buffer } from 'buffer'
import { Dispatch, SetStateAction } from 'react'
import { parseES3 } from '../lib/es3json'

interface IFileLoaderProps {
  stateSetter: Dispatch<SetStateAction<any>>
}

const FileLoader = (props: IFileLoaderProps) => {
  // this is TERRIBLE! but it's the only way I can get it to work
  const PASSWORD = 't36gref9u84y7f43g'
  const handleFileChange = async (data: ArrayBuffer) => {
    try {
      if (!data) return
      const iv = Buffer.from(data.slice(0, 16))
      const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        crypto.pbkdf2Sync(PASSWORD, iv, 100, 16, 'sha1'),
        iv,
      )
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(data.slice(16))),
        decipher.final(),
      ])
      // convert decrypted to text
      const decodedText = new TextDecoder().decode(decrypted)
      // ES3 isn't quite plain JSON - it allows bare numeric dictionary keys
      // (e.g. `{12:2}`) and dictionary keys that are themselves objects
      // (e.g. split 64-bit item IDs like `{"low":...,"high":...}:{...}`,
      // seen in fields like LocalPlayerOutfit). parseES3 understands both;
      // plain JSON.parse throws on real save files that use them.
      props.stateSetter(parseES3(decodedText))
    } catch (e) {
      console.error(e)
      alert(
        "Error decrypting save file - make sure you're using the correct file (and that it's valid)",
      )
    }
  }

  return (
    <>
      <input
        type="file"
        accept=".txt"
        id="saveFileInput"
        className="hidden"
        onChange={(e) => {
          if (!e.target.files?.[0]) return
          const fileReader = new FileReader()
          fileReader.onload = (ev: ProgressEvent<FileReader>) => {
            // setData(Buffer.from(ev.target?.result as ArrayBuffer))
            const data = Buffer.from(ev.target?.result as ArrayBuffer)
            handleFileChange(data)
          }
          fileReader.readAsArrayBuffer(e.target.files[0])
        }}
      />
      <input
        type="file"
        accept=".txt"
        id="saveFileInputUnencrypted"
        className="hidden"
        onChange={(e) => {
          if (!e.target.files?.[0]) return
          const fileReader = new FileReader()
          fileReader.onload = (ev: ProgressEvent<FileReader>) => {
            props.stateSetter(JSON.parse(ev.target?.result as string))
          }
          fileReader.readAsText(e.target.files[0])
        }}
      />
    </>
  )
}

export default FileLoader
