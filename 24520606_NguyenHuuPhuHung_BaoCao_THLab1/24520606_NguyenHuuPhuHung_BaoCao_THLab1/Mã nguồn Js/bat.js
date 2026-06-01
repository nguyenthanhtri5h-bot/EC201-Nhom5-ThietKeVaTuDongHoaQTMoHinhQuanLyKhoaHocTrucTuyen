import pkg from 'camunda-external-task-client-js';
const { Client, logger, Variables } = pkg;

const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };
const client = new Client(config);

console.log(" BOT ĐÃ SẴN SÀNG - Đang trực ở cả 2 kênh: ai-check và publish-course");

// ==========================================
// 2. BOT XỬ LÝ: MỞ CỔNG HIỂN THỊ LÊN MARKETPLACE
// ==========================================
client.subscribe('publish-course', async function({ task, taskService }) {
    console.log(" [MARKETPLACE]: Đã nhận lệnh xuất bản khóa học...");
    
    setTimeout(async () => {
        // Ô này không có rẽ nhánh, chỉ cần hoàn thành task là được
        await taskService.complete(task);
        console.log(" [MARKETPLACE]: XONG! Khóa học đã được hiển thị công khai!");
    }, 2000);
});