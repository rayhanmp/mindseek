import json
from pathlib import Path
import weaviate
from weaviate.classes.config import Configure, Property, DataType
from tqdm import tqdm

WEAVIATE_COLLECTION = "dsm5"
CHUNKS_FILE = "data/chunks/chunks.json"
ROOT = Path(__file__).parent.parent

def create_collection(client):
    if client.collections.exists(WEAVIATE_COLLECTION):
        client.collections.delete(WEAVIATE_COLLECTION)
    
    client.collections.create(
        name=WEAVIATE_COLLECTION,
        vector_config=Configure.Vectors.text2vec_openai(
            model="text-embedding-3-large",
            dimensions=3072,
            vectorize_collection_name=False,
        ),
        properties=[
            Property(name="text", data_type=DataType.TEXT, skip_vectorization=False),
            Property(name="chunk_id", data_type=DataType.INT, skip_vectorization=True),
            Property(name="page_number", data_type=DataType.INT, skip_vectorization=True),
            Property(name="chunk_index_on_page", data_type=DataType.INT, skip_vectorization=True),
            Property(name="char_count", data_type=DataType.INT, skip_vectorization=True),
            Property(name="word_count", data_type=DataType.INT, skip_vectorization=True),
        ]
    )

def load_chunks():
    chunks_path = ROOT / CHUNKS_FILE
    with open(chunks_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def ingest_chunks(client, chunks):
    collection = client.collections.use(WEAVIATE_COLLECTION)
    with collection.batch.dynamic() as batch:
        for chunk in tqdm(chunks, desc="Ingesting chunks"):
            batch.add_object(
                properties={
                    "text": chunk["text"],
                    "chunk_id": chunk["chunk_id"],
                    "page_number": chunk["page_number"],
                    "chunk_index_on_page": chunk["chunk_index_on_page"],
                    "char_count": chunk["char_count"],
                    "word_count": chunk["word_count"],
                }
            )
    
    failed_objects = collection.batch.failed_objects
    if failed_objects:
        print(f"Number of failed imports: {len(failed_objects)}")
        print(f"First failed object: {failed_objects[0]}")

if __name__ == "__main__":
    client = weaviate.connect_to_local()
    try:
        create_collection(client)
        chunks = load_chunks()
        ingest_chunks(client, chunks)
        
        collection = client.collections.get(WEAVIATE_COLLECTION)
        count = collection.aggregate.over_all(total_count=True)
        print(f"Total objects in collection: {count.total_count}")
    finally:
        client.close()