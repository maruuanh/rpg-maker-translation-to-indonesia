from openai import OpenAI # type: ignore
import re
import os
from typing import List
import json
from fastapi import FastAPI, UploadFile, File # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from dotenv import load_dotenv # type: ignore

load_dotenv()

app = FastAPI()

client = OpenAI(
  api_key= os.getenv("OPENAI_API_KEY")
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

def extract_translatable_values(obj, path=None, found=None):
  if path is None:
    path = []
  if found is None:
    found = []

  if isinstance(obj, dict):
    if obj.get("code") == 401 and "parameters" in obj:
      found.append((path + ["parameters"], obj["parameters"]))
    for k, v in obj.items():
      extract_translatable_values(v, path + [k], found)
  elif isinstance(obj, list):
    for i, item in enumerate(obj):
      extract_translatable_values(item, path + [i], found)
    
  return found

def translate_text(jp_text):
  prompt = f"""Terjemahkan kalimat berikut dari bahasa Jepang ke bahasa Indonesia: :\n\n{jp_text} 
  dengan gaya bahasa yang casual. Jika kata tersebut memiliki potongan karSakter berikut: '\\TRN[n nomor]', jangan hilangkan karakter itu. 
  Cukup berikan hasil terjemahannya saja dengan format seperti berikut: '\\TRN[251]Sepertinya kuncinya terkunci' jika terdapat 'TRN' dan 'Jam buka「\\FACTIME[5]' jika tidak ada 'TRN'"""
  completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
      {
        "role": "user",
        "content": prompt
      }
    ]
  )
  return completion.choices[0].message.content

def set_by_path(obj, path, value):
  for p in path[:-1]:
    obj = obj[p]  
  lastKey = path[-1]

  

  if isinstance(obj, dict):
    obj[str(lastKey)] = value
  elif isinstance(obj, list) and isinstance(lastKey, int):
    obj[lastKey] = value

@app.get("/")
def read_root():
  return {"Hello": "World"}

@app.post("/translate")
async def read_translate(files: list[UploadFile] = File(...)):
  contents = []
  for file in files:
    translatedFileName = file.filename.split(".")
    name, format = translatedFileName
    raw_data = await file.read()
    try:
      data = json.loads(raw_data.decode("utf-8"))
    except json.JSONDecodeError:
      return {"error": f"File {file.filename} bukan JSON valid"}
    to_translate = extract_translatable_values(data)
    for path, jp_text in to_translate:
      translate_result = translate_text(jp_text)
      set_by_path(data, path, translate_result)
    contents.append({
      "filename": f"{name}_translated.{format}",
      "content": json.dumps(data, ensure_ascii=False, indent=2)
    })
  return {"files": contents}
