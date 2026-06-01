import pkg from 'camunda-external-task-client-js';
const { Client, logger, Variables } = pkg;

const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };
const client = new Client(config);

console.log(" BOT ĐÃ SẴN SÀNG - Đang trực ở cả 2 kênh: ai-check và publish-course");

// ==========================================
// 1. BOT XỬ LÝ: HỆ THỐNG AI QUÉT KỸ THUẬT
// ==========================================
client.subscribe('ai-check', async function({ task, taskService }) {
    console.log(" [AI]: Đang quét Video...");
    
    setTimeout(async () => {
        const processVariables = new Variables();
        
        // CÀI ĐẶT LÀ TRUE ĐỂ ĐƯỢC DUYỆT VÀ ĐI TIẾP
        processVariables.set("datChuan", true); 

        await taskService.complete(task, processVariables);
        console.log(" [AI]: Video hoàn hảo! Báo cáo True (Đạt chuẩn)!");
    }, 2000);
});

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