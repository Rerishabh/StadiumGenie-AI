import nodemailer from 'nodemailer';

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: create ethereal test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Generated Ethereal Mail credentials: user=${testAccount.user}`);
    } catch (err) {
      console.warn('Could not create Ethereal account, falling back to JSON console logger:', err.message);
      // Mock transporter that logs to console
      transporter = {
        sendMail: async (options) => {
          console.log('--- Mock Email Log ---');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Body text snippet: ${options.text ? options.text.substring(0, 100) : ''}`);
          console.log('----------------------');
          return { messageId: 'mock-id', messageUrl: 'console-log' };
        }
      };
    }
  }

  return transporter;
}

export async function sendTicketEmail(to, ticketData) {
  if (!to) return;
  const client = await getTransporter();

  const subject = `Your StadiumGenie Entry Pass: ${ticketData.eventTitle}`;

  // Build HTML template
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StadiumGenie Pass</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #f1f5f9; }
          .header { background-color: #2563eb; color: #ffffff; padding: 32px 24px; text-align: center; }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.05em; }
          .subtitle { font-size: 14px; opacity: 0.8; margin-top: 4px; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
          .intro { font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
          .ticket-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px; position: relative; }
          .ticket-title { font-size: 20px; font-weight: 850; color: #0f172a; margin: 0 0 4px 0; }
          .ticket-venue { font-size: 13px; color: #64748b; margin: 0 0 16px 0; font-weight: 550; }
          .ticket-details { border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; padding: 16px 0; margin-bottom: 16px; }
          .detail-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
          .detail-row:last-child { margin-bottom: 0; }
          .detail-label { color: #64748b; font-weight: 500; }
          .detail-val { color: #0f172a; font-weight: 700; }
          .qr-container { text-align: center; padding: 16px 0 0 0; }
          .qr-img { width: 180px; height: 180px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; display: inline-block; }
          .footer { text-align: center; padding: 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">StadiumGenie</div>
            <div class="subtitle">Real-time Ticket Pass</div>
          </div>
          <div class="content">
            <div class="greeting">Hi ${ticketData.userName || 'Sports Fan'},</div>
            <div class="intro">Your order is confirmed and your digital gate pass is ready! Present the QR code below at the stadium scanner for direct entry.</div>
            
            <div class="ticket-card">
              <h2 class="ticket-title">${ticketData.eventTitle}</h2>
              <div class="ticket-venue">🏟️ ${ticketData.stadiumName}</div>
              
              <div class="ticket-details">
                <div class="detail-row">
                  <span class="detail-label">Ticket Number:</span>
                  <span class="detail-val" style="font-family: monospace;">${ticketData.ticketNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Quantity:</span>
                  <span class="detail-val">${ticketData.quantity} seat(s)</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount Paid:</span>
                  <span class="detail-val">₹${ticketData.totalAmount}</span>
                </div>
              </div>
              
              <div class="qr-container">
                <img src="cid:qrcode" alt="Entry QR Code" class="qr-img">
                <div style="font-size: 10px; color: #94a3b8; margin-top: 8px; font-weight: 550; text-transform: uppercase; letter-spacing: 0.05em;">Scan at Gate</div>
              </div>
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} StadiumGenie. All rights reserved.<br>
            Please do not reply directly to this automated email.
          </div>
        </div>
      </body>
    </html>
  `;

  const qrBase64 = ticketData.qrCode.split(',')[1];

  const mailOptions = {
    from: `"StadiumGenie Pass" <${process.env.SMTP_FROM || 'noreply@stadiumgenie.com'}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'qrcode.png',
        content: Buffer.from(qrBase64, 'base64'),
        cid: 'qrcode',
      },
    ],
  };

  const info = await client.sendMail(mailOptions);
  console.log(`Email dispatched successfully! Message ID: ${info.messageId}`);
  const url = nodemailer.getTestMessageUrl(info);
  if (url) {
    console.log(`Test Email Ethereal URL: ${url}`);
  }
  return info;
}
