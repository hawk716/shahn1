import { Resend } from 'resend';

// استخدم التوكن مباشرة - يمكن تمريره من البيئة أو بشكل مباشر
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_6w81X3ZD_HQeqYzagGXmSzn8P3LCY87Ca';
const resend = new Resend(RESEND_API_KEY);
const resendInitError = 'Resend initialization error'; // Declare the variable

interface EmailOptions {
  to: string;
  username: string;
  verificationLink: string;
  language?: 'ar' | 'en';
}

// محتوى البريد بالعربية
const getArabicEmail = (username: string, verificationLink: string) => ({
  subject: 'تحقق من بريدك الإلكتروني - AL-SHAMEL PAY',
  html: `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1a1a1a;
                padding: 40px 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #dc2626;
                padding-bottom: 20px;
            }
            .logo {
                max-width: 150px;
                height: auto;
                margin-bottom: 15px;
            }
            .content {
                color: #ffffff;
                text-align: center;
            }
            .title {
                font-size: 28px;
                font-weight: bold;
                color: #dc2626;
                margin-bottom: 15px;
            }
            .subtitle {
                font-size: 16px;
                color: #ffffff;
                margin-bottom: 25px;
            }
            .message {
                font-size: 16px;
                line-height: 1.8;
                color: #ffffff;
                margin-bottom: 30px;
                text-align: right;
            }
            .username {
                color: #dc2626;
                font-weight: bold;
            }
            .button-container {
                margin: 40px 0;
            }
            .button {
                display: inline-block;
                padding: 16px 40px;
                background-color: transparent;
                border: 2px solid #dc2626;
                color: #dc2626;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            .button:hover {
                background-color: #dc2626;
                color: #ffffff;
            }
            .link-text {
                color: #999;
                font-size: 12px;
                margin-top: 20px;
                word-break: break-all;
            }
            .footer {
                border-top: 3px solid #dc2626;
                padding-top: 20px;
                margin-top: 40px;
                font-size: 13px;
                color: #999;
                text-align: center;
            }
            .warning {
                color: #999;
                font-size: 14px;
                margin-top: 30px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://your-domain.com/shamel-pay-logo.png" alt="AL-SHAMEL PAY" class="logo" style="width: 150px; height: auto; display: block; margin: 0 auto;">
            </div>
            
            <div class="content">
                <div class="title">تحقق من بريدك الإلكتروني</div>
                <div class="subtitle">AL-SHAMEL PAY</div>
                
                <div class="message">
                    <p>مرحباً <span class="username">${username}</span>،</p>
                    <p style="margin-top: 15px;">شكراً لتسجيلك معنا! لإكمال تفعيل حسابك، اضغط على الزر أدناه:</p>
                </div>
                
                <div class="button-container">
                    <a href="${verificationLink}" class="button">تحقق من بريدك</a>
                </div>
                
                <div class="link-text">
                    أو انسخ هذا الرابط:<br>
                    ${verificationLink}
                </div>
                
                <div class="warning">
                    🔒 هذا الرابط صالح لمدة 24 ساعة فقط<br>
                    لم تسجل للتو؟ تجاهل هذه الرسالة
                </div>
            </div>
            
            <div class="footer">
                <p>© 2025 AL-SHAMEL PAY. جميع الحقوق محفوظة.</p>
            </div>
        </div>
    </body>
    </html>
  `,
});

// محتوى البريد بالإنجليزية
const getEnglishEmail = (username: string, verificationLink: string) => ({
  subject: 'Verify your email address - AL-SHAMEL PAY',
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1a1a1a;
                padding: 40px 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #dc2626;
                padding-bottom: 20px;
            }
            .logo {
                max-width: 150px;
                height: auto;
                margin-bottom: 15px;
            }
            .content {
                color: #ffffff;
                text-align: center;
            }
            .title {
                font-size: 28px;
                font-weight: bold;
                color: #dc2626;
                margin-bottom: 15px;
            }
            .subtitle {
                font-size: 16px;
                color: #ffffff;
                margin-bottom: 25px;
            }
            .message {
                font-size: 16px;
                line-height: 1.8;
                color: #ffffff;
                margin-bottom: 30px;
                text-align: left;
            }
            .username {
                color: #dc2626;
                font-weight: bold;
            }
            .button-container {
                margin: 40px 0;
            }
            .button {
                display: inline-block;
                padding: 16px 40px;
                background-color: transparent;
                border: 2px solid #dc2626;
                color: #dc2626;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            .button:hover {
                background-color: #dc2626;
                color: #ffffff;
            }
            .link-text {
                color: #999;
                font-size: 12px;
                margin-top: 20px;
                word-break: break-all;
            }
            .footer {
                border-top: 3px solid #dc2626;
                padding-top: 20px;
                margin-top: 40px;
                font-size: 13px;
                color: #999;
                text-align: center;
            }
            .warning {
                color: #999;
                font-size: 14px;
                margin-top: 30px;
                text-align: center;
            }
        </style>
    </head>
    <body>
    <div class="container">
        <div class="header">
            <img src="https://your-domain.com/shamel-pay-logo.png" alt="AL-SHAMEL PAY" class="logo" style="width: 150px; height: auto; display: block; margin: 0 auto;">
        </div>
        
        <div class="content">
            <div class="title">Verify your email address</div>
                <div class="subtitle">AL-SHAMEL PAY</div>
                
                <div class="message">
                    <p>Hello <span class="username">${username}</span>,</p>
                    <p style="margin-top: 15px;">Thank you for signing up! To complete your account activation, click the button below:</p>
                </div>
                
                <div class="button-container">
                    <a href="${verificationLink}" class="button">Verify Email</a>
                </div>
                
                <div class="link-text">
                    Or copy this link:<br>
                    ${verificationLink}
                </div>
                
                <div class="warning">
                    🔒 This link is valid for 24 hours only<br>
                    Didn't sign up? Ignore this email
                </div>
            </div>
            
            <div class="footer">
                <p>© 2025 AL-SHAMEL PAY. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `,
});

export async function sendVerificationEmail(options: EmailOptions) {
  try {
    const language = options.language || 'en';
    const emailContent = language === 'ar' 
      ? getArabicEmail(options.username, options.verificationLink)
      : getEnglishEmail(options.username, options.verificationLink);

    console.log('[v0] Sending email to:', options.to);
    console.log('[v0] Using API Key:', RESEND_API_KEY.substring(0, 10) + '...');
    console.log('[v0] Verification Link:', options.verificationLink);
    
    const response = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: options.to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('[v0] Full Resend Response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('[v0] Email sending error:', response.error);
      return { success: false, error: response.error };
    }

    if (response.data?.id) {
      console.log('[v0] Email sent successfully:', response.data.id);
      return { success: true, id: response.data.id };
    } else {
      console.log('[v0] No data returned from Resend');
      return { success: false, error: 'No response ID from Resend' };
    }
  } catch (error) {
    console.error('[v0] Failed to send email - Catch block:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[v0] Error details:', { errorMessage, errorType: typeof error });
    return { success: false, error: errorMessage };
  }
}
