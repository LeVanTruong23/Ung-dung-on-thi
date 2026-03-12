    const fileInput = document.getElementById("fileInput");
    const examList = document.getElementById("examList");
    const messageDiv = document.getElementById("message");
    const dropArea = document.getElementById("dropArea");
    const uploadBtn = document.getElementById("uploadBtn");


    function toggleTheme() {
      const body = document.body
      const btn = document.getElementById("themeBtn")

      body.classList.toggle("dark")

      if (body.classList.contains("dark")) {
        btn.textContent = "🌙"
        localStorage.setItem("theme","dark")
      } else {
        btn.textContent = "☀️"
        localStorage.setItem("theme","light")
      }
    }

    window.onload = function(){
      const btn = document.getElementById("themeBtn")

      if(localStorage.getItem("theme")==="dark"){
        document.body.classList.add("dark")
        btn.textContent="🌙"
      }else{
        btn.textContent="☀️"
      }
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
        updateUploadUI(null);        
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
            <button class="btn-start" style="background-color: #12a31e;"  onclick="startExam('${key}')">Bắt đầu</button>
            <button class="btn-delete" style="background-color: #ef4444;" onclick="deleteExam('${key}')">Xóa</button>
          </div>
        `;

        examList.appendChild(div);
      });
    }

    function startExam(id) {
      window.location.href = "quiz.html?exam=" + id;
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

   
  function updateUploadUI(file) {
      if (file) {
          uploadBtn.innerText = "Upload ngay 🚀";
          uploadBtn.style.backgroundColor = "var(--success)";
          document.getElementById("dropText").innerText = "📄 " + file.name;
      } else {
          uploadBtn.innerText = "Chọn đề";
          uploadBtn.style.backgroundColor = "var(--primary)";
          document.getElementById("dropText").innerText = "📂 Kéo thả file .docx vào đây hoặc bấm nút để chọn";
      }
  }

  uploadBtn.onclick = function() {
      if (fileInput.files.length > 0) {
          uploadExam();
      } else {
          fileInput.click();
      }
  };

  fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
          updateUploadUI(fileInput.files[0]);
      }
  });

  dropArea.addEventListener("dragover", e => {
      e.preventDefault();
      dropArea.style.borderColor = "var(--primary)";
      dropArea.style.backgroundColor = "rgba(79, 70, 229, 0.1)";
  });

  dropArea.addEventListener("dragleave", () => {
      e.preventDefault();
      dropArea.style.borderColor = "#94a3b8";
      dropArea.style.backgroundColor = "transparent";
  });

  dropArea.addEventListener("drop", e => {
      e.preventDefault();
      dropArea.style.borderColor = "#94a3b8";
      dropArea.style.backgroundColor = "transparent";

      const files = e.dataTransfer.files;
      if (files.length > 0) {
          fileInput.files = files; 
          updateUploadUI(files[0]);
          
          uploadExam(); 
      }
  });

    

    loadExams();