from docx import Document
import re
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# ✅ BẬT CORS (QUAN TRỌNG)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev thì để *, production thì đổi domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def parse_docx(file_path):
    doc = Document(file_path)
    questions = []
    current_q = None
    current_option = None
    option_buffer = ""

    def save_option():
        nonlocal current_q, current_option, option_buffer
        if current_q and current_option:
            current_q["options"][current_option] = option_buffer.strip()
        option_buffer = ""
        current_option = None

    def handle_paragraph(paragraph):
        nonlocal current_q, questions, current_option, option_buffer

        text = paragraph.text.strip()
        if not text:
            return

        if re.search(r'\bA[\.\):]\s*', text):
            if current_q:
                save_option()
                questions.append(current_q)

            current_q = {
                "text": text.split("A")[0].strip(),
                "options": {},
                "correct": None
            }

        for run in paragraph.runs:
            run_text = run.text.strip()
            if not run_text:
                continue

            match = re.match(r'([A-D])[\.\):]\s*(.*)', run_text)
            if match:
                save_option()
                current_option = match.group(1)
                option_buffer = match.group(2)

            elif current_option:
                option_buffer += " " + run_text

            if (run.bold or run.underline) and current_option:
                current_q["correct"] = current_option

    for para in doc.paragraphs:
        handle_paragraph(para)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    handle_paragraph(para)

    if current_q:
        save_option()
        if not current_q["correct"]:
            current_q["correct"] = "incorrect"
        questions.append(current_q)

    return questions


@app.post("/upload-exam")
async def upload_exam(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    questions = parse_docx(file_path)

    os.remove(file_path)  # ✅ xóa file tạm

    return {
        "message": "Upload & parse thành công",
        "total_questions": len(questions),
        "questions": questions
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)