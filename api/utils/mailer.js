import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendFollowupEmail = async (to, name, type = 'followup') => {
  let subject = '';
  let text = '';
  switch (type) {
    case 'welcome':
      subject = 'Welcome to CasaConnect!';
      text = `Hi${name ? ' ' + name : ''},\n\nWelcome to CasaConnect! We're excited to have you join our community. Start exploring property listings and enjoy seamless management.\n\nIf you have any questions or need help, we're here for you.\n\nBest regards,\nCasaConnect Team`;
      break;
    case 'goodbye':
      subject = 'Goodbye from CasaConnect';
      text = `Hi${name ? ' ' + name : ''},\n\nYour CasaConnect account has been deleted. We're sorry to see you go! If you change your mind, you're always welcome to rejoin our community.\n\nBest wishes,\nCasaConnect Team`;
      break;
    case 'profileUpdate':
      subject = 'Your CasaConnect Profile Was Updated';
      text = `Hi${name ? ' ' + name : ''},\n\nYour CasaConnect profile information was successfully updated. If you did not make this change or have any concerns, please contact our support team.\n\nBest regards,\nCasaConnect Team`;
      break;
    default:
      subject = 'We Miss You! Follow-Up from CasaConnect';
      text = `Hi${name ? ' ' + name : ''},\n\nIt's been a while since you last interacted with CasaConnect. We wanted to check in and see if you need any help or have questions about your property listings.\n\nFeel free to log back in or reach out for support!\n\nBest regards,\nCasaConnect Team`;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};
