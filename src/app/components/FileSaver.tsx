import crypto from 'crypto'
import { dumpES3 } from '../lib/es3json'

interface DataObject {
  __type: string
  value: any
}

interface FileSaverProps {
  // data is an object with keys that are strings and values that are objects with the following shape:
  data: {
    [key: string]: DataObject
  }
}

const FileSaver = (props: FileSaverProps) => {
  return (
    <>
      <input
        type="button"
        id="saveFileOutput"
        className="hidden"
        onClick={() => {
          // dumpES3 (not JSON.stringify) is required here: it restores bare
          // numeric dictionary keys and object-typed keys (e.g. split 64-bit
          // item IDs in fields like LocalPlayerOutfit) back to the form the
          // game's ES3 reader expects. JSON.stringify would leave those as
          // quoted string keys forever, which the game won't recognize.
          const dataString = dumpES3(props.data)
          const PASSWORD = 't36gref9u84y7f43g'
          const iv = crypto.randomBytes(16)
          const cipher = crypto.createCipheriv(
            'aes-128-cbc',
            crypto.pbkdf2Sync(PASSWORD, iv, 100, 16, 'sha1'),
            iv,
          )
          const encrypted = Buffer.concat([
            cipher.update(dataString),
            cipher.final(),
          ])

          const blob = new Blob([iv, encrypted], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'SaveFile.txt'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }}
      />
      <input
        type="button"
        id="saveFileOutputUnencrypted"
        className="hidden"
        onClick={() => {
          // Plain JSON here is intentional - this download is for humans to
          // read/hand-edit, not for the game, so standard pretty JSON (with
          // the object-key marker visible as an ordinary string) is fine.
          const dataString = JSON.stringify(props.data, null, 2)
          const blob = new Blob([dataString], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'SaveFile.unencrypted.txt'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }}
      />
    </>
  )
}

export default FileSaver
