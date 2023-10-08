import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerServie: MailerService) {}

  async sendUserConfirmation(user): Promise<void> {
    const url = `${process.env.API_HOST}/api/auth/activate/${user.activation_link}`;
    await this.mailerServie.sendMail({
      to: user.email,
      subject: 'Welcome to Quote App! Confirm your Email!',
      template: './confirmation',
      context: {
        name: user.first_name,
        url,
      },
    });
  }

  async sendOtp(otp: number, email: string): Promise<void> {
    await this.mailerServie.sendMail({
      to: email,
      subject: 'Verification code for reset password',
      template: './otp',
      context: {
        otp,
      },
    });
  }
}
