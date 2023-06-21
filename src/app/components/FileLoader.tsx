'use client'

import crypto from 'crypto'
import { Buffer } from 'buffer'
import { Dispatch, SetStateAction } from 'react'

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
      // there's an issue (apparently) where playedMaps aren't formatted properly.
      // this is a hacky fix for that using regex
      const regex = /"playedMaps"(\s|)\:(\s){\s*.*\s*.*\s*.\s*.*\s*/
      const fixedText = decodedText.replace(regex, '')
      props.stateSetter(JSON.parse(fixedText))
      // now loop through everything in the object, and
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
