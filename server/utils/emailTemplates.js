const contactInquiryTemplate = (contactData) => {
    const { name, email, phone, message, property, vendor } = contactData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Service Inquiry</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #2563eb;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: #f8fafc;
                padding: 30px;
                border: 1px solid #e2e8f0;
            }
            .section {
                margin-bottom: 25px;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
            .section h3 {
                margin-top: 0;
                color: #2563eb;
                font-size: 18px;
            }
            .info-row {
                display: flex;
                margin-bottom: 10px;
            }
            .label {
                font-weight: bold;
                min-width: 120px;
                color: #4a5568;
            }
            .value {
                color: #2d3748;
            }
            .message-box {
                background-color: #f7fafc;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                margin-top: 10px;
            }
            .footer {
                background-color: #2d3748;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                font-size: 14px;
            }
            .urgent {
                background-color: #fef2f2;
                border-left-color: #ef4444;
                border: 1px solid #fecaca;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔔 New Service Inquiry Received</h1>
            <p>A customer is interested in your service</p>
        </div>
        
        <div class="content">
            <div class="section urgent">
                <h3>📞 Customer Contact Information</h3>
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${email}</span>
                </div>
                <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value">${phone}</span>
                </div>
            </div>

            <div class="section">
                <h3>🏢 Service Details</h3>
                <div class="info-row">
                    <span class="label">Service:</span>
                    <span class="value">${property?.title || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Category:</span>
                    <span class="value">${property?.category || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Location:</span>
                    <span class="value">${property?.location || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Service ID:</span>
                    <span class="value">#${property?._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                </div>
            </div>

            <div class="section">
                <h3>👤 Vendor Information</h3>
                <div class="info-row">
                    <span class="label">Vendor:</span>
                    <span class="value">${vendor?.name || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Company:</span>
                    <span class="value">${vendor?.company || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value">${vendor?.phone || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${vendor?.email || 'N/A'}</span>
                </div>
            </div>

            ${message ? `
            <div class="section">
                <h3>💬 Customer Message</h3>
                <div class="message-box">
                    ${message}
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h3>⏰ Inquiry Details</h3>
                <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value">${new Date().toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="info-row">
                    <span class="label">Time:</span>
                    <span class="value">${new Date().toLocaleTimeString('en-IN')}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Mera Ghar Sansaar</strong></p>
            <p>This is an automated notification. Please respond to the customer promptly.</p>
            <p>📧 Contact: ${process.env.MAIL_USER} | 🌐 Platform Admin</p>
        </div>
    </body>
    </html>
    `;
};

const generalContactTemplate = (contactData) => {
    const { name, email, phone, subject, message } = contactData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New General Contact Inquiry</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #2563eb;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: #f8fafc;
                padding: 30px;
                border: 1px solid #e2e8f0;
            }
            .section {
                margin-bottom: 25px;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
            .section h3 {
                margin-top: 0;
                color: #2563eb;
                font-size: 18px;
            }
            .info-row {
                display: flex;
                margin-bottom: 10px;
            }
            .label {
                font-weight: bold;
                min-width: 120px;
                color: #4a5568;
            }
            .value {
                color: #2d3748;
            }
            .message-box {
                background-color: #f7fafc;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                margin-top: 10px;
            }
            .footer {
                background-color: #2d3748;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                font-size: 14px;
            }
            .urgent {
                background-color: #fef2f2;
                border-left-color: #ef4444;
                border: 1px solid #fecaca;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>Someone reached out through your website</p>
        </div>
        
        <div class="content">
            <div class="section urgent">
                <h3>👤 Contact Information</h3>
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Email:</span>
                    <span class="value">${email}</span>
                </div>
                ${phone ? `
                <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value">${phone}</span>
                </div>
                ` : ''}
                <div class="info-row">
                    <span class="label">Subject:</span>
                    <span class="value">${subject}</span>
                </div>
            </div>

            <div class="section">
                <h3>💬 Message</h3>
                <div class="message-box">
                    ${message}
                </div>
            </div>

            <div class="section">
                <h3>⏰ Submission Details</h3>
                <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value">${new Date().toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="info-row">
                    <span class="label">Time:</span>
                    <span class="value">${new Date().toLocaleTimeString('en-IN')}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Mera Ghar Sansaar</strong></p>
            <p>This message was sent through the contact form on your website.</p>
            <p>📧 Reply to: ${email} | 🌐 Platform Admin</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    contactInquiryTemplate,
    generalContactTemplate
};