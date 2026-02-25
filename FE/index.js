<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>EduQuiz</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <div class="container">
    <h1>EduQuiz</h1>

    <div class="upload-box">
      <input type="file" id="fileInput">
      <button onclick="uploadExam()">Upload</button>
    </div>

    <h2>Danh sách đề</h2>
    <div id="examList"></div>
  </div>

  <script src="script.js"></script>
</body>
</html>