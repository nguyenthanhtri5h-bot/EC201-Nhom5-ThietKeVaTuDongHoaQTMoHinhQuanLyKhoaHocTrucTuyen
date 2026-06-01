import { Client, logger, Variables } from 'camunda-external-task-client-js';
import nodemailer from 'nodemailer';

// Cấu hình kết nối đến Camunda Engine
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };
const client = new Client(config);
/**
 * 1. LOGIC: KIỂM TRA TỰ ĐỘNG (Topic: check-eligibility)
 */
client.subscribe('check-eligibility', async ({ task, taskService }) => {
    const days = task.variables.get('days');
    const progress = task.variables.get('progress');
    
    // Logic thật: Dưới 30 ngày và học dưới 50% mới cho hoàn
    const isEligible = (days <= 30 && progress < 50);
    
    const processVariables = new Variables().set('isEligible', isEligible);
    await taskService.complete(task, processVariables);
    console.log(`>>> [Hệ thống]: Kiểm tra xong. Kết quả hợp lệ: ${isEligible}`);
});

/**
 * 2. LOGIC: TÍNH TOÁN TIỀN - TRỪ PHÍ 10% (Topic: calculate-refund)
 */
client.subscribe('calculate-refund', async ({ task, taskService }) => {
    const amount = task.variables.get('amount');
    const realRefund = amount * 0.9; // Trừ 10% phí quản lý
    
    const processVariables = new Variables().set('realRefund', realRefund);
    await taskService.complete(task, processVariables);
    console.log(`>>> [Hệ thống]: Đã tính tiền thực hoàn (trừ 10%): ${realRefund} VNĐ`);
});

/**
 * 3. LOGIC: GỬI EMAIL THẬT (Topic: send-email-worker)
 */
client.subscribe('send-email-worker', async ({ task, taskService }) => {
    const email = task.variables.get('studentEmail');
    const isManagerReject = task.variables.get('isManagerApproved') === false;

    // Cấu hình gửi mail bằng tài khoản Gmail thật
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'email-cua-nhom-ban@gmail.com',
          pass: 'mat-khau-ung-dung-gmail' // App Password 16 ký tự
        }
    });

    let mailContent = isManagerReject 
        ? "Yêu cầu hoàn tiền bị từ chối bởi Quản lý Tài chính."
        : "Yêu cầu hoàn tiền bị từ chối do không đủ điều kiện (Quá 30 ngày hoặc tiến độ > 50%).";

    await transporter.sendMail({
        from: '"Hệ thống UIT Course" <noreply@uit.edu.vn>',
        to: email,
        subject: "Thông báo kết quả hoàn trả học phí",
        text: mailContent
    });

    await taskService.complete(task);
    console.log(`>>> [Hành động thật]: Đã gửi Email từ chối đến: ${email}`);
});

/**
 * 4. LOGIC: HOÀN TIỀN MOMO THẬT (Topic: momo-payment-worker)
 */
client.subscribe('momo-refund-process', async ({ task, taskService }) => {
    const money = task.variables.get('realRefund');
    const phone = task.variables.get('momoPhone');

    console.log(`>>> [Hành động thật]: ĐANG GỌI API MOMO thanh toán ${money}đ đến số ${phone}...`);
    console.log(`>>> [Hành động thật]: ĐANG GỌI API HỆ THỐNG để khóa quyền truy cập khóa học...`);
    
    await taskService.complete(task);
    console.log(">>> [Hệ thống]: Hoàn tiền thành công!");
});