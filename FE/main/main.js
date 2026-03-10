const fileInput = document.getElementById("fileInput");
    const examList = document.getElementById("examList");
    const messageDiv = document.getElementById("message");
    const dropArea = document.getElementById("dropArea");
    const uploadBtn = document.getElementById("uploadBtn");


    function toggleTheme() {
      document.body.classList.toggle("dark");

      const btn = document.querySelector(".theme-toggle");
      if (document.body.classList.contains("dark")) {
        btn.innerText = "☀";
        localStorage.setItem("theme", "dark");
      } else {
        btn.innerText = "🌙";
        localStorage.setItem("theme", "light");
      }
    }


    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      document.querySelector(".theme-toggle").innerText = "☀";
    }


    async function uploadExam() {
      const file = fileInput.files[0];

      if (!file) {
        showMessage("Vui lòng chọn file .docx", "error");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://127.0.0.1:8000/upload-exam", {
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          throw new Error("Upload thất bại");
        }

        const data = await res.json();

        const examData = {
          name: file.name,
          total: data.total_questions,
          questions: data.questions
        };

        localStorage.setItem("exam_" + file.name, JSON.stringify(examData));

        showMessage("Upload thành công ✔", "success");
        fileInput.value = "";
        loadExams();

      } catch (error) {
        showMessage("Lỗi: " + error.message, "error");
      }
    }

    function loadExams() {
      examList.innerHTML = "";

      const keys = Object.keys(localStorage).filter(key => key.startsWith("exam_"));

      if (keys.length === 0) {
        examList.innerHTML = `<div class="empty">Chưa có đề nào.</div>`;
        return;
      }

      keys.forEach(key => {
        const exam = JSON.parse(localStorage.getItem(key));

        const div = document.createElement("div");
        div.className = "exam-card";

        div.innerHTML = `
          <div>
            <strong>${exam.name}</strong><br>
            <small>${exam.total} câu hỏi</small>
          </div>
          <div class="exam-actions">
            <button class="btn-start" onclick="startExam('${key}')">Bắt đầu</button>
            <button class="btn-delete" onclick="deleteExam('${key}')">Xóa</button>
          </div>
        `;

        examList.appendChild(div);
      });
    }

    function startExam(id) {
      window.location.href = `quiz.html?exam=${id}`;
    }

    function deleteExam(id) {
      if (confirm("Bạn chắc chắn muốn xóa đề này?")) {
        localStorage.removeItem(id);
        loadExams();
      }
    }

    function showMessage(text, type) {
      messageDiv.className = "message " + type;
      messageDiv.innerText = text;
    }

    uploadBtn.onclick = handleUpload;

    function handleUpload() {

      if (!fileInput.files.length) {
        fileInput.click(); 
        return;
      }

      uploadExam();
    }

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length) {
        uploadBtn.innerText = "Upload đề";
        document.getElementById("dropText").innerText =
          "📄 " + fileInput.files[0].name;
      }
    });


    dropArea.addEventListener("dragover", e => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    });


    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("dragover");
    });


    dropArea.addEventListener("drop", e => {
      e.preventDefault();
      dropArea.classList.remove("dragover");

      const files = e.dataTransfer.files;

      if (files.length) {
        fileInput.files = files;
        uploadBtn.innerText = "Upload đề";
        document.getElementById("dropText").innerText =
          "📄 " + files[0].name;
      }
    });

    loadExams();