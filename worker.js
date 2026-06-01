import { Client, logger, Variables } from "camunda-external-task-client-js";

const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger };
const client = new Client(config);

console.log("--- BOT ĐÃ SẴN SÀNG - RIÊNG BƯỚC PHÂN LOẠI SẼ ĐỢI ADMIN ---");

// 1. BOT XỬ LÝ KHI GIẢNG VIÊN/IT LÀM XONG

client.subscribe("xac_nhan_tu_dong", async function ({ task, taskService }) {
  console.log(
    "--- [BOT] Đang kiểm tra kết quả... Tự động xác nhận ĐÃ GIẢI QUYẾT. ---",
  );

  const processVariables = new Variables();
  processVariables.set("resolved", true); // Tạo biến resolved

  await taskService.complete(task, processVariables);
  console.log(
    "--- [BOT] Đã tạo biến resolved = true. Đang chuyển sang Lưu trữ. ---",
  );
});

// 2. BOT LƯU TRỮ THÔNG TIN
client.subscribe("luu_tru_thong_tin", async function ({ task, taskService }) {
  console.log("--- [BOT] Đang dọn dẹp và lưu trữ dữ liệu vào hệ thống... ---");
  await taskService.complete(task);
  console.log("--- [BOT] Lưu trữ hoàn tất. ---");
});

// 3. BOT THÔNG BÁO KẾT QUẢ
client.subscribe("thong_bao_ket_qua", async function ({ task, taskService }) {
  console.log("--- [BOT] Đang gửi thông báo thành công cho Học viên... ---");
  await taskService.complete(task);
  console.log("--- [BOT] QUY TRÌNH KẾT THÚC HOÀN HẢO! ---");
});
