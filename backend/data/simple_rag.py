import weaviate
from dotenv import load_dotenv
from langchain_weaviate import WeaviateVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

client = weaviate.connect_to_local()
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=3072)

store = WeaviateVectorStore(
    client=client,
    index_name="dsm5",
    text_key="text",
    embedding=embeddings,
)

retriever = store.as_retriever()

template = """Answer the question using the context. Be concise.

Question: {question}
Context: {context}
Answer:"""

prompt = ChatPromptTemplate.from_template(template)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

if __name__ == "__main__":
    answer = rag_chain.invoke("What is bipolar II disorderand whats the code for it?")
    print(answer)
    client.close() 