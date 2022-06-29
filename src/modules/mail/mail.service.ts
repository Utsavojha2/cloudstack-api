import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailMessage({ email, context, templateName, subject }) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template: templateName,
      context,
    });
  }
}