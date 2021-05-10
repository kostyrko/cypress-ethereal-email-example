// use Nodemailer to get an Ethereal email inbox
// https://nodemailer.com/about/
const nodemailer = require('nodemailer')
// used to check the email inbox
const imaps = require('imap-simple')
// used to parse emails from the inbox
const simpleParser = require('mailparser').simpleParser

const makeEmailAccount = async () => {
  // Generate a new Ethereal email inbox account
  const testAccount = await nodemailer.createTestAccount()

  const emailConfig = {
    user: testAccount.user,
    password: testAccount.pass,
    host: 'imap.ethereal.email',
    port: 993,
    tls: true,
    authTimeout: 10000,
  }
  console.log('created new email account %s', emailConfig.user)
  console.log('for debugging, the password is %s', emailConfig.password)

  const userEmail = {
    email: emailConfig.user,

    /**
     * Utility method for getting the last email
     */
    async getLastEmail() {
      console.log('getting the last email')
      console.log(emailConfig)

      try {
        const connection = await imaps.connect(emailConfig)

        await connection.openBox('INBOX')
        const searchCriteria = ['1:5']
        const fetchOptions = {
          bodies: [''],
        }
        const messages = await connection.search(searchCriteria, fetchOptions)

        connection.end()

        if (!messages.length) {
          console.log('cannot find any emails')
          return null
        } else {
          console.log('there are %d messages', messages.length)
          const mail = await simpleParser(messages[0].parts[0].body)
          console.log(mail.subject)
          console.log(mail.text)
          console.log(mail.html)

          return {
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
          }
        }
      } catch (e) {
        console.error(e)
        return null
      }
    },
  }

  return userEmail
}

module.exports = makeEmailAccount
