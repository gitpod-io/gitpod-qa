# This is the first simple example from the blog post that processes data
# from Wikipedia and does not use orchestration

from langchain.chains.qa_with_sources import load_qa_with_sources_chain
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.docstore.document import Document
from langchain.vectorstores.faiss import FAISS
from langchain.llms import OpenAI
import gradio as gr
import requests
import pickle

def get_wiki_data(title, first_paragraph_only):
    url = f"https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=1&titles={title}"
    if first_paragraph_only:
        url += "&exintro=1"
    data = requests.get(url).json()
    return Document(
        page_content=list(data["query"]["pages"].values())[0]["extract"],
        metadata={"source": f"https://en.wikipedia.org/wiki/{title}"},
    )


sources = [
    get_wiki_data("Unix", False),
    get_wiki_data("Microsoft_Windows", False),
    get_wiki_data("Linux", False),
    get_wiki_data("London", False),
    get_wiki_data("Python_(programming_language)", False),
]

def search_index(source_docs):
    source_chunks = []
    splitter = CharacterTextSplitter(separator=" ", chunk_size=1024, chunk_overlap=0)
    for source in source_docs:
        for chunk in splitter.split_text(source.page_content):
            source_chunks.append(Document(page_content=chunk, metadata=source.metadata))

    with open("search_index.pickle", "wb") as f:
        pickle.dump(FAISS.from_documents(source_chunks, OpenAIEmbeddings()), f)

chain = load_qa_with_sources_chain(OpenAI(temperature=0))

def print_answer(question):
    with open("search_index.pickle", "rb") as f:
        search_index = pickle.load(f)

    result = chain(
        {
            "input_documents": search_index.similarity_search(question, k=4),
            "question": question,
        },
        return_only_outputs=True,
    )

    return result["output_text"]


def gradio_ui():
    question_input = gr.Textbox(label = "Question about Unix, Windows, Linux, London, or Python")
    output = gr.Textbox(label = "Output")

    site = gr.Interface(fn=print_answer, inputs=[question_input], outputs=[output])
    site.launch()

print("ran")

gradio_ui()