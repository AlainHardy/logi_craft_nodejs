const chalk = require('chalk')

const WebSocketClient = require('websocket').client
const client = new WebSocketClient()

// Logitech Options websocket address
const logiOptionsUrl = 'ws://localhost:10134'

const guid = '5b538e8b-6a3b-401f-a58a-4de3aaa3b65a'
const pid = process.pid

let sessionId

let colorFlag = 0b100 // Red Green Blue
const colorValues = {
  red: 0,
  green: 0,
  blue: 0
}

function displayColor () {
  const focusedColor = (mask, value) => {
    return (colorFlag === mask) ? chalk.magenta(value) : value
  }
  console.clear()
  console.log(`R: ${focusedColor(0b100, colorValues.red)}, G: ${focusedColor(0b010, colorValues.green)}, B: ${focusedColor(0b001, colorValues.blue)}`)

  let output = ''
  for (let i = 0; i < 255; i++) {
    output += colorValues.red > i ? chalk.bgRed(' ') : ''
    output += colorValues.green > i ? chalk.bgGreen(' ') : ''
    output += colorValues.blue > i ? chalk.bgBlue(' ') : ''
  }
  console.log(output)
}

client.on('connectFailed', (error) => {
  console.log(`Connect Error: ${error}`)
})

client.on('connect', (connection) => {
  // console.log('Websocket Client Connected')
  displayColor()
  let resetToolChange = true

  let initJson = {
    message_type: 'register',
    plugin_guid: guid,
    PID: pid,
    execName: 'craft.exe',
    application_version: '0.0.0'
  }

  let sliding = false

  connection.on('error', (error) => {
    console.log(`Connection Error: ${error}`)
  })

  connection.on('close', () => {
    console.log('Connection Closed')
  })

  connection.on('message', (message) => {
    if (typeof message === 'object') {
      // console.log(`Content of message : ${JSON.stringify(message)}`)
      let resObj = JSON.parse(message.utf8Data)
      // console.log(`---- Message Type : ${resObj.message_type}`)
      switch (resObj.message_type) {
        case 'register_ack':
          sessionId = resObj.session_id
          resetToolChange = true
          break
        case 'activate_plugin':
          // console.log(`resetToolChange state: ${resetToolChange}`)
          if (resetToolChange) {
            let response = {
              message_type: 'tool_change',
              session_id: sessionId,
              tool_id: 'slider',
              reset_options: true
            }
            // console.log(response)
            // console.log(`Response send to activate : ${JSON.stringify.response}`)

            connection.send(JSON.stringify(response))
            resetToolChange = false
          }
          break
        case 'crown_touch_event':
          // console.log(`touch`)
          // console.log(resObj)

          if (sliding) {
            sliding = false
            break
          }
          if (resObj.touch_state === 0) {
            colorFlag = colorFlag >> 1
            if (colorFlag === 0) colorFlag = 0b100
            displayColor()
          }
          break
        case 'crown_turn_event':
          // console.log(`turn`)
          // console.log(resObj)

          sliding = true
          if (resObj.ratchet_delta === 0) break

          let index = colorFlag === 0b100 ? 'red'
            : colorFlag === 0b010 ? 'green'
              : colorFlag === 0b001 ? 'blue'
                : undefined

          colorValues[index] += resObj.delta
          if (colorValues[index] < 0) colorValues[index] = 0
          if (colorValues[index] > 255) colorValues[index] = 255

          displayColor()
          break
      }
    } else console.log(`Content of message : ${message}`)
  })

  connection.send(JSON.stringify(initJson))
})

client.connect(logiOptionsUrl)
