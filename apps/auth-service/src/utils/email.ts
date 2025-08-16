import nodemailer, { Transporter } from "nodemailer";

const transporter: Transporter = nodemailer.createTransport({
	service: "Gmail",
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT),
	secure: true,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export const sendVerificationEmail = async (to: string, token: string, username: string) => {
	let verificationUrl = `http://127.0.0.1:3000/api/v1/auth/verify-email?token=${token}`; // change link to frontend
	await transporter.sendMail({
		from: '"ft_transcendence" <no-reply@bigbang-transcendence.com>',
		to,
		subject: "Verify your email",
		html: `
      <h1>Welcome ${username}!</h1>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Click here please!</a>
    `,
	});
};
