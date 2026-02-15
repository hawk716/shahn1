import nodemailer from 'nodemailer';

// إعداد transporter Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'alshamelpay@gmail.com',
    pass: 'mled kbqt cxjj uaya',
  },
});

interface EmailOptions {
  to: string;
  username: string;
  verificationLink: string;
  language?: 'ar' | 'en';
}

function getArabicEmail(username: string, verificationLink: string) {
  return {
    subject: 'تحقق من بريدك الإلكتروني - AL-SHAMEL PAY',
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تحقق من بريدك</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a1a; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0d0d0d; border: 2px solid #e63946; border-radius: 8px; padding: 30px; text-align: center; }
          .logo { width: 150px; height: auto; margin-bottom: 20px; }
          .title { color: #ffffff; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { color: #e63946; font-size: 18px; margin-bottom: 20px; }
          .greeting { color: #ffffff; font-size: 16px; margin-bottom: 20px; }
          .message { color: #cccccc; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background-color: #e63946; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; border: 2px solid #e63946; cursor: pointer; transition: all 0.3s; }
          .button:hover { background-color: transparent; color: #e63946; }
          .footer { color: #888888; font-size: 12px; margin-top: 30px; border-top: 1px solid #333333; padding-top: 15px; }
          .warning { color: #e63946; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">تحقق من بريدك الإلكتروني</div>
          <div class="subtitle">AL-SHAMEL PAY</div>
          
          <div class="greeting">مرحباً ${username}!</div>
          
          <div class="message">
            شكراً لتسجيلك معنا! لإكمال تفعيل حسابك، اضغط على الزر أدناه:
          </div>
          
          <a href="${verificationLink}" class="button">تحقق من حسابك</a>
          
          <div class="footer">
            <p>أو انسخ والصق الرابط التالي في متصفحك:</p>
            <p style="word-break: break-all; color: #666666;">${verificationLink}</p>
            <p class="warning">⚠️ هذا الرابط صالح لمدة 24 ساعة فقط</p>
            <p>إذا لم تقم بإنشاء هذا الحساب، تجاهل هذا البريد.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

function getEnglishEmail(username: string, verificationLink: string) {
  return {
    subject: 'Verify your email - AL-SHAMEL PAY',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1a1a1a; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0d0d0d; border: 2px solid #e63946; border-radius: 8px; padding: 30px; text-align: center; }
          .logo { width: 150px; height: auto; margin-bottom: 20px; }
          .title { color: #ffffff; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { color: #e63946; font-size: 18px; margin-bottom: 20px; }
          .greeting { color: #ffffff; font-size: 16px; margin-bottom: 20px; }
          .message { color: #cccccc; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background-color: #e63946; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; border: 2px solid #e63946; cursor: pointer; transition: all 0.3s; }
          .button:hover { background-color: transparent; color: #e63946; }
          .footer { color: #888888; font-size: 12px; margin-top: 30px; border-top: 1px solid #333333; padding-top: 15px; }
          .warning { color: #e63946; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Verify your email address</div>
          <div class="subtitle">AL-SHAMEL PAY</div>
          
          <div class="greeting">Hello ${username}!</div>
          
          <div class="message">
            Thank you for signing up! To complete your account activation, click the button below:
          </div>
          
          <a href="${verificationLink}" class="button">Verify your account</a>
          
          <div class="footer">
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666666;">${verificationLink}</p>
            <p class="warning">⚠️ This link is valid for 24 hours only</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export async function sendVerificationEmail(options: EmailOptions) {
  try {
    const language = options.language || 'en';
    const emailContent = language === 'ar' 
      ? getArabicEmail(options.username, options.verificationLink)
      : getEnglishEmail(options.username, options.verificationLink);

    console.log('[v0] Sending verification email to:', options.to);
    console.log('[v0] Language:', language);
    console.log('[v0] Verification Link:', options.verificationLink);

    const mailOptions = {
      from: 'AL-SHAMEL PAY <alshamelpay@gmail.com>',
      to: options.to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('[v0] Email sent successfully!');
    console.log('[v0] Message ID:', info.messageId);
    console.log('[v0] Response:', info.response);

    return { 
      success: true, 
      id: info.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('[v0] Failed to send email:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error details:', errorMessage);
    return { 
      success: false, 
      error: errorMessage,
    };
  }
}

export async function sendWithdrawalConfirmationEmail(options: {
  to: string;
  appName: string;
  currency: string;
  amount: number;
  fee: number;
  accountNumber: string;
  totalAmount: number;
  date: string;
}) {
  try {
    const mailOptions = {
      from: 'AL-SHAMEL PAY <alshamelpay@gmail.com>',
      to: options.to,
      subject: 'تأكيد طلب سحب المبلغ - AL-SHAMEL PAY',
      html: `
        <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px;">
            <h2 style="color: white; margin: 0;">تم استلام طلب السحب</h2>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 30px; margin-top: 20px; border-radius: 8px;">
            <p style="font-size: 16px; color: #333;">مرحباً،</p>
            <p style="font-size: 14px; color: #666;">تم استلام طلب سحب المبلغ بنجاح. إليك تفاصيل الطلب:</p>
            
            <div style="background-color: white; padding: 20px; margin-top: 20px; border-radius: 8px; border-right: 4px solid #ff0000;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">اسم التطبيق:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #000; font-weight: bold;">${options.appName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">العملة:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #000; font-weight: bold;">${options.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">رقم الحساب:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #000; font-weight: bold;">${options.accountNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">المبلغ:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #000; font-weight: bold;">${options.amount} ${options.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">رسوم التحويل:</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #000; font-weight: bold;">${options.fee} ${options.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #666; font-weight: bold;">إجمالي المبلغ:</td>
                  <td style="padding: 10px; color: #ff0000; font-weight: bold; font-size: 16px;">${options.totalAmount} ${options.currency}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; color: #666;">التاريخ:</td>
                  <td style="padding: 10px; color: #000;">${options.date}</td>
                </tr>
              </table>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">سيتم تحويل المبلغ إلى حسابك قريباً. قد يستغرق ذلك بعض الوقت حسب التطبيق المختار.</p>
            
            <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
              شكراً لاستخدامك AL-SHAMEL PAY<br>
              إذا كان لديك أي استفسار، يرجى التواصل معنا
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[v0] Withdrawal confirmation email sent:', info.response);
    return { success: true, id: info.messageId };
  } catch (error) {
    console.error('[v0] Failed to send withdrawal confirmation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
