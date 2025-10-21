import json
from pathlib import Path

import fitz 
from langchain_text_splitters import RecursiveCharacterTextSplitter


class Chunker:
    def __init__(self, pdf_path, chunk_size=1000, chunk_overlap=200, output_dir="chunks"):
        self.pdf_path = Path(pdf_path)
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n\n", "\n\n", "\n", ". ", " ", ""]
        )
    
    def extract_text_from_pdf(self):
        doc = fitz.open(self.pdf_path)
        pages_data = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            
            pages_data.append({
                "page_number": page_num + 1,
                "text": text,
                "char_count": len(text),
                "word_count": len(text.split())
            })
            
            if (page_num + 1) % 100 == 0:
                print(f"{page_num + 1} pages...")
        
        doc.close()
        return pages_data
    
    def clean_text(self, text):
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return '\n'.join(lines)
    
    def chunk_pages(self, pages_data):
        all_chunks = []
        chunk_id = 0
        
        for page_data in pages_data:
            text = self.clean_text(page_data["text"])
            if not text:
                continue
            
            for i, chunk in enumerate(self.text_splitter.split_text(text)):
                all_chunks.append({
                    "chunk_id": chunk_id,
                    "page_number": page_data["page_number"],
                    "chunk_index_on_page": i,
                    "text": chunk,
                    "char_count": len(chunk),
                    "word_count": len(chunk.split()),
                })
                chunk_id += 1
        
        print(f"{len(all_chunks)} chunks")
        return all_chunks
        
    def save_chunks(self, chunks):
        with open(self.output_dir / "chunks.json", 'w', encoding='utf-8') as f:
            json.dump(chunks, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(chunks)} chunks")
    
    def process(self):
        pages_data = self.extract_text_from_pdf()
        chunks = self.chunk_pages(pages_data)
        self.save_chunks(chunks)
        return chunks

if __name__ == "__main__":
    pdf_path = Path(__file__).parent / "dsm5.pdf"
    chunker = Chunker(
        pdf_path=str(pdf_path),
        chunk_size=2000,
        chunk_overlap=300,
        output_dir=str(pdf_path.parent / "chunks")
    )
    chunker.process()

