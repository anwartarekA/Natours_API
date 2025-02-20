const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// class that i can use it to send any email
module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.firstName = user.name.split(' ')[0]),
      (this.url = url),
      (this.from = `natours family <${process.env.APPLICATION_EMAIL}>`);
  }
  // create transport
  newTransport() {
    // if we are in production
    if (process.env.NODE_ENV == 'production') {
      return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      // mailgun
    }
    // create transport at development at mail trap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  // make send fuction to send a real email for each action
  async send(template, subject) {
    // 1) render an html based on template pug
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    // 2) define the options for mail
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) create the transporter and send an email
    await this.newTransport().sendMail(mailOptions);
  }
  // send email for signing up
  async sendWelcome() {
    await this.send('welcome', 'Welcome to natours family 😎');
  }
  // send email when user want to reset his password
  async sendResetPasswordEmail() {
    await this.send(
      'resetPassword',
      'This reset token valid for (only 10 minutes)',
    );
  }
};
