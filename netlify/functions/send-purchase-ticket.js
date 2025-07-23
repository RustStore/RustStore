const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const requestBody = JSON.parse(event.body);
        const {
            customerEmail,
            discordUsername,
            gameUsername,
            itemName,
            itemPrice,
            paymentMethod,
            transactionId,
            serverName = "Your Rust Server",
            serverDate = new Date().toLocaleDateString(),
            serverTime = new Date().toLocaleTimeString()
        } = requestBody;

        // Validate required fields
        if (!customerEmail || !itemName || !itemPrice) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Create Gmail transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
            }
        });

        // Email content
        const emailSubject = `🎮 Rust Store Purchase Confirmation - ${itemName}`;
        
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(45deg, #ffd700, #ffed4e); padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffd700; }
        .customer-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }
        .server-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2196F3; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; margin-top: 20px; }
        .highlight { color: #ffd700; font-weight: bold; }
        .success { color: #4CAF50; font-weight: bold; }
        .info { color: #2196F3; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Rust Store Purchase Confirmation</h1>
        <p>Thank you for your purchase!</p>
    </div>
    
    <div class="content">
        <div class="order-details">
            <h2>📦 Order Details</h2>
            <p><strong>Item Purchased:</strong> <span class="highlight">${itemName}</span></p>
            <p><strong>Price:</strong> <span class="highlight">$${(itemPrice / 100).toFixed(2)}</span></p>
            <p><strong>Payment Method:</strong> <span class="highlight">${paymentMethod}</span></p>
            <p><strong>Transaction ID:</strong> <span class="info">${transactionId || 'N/A'}</span></p>
            <p><strong>Purchase Date:</strong> <span class="info">${new Date().toLocaleDateString()}</span></p>
            <p><strong>Purchase Time:</strong> <span class="info">${new Date().toLocaleTimeString()}</span></p>
        </div>

        <div class="customer-info">
            <h2>👤 Customer Information</h2>
            <p><strong>Email:</strong> <span class="info">${customerEmail}</span></p>
            <p><strong>Discord Username:</strong> <span class="info">${discordUsername || 'Not provided'}</span></p>
            <p><strong>In-Game Username:</strong> <span class="info">${gameUsername || 'Not provided'}</span></p>
        </div>

        <div class="server-info">
            <h2>🖥️ Server Information</h2>
            <p><strong>Server Name:</strong> <span class="info">${serverName}</span></p>
            <p><strong>Server Date:</strong> <span class="info">${serverDate}</span></p>
            <p><strong>Server Time:</strong> <span class="info">${serverTime}</span></p>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h2>✅ Delivery Status</h2>
            <p class="success">Your kit will be delivered to your in-game inventory shortly!</p>
            <p>Please allow a few minutes for the delivery to process. If you don't receive your items within 10 minutes, please contact our admin team.</p>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h2>🎉 Thank You!</h2>
            <p>Thanks a lot for enjoying the server! We hope you like the store and have an amazing gaming experience.</p>
            <p>If any problem happens, please contact admins as soon as possible by using the ticket system.</p>
        </div>
    </div>

    <div class="footer">
        <h3>🛠️ Need Help?</h3>
        <p>If you encounter any issues with your purchase or delivery:</p>
        <ul style="list-style: none; padding: 0;">
            <li>📧 Email: admin@yourserver.com</li>
            <li>💬 Discord: Join our Discord server</li>
            <li>🎫 Ticket System: Use our in-game ticket system</li>
        </ul>
        <p style="margin-top: 20px; font-size: 12px;">
            This is an automated email. Please do not reply directly to this message.
        </p>
    </div>
</body>
</html>
        `;

        // Send email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: customerEmail,
            subject: emailSubject,
            html: emailBody
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Purchase ticket sent successfully' 
            })
        };

    } catch (error) {
        console.error('Error sending purchase ticket:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to send purchase ticket',
                details: error.message 
            })
        };
    }
}; 