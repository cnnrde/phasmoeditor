import crypto from 'crypto'

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
          const dataString = JSON.stringify(props.data, null, 2)
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
