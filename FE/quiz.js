  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get("exam");

  const storedExam = JSON.parse(localStorage.getItem(examId));

  if (!storedExam) {
    alert("Không tìm thấy đề!");
    window.location.href = "index.html";
  }

  let originalQuestions = JSON.parse(JSON.stringify(storedExam.questions));
  let questions = JSON.parse(JSON.stringify(storedExam.questions));
  let current = 0;
  let answers = {};
  let time = 0;
  let finished = false;

  const questionTitle = document.getElementById("questionTitle");
  const questionText = document.getElementById("questionText");
  const optionsDiv = document.getElementById("options");
  const navigatorDiv = document.getElementById("navigator");
  const timerDiv = document.getElementById("timer");
  const resultDiv = document.getElementById("result");
  window.onload = function() {
    renderQuestion();
  };

  setInterval(() => {
    if (!finished) { 
      time++;
      timerDiv.innerText = "Thời gian: " + time + "s";
    }
  }, 1000);

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
    if(document.querySelector(".theme-toggle")) 
      document.querySelector(".theme-toggle").innerText = "☀";
  }

  function renderQuestion() {
    const q = questions[current];
    if (!q) return;

    questionTitle.innerText = "Câu " + (current + 1);
    questionText.innerText = q.text;
    optionsDiv.innerHTML = "";

    Object.entries(q.options).forEach(([key, value]) => {
      const btn = document.createElement("div");
      btn.innerText = key + ". " + value;
      btn.className = "option";
      btn.onclick = () => selectAnswer(key);

      if (answers[current]) {
        if (key === q.correct) {
          btn.classList.add("correct");
        } else if (answers[current] === key) {
          btn.classList.add("wrong");
        }
      }
      optionsDiv.appendChild(btn);
    });

    renderNavigator();
  }

  function selectAnswer(key) {
    if (finished) return;

    if (answers[current]) return;

    answers[current] = key;
    renderQuestion();

    const answeredCount = Object.keys(answers).length;
    if (answeredCount === questions.length) {
      setTimeout(() => { finishExam(); }, 500);
      return;
    }

    setTimeout(() => {
      if (current < questions.length - 1) {
        current++;
        renderQuestion();
      }
    }, 400);
  }

  function nextQuestion() {
    if (current < questions.length - 1) {
      current++;
      renderQuestion();
    }
  }

  function prevQuestion() {
    if (current > 0) {
      current--;
      renderQuestion();
    }
  }

  function renderNavigator() {
    navigatorDiv.innerHTML = "";

    questions.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.innerText = i + 1;

    
      btn.style.color = "white";     
      btn.style.background = "#64748b"; 
      btn.style.padding = "8px";
      btn.style.margin = "2px";
      btn.style.border = "none";
      btn.style.borderRadius = "4px";
      btn.style.cursor = "pointer";

      if (i === current) {
          btn.style.boxShadow = "0 0 0 3px #f59e0b"; 
      }

      if (answers[i]) {
        btn.style.background =
          answers[i] === questions[i].correct
            ? "green"
            : "red";
      }

      btn.onclick = () => {
        current = i;
        renderQuestion();
      };

      navigatorDiv.appendChild(btn);
    });
  }

  function finishExam() {
    finished = true;
    let correct = 0; let wrong = 0; let unanswered = 0;
    questions.forEach((q, i) => {
      if (!answers[i]) { unanswered++; } 
      else if (answers[i] === q.correct) { correct++; } 
      else { wrong++; }
    });

    const percent = ((correct / questions.length) * 100).toFixed(1);
    resultDiv.innerHTML = `
      <div class="result-box">
        <h3>📊 KẾT QUẢ BÀI THI</h3>
        <p>✅ Số câu đúng: <strong>${correct}</strong></p>
        <p>❌ Số câu sai: <strong>${wrong}</strong></p>
        <p>⚠️ Chưa làm: <strong>${unanswered}</strong></p>
        <p>🎯 Tỷ lệ đúng: <strong>${percent}%</strong></p>
        <p>⏱ Thời gian làm bài: <strong>${time}s</strong></p>
        <button onclick="redoWrong()" style="background:#f97316">🔁 Làm lại câu sai</button>
        <button onclick="restartFullExam()" style="background:#ef4444">🔄 Làm lại toàn bộ bài</button>
      </div>
    `;
  }

  function continueExam() {
    finished = false;
    resultDiv.innerHTML = "";
    for (let i = 0; i < questions.length; i++) {
      if (!answers[i]) {
        current = i;
        renderQuestion();
        return;
      }
    }
    alert("Bạn đã làm hết tất cả câu hỏi!");
  }

  function restartExam() {
      answers = {}; current = 0; time = 0;
      resultDiv.innerHTML = "";
      renderQuestion();
    }

    function retryWrong() {
      questions = questions.filter((_, i) => answers[i] !== storedExam.questions[i].correct);
      answers = {}; current = 0;
      resultDiv.innerHTML = "";
      renderQuestion();
    }

    function goHome() {window.location.href = "index.html";}

    function redoWrong() {
      finished = false;
      questions = originalQuestions.filter((q, i) => { return answers[i] !== q.correct; });
      answers = {}; current = 0;
      resultDiv.innerHTML = "";
      if (questions.length === 0) {
        alert("Không có câu sai để làm lại 🎉");
        return;
      }
      renderQuestion();
    }

    function restartFullExam() {
      finished = false;
      questions = [...originalQuestions];
      answers = {}; current = 0; time = 0;
      resultDiv.innerHTML = "";
      renderQuestion();
    }

    function shuffleQuestions() {
      if (finished) { alert("Không thể xáo trộn khi đã kết thúc bài!"); return; }
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      current = 0; answers = {}; resultDiv.innerHTML = "";
      renderQuestion();
      alert("Đã xáo trộn câu hỏi 🔀");
    }

    function restoreOriginal() {
      if (finished) { alert("Không thể đổi đề khi đã kết thúc!"); return; }
      questions = JSON.parse(JSON.stringify(originalQuestions));
      answers = {}; current = 0; resultDiv.innerHTML = "";
      renderQuestion();
      alert("Đã khôi phục đề gốc 📘");
    }

    function shuffleAnswers() {
      if (finished) { alert("Không thể xáo trộn khi đã kết thúc bài!"); return; }
      questions.forEach(q => {
        const entries = Object.entries(q.options);
        for (let i = entries.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [entries[i], entries[j]] = [entries[j], entries[i]];
        }
        const newOptions = {};
        const keys = ["A", "B", "C", "D"];
        let newCorrect = "";
        entries.forEach((item, index) => {
          const newKey = keys[index];
          newOptions[newKey] = item[1];
          if (item[0] === q.correct) { newCorrect = newKey; }
        });
        q.options = newOptions; q.correct = newCorrect;
      });
      answers = {}; current = 0; resultDiv.innerHTML = "";
      renderQuestion();
      alert("Đã xáo trộn đáp án 🔀");
    }

    renderQuestion();