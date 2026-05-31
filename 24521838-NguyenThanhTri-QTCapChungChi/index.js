const { Client, logger, Variables } = require('camunda-external-task-client-js');

const config = { 
    baseUrl: 'http://103.82.27.230:8080/engine-rest', 
    use: logger, 
    asyncResponseTimeout: 10000 
};

const client = new Client(config);

console.log("🚀 BOT ĐÃ SẴN SÀNG XỬ LÝ TOÀN BỘ QUY TRÌNH!");

// 1. KIỂM TRA ĐIỀU KIỆN HỌC THUẬT
client.subscribe('kiem-tra-hoc-thuat', async function({ task, taskService }) {
    // 1. Lấy tên và lấy tiến độ/điểm số từ Form (Nhớ sửa 'tienDo' thành đúng ID biến trong Form của bạn)
    const hoTen = task.variables.get('hoTen');
    const tienDo = task.variables.get('tienDo'); 

    console.log(`[Học Thuật] Đang check cho: ${hoTen} - Tiến độ hoàn thành: ${tienDo}%`);
    
    const vars = new Variables();

    // 2. ĐẶT ĐIỀU KIỆN THỰC TẾ: Tiến độ phải đạt 100% mới cho qua
    if (tienDo >= 100) {
        vars.set("isDuDieuKien", true);
        console.log(`=> KẾT QUẢ: Đạt yêu cầu! Bắt đầu tạo chứng chỉ.`);
    } else {
        vars.set("isDuDieuKien", false);
        console.log(`=> KẾT QUẢ: Chưa đạt yêu cầu (Tiến độ < 100%). Từ chối cấp!`);
    }

    await taskService.complete(task, vars);
});

// 2. KIỂM TRA TÌNH TRẠNG LỆ PHÍ
client.subscribe('kiem-tra-le-phi', async function({ task, taskService }) {
    console.log(`[Lệ Phí] Đang check tình trạng đóng tiền...`);
    const vars = new Variables();
    // Logic: Nếu đã điền mã giao dịch ở bước trước thì coi như đã đóng
    const maGD = task.variables.get('maGiaoDich');
    vars.set("isDaDongPhi", !!maGD); 
    await taskService.complete(task, vars);
});

// 3. GỬI EMAIL TỪ CHỐI (Nếu rớt học thuật)
client.subscribe('gui-email-tu-choi', async function({ task, taskService }) {
    console.log(`[Email] 📧 Đã gửi mail chia buồn cho ${task.variables.get('email')}`);
    await taskService.complete(task);
});

// 4. TẠO FILE PDF CHỨNG CHỈ
client.subscribe('tao-file-pdf', async function({ task, taskService }) {
    console.log(`[Hệ thống] 📄 Đang render file PDF chứng chỉ cho ${task.variables.get('hoTen')}...`);
    // Chờ 2 giây giả lập đang xử lý nặng
    setTimeout(async () => {
        await taskService.complete(task);
        console.log(`[Hệ thống] ✅ Đã tạo xong file PDF.`);
    }, 2000);
});

// 5. GỬI EMAIL BẢN MỀM
client.subscribe('gui-email-ban-mem', async function({ task, taskService }) {
    console.log(`[Email] 📧 Đã đính kèm PDF và gửi cho ${task.variables.get('email')}`);
    await taskService.complete(task);
});