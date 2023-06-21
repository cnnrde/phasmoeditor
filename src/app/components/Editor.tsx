/*
 eg:
 "ThermometerInventory": {
		"__type": "int",
		"value": 2
	},
*/

interface DataObject {
  __type: string
  value: any
}

interface EditorProps {
  // data is an object with keys that are strings and values that are objects with the following shape:
  data: {
    [key: string]: DataObject
  }
}

const Editor = (props: EditorProps) => {
  return (
    <div className="flex flex-col gap-2">
      {/* we need to loop through props.data and create a new input (with label) for all of the keys */}
      {/* we also need to make sure that the input is the correct type (number, string, boolean) */}
      {Object.keys(props.data).map((key) => {
        const dataObj = props.data[key] as DataObject
        let inputElement

        switch (dataObj.__type) {
          case 'int':
            inputElement = (
              <input
                type="number"
                id={key}
                defaultValue={dataObj.value}
                className="w-full bg-slate-900 p-2 rounded-lg outline-none"
                onChange={(e) => {
                  // update the value in the data
                  props.data[key].value = parseInt(e.target.value)
                }}
              />
            )
            break
          case 'float':
            inputElement = (
              <input
                type="number"
                id={key}
                defaultValue={dataObj.value}
                className="w-full bg-slate-900 p-2 rounded-lg outline-none"
                onChange={(e) => {
                  // update the value in the data
                  props.data[key].value = parseFloat(e.target.value)
                }}
              />
            )
            break
          case 'bool':
            inputElement = (
              <select
                id={key}
                defaultValue={dataObj.value}
                className="w-full bg-slate-900 p-2 rounded-lg outline-none"
                onChange={(e) => {
                  // update the value in the data
                  props.data[key].value = e.target.value === 'true'
                }}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            )
            break
          default:
            if (typeof dataObj.value === 'object') {
              // we need to ignore this
              inputElement = (
                <input
                  type="text"
                  id={key}
                  value={'Uneditable'}
                  disabled
                  className="w-full bg-red-900 p-2 rounded-lg outline-none cursor-not-allowed"
                />
              )
              break
            }
            inputElement = (
              <input
                type="text"
                id={key}
                defaultValue={dataObj.value}
                className="w-full bg-slate-900 p-2 rounded-lg outline-none"
                onChange={(e) => {
                  // update the value in the data
                  props.data[key].value = e.target.value
                }}
              />
            )
            break
        }

        return (
          <div key={key}>
            <label htmlFor={key}>{key}</label>
            {inputElement}
          </div>
        )
      })}
    </div>
  )
}

export default Editor
