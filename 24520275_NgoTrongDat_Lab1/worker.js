const { Client, logger, Variables } = require("camunda-external-task-client-js");
const client = new Client({ baseUrl: "http://localhost:8080/engine-rest", use: logger });

// Topic name PHẢI khớp với Modeler
client.subscribe("Kiểm tra lại kết quả", async function({ task, taskService }) {
  const processVariables = new Variables();

  // Định nghĩa các biến mà sơ đồ của bạn đang chờ đợi
  processVariables.set("isCorrect", true); 
  processVariables.set("confirmed", true); // Khắc phục lỗi ở image_f8fe44.png

  await taskService.complete(task, processVariables);
});