from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
import asyncio
import json
import logging
from typing import AsyncGenerator
import weaviate
from langchain_weaviate import WeaviateVectorStore
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import os

router = APIRouter()
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str

    @field_validator('message')
    def must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty or whitespace')
        return v

async def generate_rag_response(msg: str) -> AsyncGenerator[str, None]:
    client = None
    try:
        client = weaviate.connect_to_local()
        emb = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=3072)
        store = WeaviateVectorStore(client=client, index_name="dsm5", text_key="text", embedding=emb)
        
        docs = store.similarity_search_with_relevance_scores(msg, k=3, score_threshold=0.7)
        logger.debug("Retrieved %d docs above threshold 0.5 for query: %s", len(docs), msg)
        if docs:
            logger.debug("Scores: %s", [f"{score:.3f}" for _, score in docs])

        if not docs:
            yield f"data: {json.dumps({'content': 'No relevant DSM-5 context found for that question.'})}\n\n"
            yield "data: [DONE]\n\n"
            return

        ctx = "\n\n".join([doc.page_content for doc, _ in docs])
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, streaming=True)
        msgs = [
            SystemMessage(content="You are a mental health AI assistant using DSM-5 criteria. Provide accurate, professional responses."),
            HumanMessage(content=f"DSM-5 Context:\n{ctx}\n\nQuestion: {msg}\n\nAnswer based on the DSM-5 context above.")
        ]
        
        async for chunk in llm.astream(msgs):
            if chunk.content:
                yield f"data: {json.dumps({'content': chunk.content})}\n\n"
        
        yield "data: [DONE]\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'content': f'Error: {str(e)}'})}\n\n"
        yield "data: [DONE]\n\n"
    finally:
        if client:
            client.close()

@router.post("/chat/stream")
async def chat_stream_with_rag(request: ChatRequest):
    return StreamingResponse(
        generate_rag_response(request.message),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )