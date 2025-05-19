'use server';
import nodemailer from 'nodemailer';
import { fetchProductsByIDs } from './products';

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIIL_APP_PASSWORD
  }
});
export async function sendOrderMail(email, orderData) {

  try {
    // Generate HTML content by replacing template placeholders
    const generateHtmlContent = (products, total, data) => {
      let productRows = '';
      
      products.forEach(product => {
        const cartItem = orderData.products.find(item => Number(item.productId) === Number(product.prodid));
        const quantity = cartItem ? cartItem.quantity : 0;
        
        productRows += `
        <tr>
          <td style="padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- Product Image -->
                <td width="150" valign="top" style="padding-right: 20px;">
                  <img src="${product.picpath || './products/default.png'}" alt="${product.name}" style="width: 100%; max-width: 150px; height: auto; display: block;" />
                </td>
                
                <!-- Product Details -->
                <td valign="top">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-bottom: 8px;">
                        <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">${product.name}</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #333;">Цена:</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 4px;">
                        ${product.isonsale ? 
                          `<p style="margin: 0; font-size: 14px; color: #999; text-decoration: line-through;">${product.price} руб.</p>` : 
                          `<p style="margin: 0; font-size: 14px; color: #333;">${product.price} руб.</p>`}
                      </td>
                    </tr>
                    ${product.isonsale ? `
                    <tr>
                      <td style="padding-bottom: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #e53935; font-weight: bold;">
                          ${product.saleprice} руб.
                          <span style="background: #e53935; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 8px; display: inline-block;">Скидка!</span>
                        </p>
                      </td>
                    </tr>` : ''}
                    <tr>
                      <td>
                        <p style="margin: 0; font-size: 14px; color: #333;">Количество: ${quantity} шт.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
      });
      
      return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <tr>
          <td style="padding: 20px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              ${productRows}
              <tr>
                <td style="padding: 20px; background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center;">
                  <p style="margin: 0; font-size: 25px; font-weight: bold;">Итого: ${total} руб.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${generateCustomerHtml(orderData.customer)}`
    };
    const generateCustomerHtml = (data) => {
  return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 20px auto; font-family: Arial, sans-serif;">
        <!-- Customer Data Section -->
        <tr>
            <td>
            <h1 style="font-size: 24px; color: #333; margin-bottom: 20px;">Данные заказчика</h1>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                <!-- Name Column -->
                <td width="50%" valign="top" style="padding-right: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Фамилия:</p>
                        <p style="margin: 0; padding: 8px; background: #f8f8f8; border-radius: 4px; font-size: 16px;">${data.surname}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Имя:</p>
                        <p style="margin: 0; padding: 8px; background: #f8f8f8; border-radius: 4px; font-size: 16px;">${data.name}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Отчество:</p>
                        <p style="margin: 0; padding: 8px; background: #f8f8f8; border-radius: 4px; font-size: 16px;">${data.patronymic}</p>
                        </td>
                    </tr>
                    </table>
                </td>
                
                <!-- Contact Info Column -->
                <td width="50%" valign="top" style="padding-left: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td style="padding-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Телефон:</p>
                        <p style="margin: 0; padding: 8px; background: #f8f8f8; border-radius: 4px; font-size: 16px;">${data.phone}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">E-mail:</p>
                        <p style="margin: 0; padding: 8px; background: #f8f8f8; border-radius: 4px; font-size: 16px;">${data.email}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Комментарий:</p>
                        <p style="margin: 0; padding: 8px; min-height: 50px; background: #f8f8f8; border-radius: 4px; font-size: 16px;">${data.comment}</p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
            </td>
        </tr>
        </table>
  `;
}
    // Calculate total
    console.log(orderData);
    const products = await fetchProductsByIDs([orderData.products.map(item => item.productId)]);

    let total = 0;
    products.forEach(product => {
      const cartItem = orderData.products.find(item => Number(item.productId) === Number(product.prodid));
      const price = product.isonsale ? product.saleprice : product.price;
      total += Number(cartItem ? (price * cartItem.quantity).toFixed(2) : 0);
    });

    // Generate HTML content
    const html = generateHtmlContent(products, total);

    // Send mail
    const info = await transporter.sendMail({
      from: `"ВентЧасти" <${process.env.EMAIL_USER}>`, // sender address with name
      to: email, // recipient
      subject: `Заказ #${orderData.orderId} успешно оформлен!`, // dynamic order number
      html: html // HTML version
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendRegisteredUserData(email, password) {

      const info = await transporter.sendMail({
      from: `"ВентЧасти" <${process.env.EMAIL_USER}>`,
      to: email, 
      subject: `Регистрация на сайте ВентЧасти!`,
      text: `Ваш временный пароль: ${password}`
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
}