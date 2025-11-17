import weaviate
from dotenv import load_dotenv
from langchain_weaviate import WeaviateVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict
from pydantic import BaseModel

load_dotenv()

client = weaviate.connect_to_local()
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=3072)
store = WeaviateVectorStore(client=client, index_name="dsm5", text_key="text", embedding=embeddings)
retriever = store.as_retriever()
llm = ChatOpenAI(model="gpt-5-nano", temperature=0)

class State(TypedDict):
    question: str
    context: str
    answer: str
    sources: list

class RouteQuery(BaseModel):
    needs_retrieval: bool

def route_question(state: State):
    prompt = ChatPromptTemplate.from_template("Does this need DSM-5 lookup? {question} If the question is not related to mental health, such as banter, jokes, etc., return false.")
    result = (prompt | llm.with_structured_output(RouteQuery)).invoke(state)
    return "retrieve" if result.needs_retrieval else "direct_answer"

def retrieve(state: State):
    docs = retriever.invoke(state["question"])
    context = "\n\n".join([doc.page_content for doc in docs])
    sources = [f"Page {doc.metadata.get('page_number', 'N/A')}" for doc in docs]
    return {"context": context, "sources": sources}

def generate_answer(state: State):
    if state.get("context"):
        prompt = ChatPromptTemplate.from_template("Your name is mindseek, a helpful assistant for mental health. Answer using context. Be concise.  Do not add further follow up questions.\n\nContext: {context}\nQuestion: {question}")
        answer = (prompt | llm | StrOutputParser()).invoke({"context": state["context"], "question": state["question"]})
    else:
        prompt = ChatPromptTemplate.from_template("Your name is mindseek, a helpful assistant for mental health. Answer concisely.\n\nQuestion: {question}")
        answer = (prompt | llm | StrOutputParser()).invoke({"question": state["question"]})
    return {"answer": answer}

workflow = StateGraph(State)
workflow.add_node("retrieve", retrieve)
workflow.add_node("generate", generate_answer)
workflow.add_conditional_edges(START, route_question, {"retrieve": "retrieve", "direct_answer": "generate"})
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", END)

graph = workflow.compile()

if __name__ == "__main__":
    result = graph.invoke({"question": "Hi! How are you? What's your name?"})
    print(result["answer"])
    if result.get("sources"):
        print(f"\nSources: {', '.join(set(result['sources']))}")
    client.close()
