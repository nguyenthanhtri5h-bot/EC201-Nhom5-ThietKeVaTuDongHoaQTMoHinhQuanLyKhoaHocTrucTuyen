const { Client, logger, Variables } = require('camunda-external-task-client-js');
const axios = require('axios'); // Thêm thư viện gọi API

const config = { baseUrl: 'http://localhost:8082/engine-rest', use: logger };
const client = new Client(config);

// --- BẢNG ĐIỀU KHIỂN CẤU HÌNH AI ---
const GEMINI_API_KEY = `NHAP_KEY_CUA_BAN_VAO_DAY`; 

// Đã thiết lập sẵn bản 3.5 Flash mới nhất
const AI_MODEL = "gemini-3.5-flash"; 
// -----------------------------------

// 1. Topic: check-condition (Đã cấy thêm AI)
client.subscribe('check-condition', async function({ task, taskService }) {
    console.log("🤖 [Worker]: Đang nhận thông tin, chuẩn bị gọi AI...");

    // 1. Lấy dữ liệu từ Form
    const luaChon = task.variables.get('loai_khoa'); 
    const mucTieu = task.variables.get('muc_tieu_hoc') || "Em muốn học khóa này để ra trường đúng hạn.";
    const hoTen = task.variables.get('ho_ten') || "Học viên";  

    console.log(`👤 Đang xử lý hồ sơ ghi danh của: [${hoTen}]`);

    // 2. Logic rẽ nhánh
    let isPaid = false;
    if (luaChon === 'paid') {
        isPaid = true;
    }
    console.log(`📡 Học viên chọn loại khóa: [${luaChon}] -> co_phi = ${isPaid}`);

    try {
        // 3. Gọi AI đánh giá sự quyết tâm (URL tự động cập nhật theo biến AI_MODEL ở trên)
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await axios.post(
            apiURL,
            {
                contents: [{ parts: [{ text: `Đánh giá mức độ quyết tâm của học viên qua câu sau: "${mucTieu}". Trả lời ngắn gọn trong 1 câu.` }] }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        // Lấy câu trả lời của AI
        const aiResult = response.data.candidates[0].content.parts[0].text.trim();
        console.log(`✅ [Gemini Trả về]: ${aiResult}`);

        // 4. Gửi cả 2 biến về cho Camunda
        const processVariables = new Variables()
            .set("co_phi", isPaid)
            .set("danh_gia_ai", aiResult);

        await taskService.complete(task, processVariables);
        console.log("➡️ Đã hoàn thành Task xác thực và lưu kết quả AI về hệ thống.");
    } catch (error) {
        // In ra lỗi chi tiết nếu có
        const chiTietLoi = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error("❌ Lỗi gọi AI:", chiTietLoi);
        
        // Cơ chế dự phòng: Vẫn cho token chạy tiếp nhánh nếu AI sập
        const processVariables = new Variables()
            .set("co_phi", isPaid)
            .set("danh_gia_ai", "Lỗi kết nối AI - Cần duyệt thủ công");
            
        await taskService.complete(task, processVariables);
        console.log("➡️ (Dự phòng) Đã hoàn thành Task xác thực để hệ thống đi tiếp.");
    }
});

// 2. Topic: init-payment
client.subscribe('init-payment', async function({ task, taskService }) {
    console.log("💳 [Worker]: Đang kết nối cổng Stripe/Ngân hàng...");

    const tileThanhCong = Math.random() > 0.2; 
    const processVariables = new Variables();
    processVariables.set("thanh_toan", tileThanhCong); 

    await taskService.complete(task, processVariables);

    if (tileThanhCong) {
        console.log("✅ [Worker]: Thanh toán XÁC NHẬN thành công!");
    } else {
        console.log("❌ [Worker]: Thanh toán BỊ TỪ CHỐI (Giả lập lỗi).");
    }
});

// 3. Topic: grant-access
client.subscribe('grant-access', async function({ task, taskService }) {
    console.log("🎓 [Worker]: Đang cấp quyền truy cập...");
    await taskService.complete(task);
});