import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let defaultMessages = [
  {
    role: "system",
    content:
      "You are a helpful, empathetic, and friendly customer support specialist. You are here to help customers with their queries. Additionally, you never ask the customer to upload or provide any photos as our website has no means of doing so at this time. Also, do not mention that you are a bot.",
  },
];

let messages = [...defaultMessages];

interface HomeProps {
  sites: string[];
}

export default function Home({ sites }: HomeProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [site, setSite] = useState(sites[0]);

  function changeDefaultMessages(newContent: string) {
    defaultMessages[0].content = newContent;
    messages[0].content = newContent;
  }

  // handle when the user submits a question through the form
  async function handleSubmitMessage(message: any) {
    // add the user's question to the DOM
    addUserMessageToDialogueBox(message);

    // add to users global messages array
    messages.push({ role: "user", content: message });
    try {
      // send fetch request to our backend endpoint
      const payload = await axios.post("/api/openai", {
        origin: window.location.origin,
        messages,
        name: site,
      });
      // return the response
      return payload;
    } catch (ex) {
      return null;
    }
  }

  // add the user's question to the dialogue box
  function addUserMessageToDialogueBox(message: any) {
    // create a new li element
    const userMessage = document.createElement("li");

    // add user-specific styling to element
    userMessage.classList.add(
      "bg-indigo-500",
      "text-white",
      "rounded",
      "p-2",
      "w-fit",
      "self-end",
      "break-words"
    );

    // add the user's message to the element
    userMessage.innerText = message;

    // add the li element to the DOM
    // @ts-ignore
    document.getElementById("dialogue").appendChild(userMessage);

    // clear the input for the next question
    // @ts-ignore
    document.getElementById("question-input").value = "";

    // display loading indicator in dialogue box
    addLoadingIndicatorToDialogueBox();

    // @ts-ignore
    document.getElementById("scrollArea").scroll({
      // @ts-ignore
      top: document.getElementById("scrollArea").scrollHeight,
      behavior: "smooth",
    });
  }

  // add the loading indicator to the dialogue box
  function addLoadingIndicatorToDialogueBox() {
    // create a new li element
    const loadingIndicator = document.createElement("li");

    // set the id of the loading indicator
    loadingIndicator.id = "loading-indicator";
    loadingIndicator.innerText = "......";

    // add loading indicator styling
    loadingIndicator.classList.add(
      "bg-gray-500",
      "text-white",
      "rounded",
      "p-2",
      "w-fit",
      "self-start",
      "w-12",
      "animate-pulse"
    );
    // add the li element to the DOM
    // @ts-ignore
    document.getElementById("dialogue").appendChild(loadingIndicator);
  }

  // remove the loading indicator from the dialogue box
  function removeLoadingIndicatorFromDialogueBox() {
    // get the loading indicator element
    const loadingIndicator = document.getElementById("loading-indicator");

    // remove the loading indicator from the DOM
    // @ts-ignore
    loadingIndicator.remove();
  }

  // add the chatbot's response to the dialogue box
  function addBotMessageToDialogueBox(response: any) {
    // remove the loading indicator now that the response has been received
    removeLoadingIndicatorFromDialogueBox();

    // create a new li element
    const botMessage = document.createElement("li");

    // style the bot response element based on the status
    if (!response || response?.status === "error") {
      if (response && response.message) {
        toast.error(response.message);
      }
      // add error styling
      botMessage.classList.add(
        "bg-red-500",
        "text-white",
        "rounded",
        "p-2",
        "w-fit",
        "self-start"
      );

      // add error text
      botMessage.innerText = `Oh no! Something went wrong. Please try again or reload the page and try again soon.`;

      // remove last message
      messages.splice(messages.length - 1, 1);
    } else {
      // add user-specific styling to element
      botMessage.classList.add(
        "bg-gray-500",
        "text-white",
        "rounded",
        "p-2",
        "w-fit",
        "self-start"
      );

      // add the user's response to the element
      botMessage.innerText = response.data.answer.trim();

      // ensure the messages array is updated
      messages = response.data.messages;
    }

    // add the li element to the DOM
    // @ts-ignore
    document.getElementById("dialogue").appendChild(botMessage);

    // clear the input for the next response
    // @ts-ignore
    document.getElementById("question-input").value = "";

    // @ts-ignore
    document.getElementById("scrollArea").scroll({
      // @ts-ignore
      top: document.getElementById("scrollArea").scrollHeight,
      behavior: "smooth",
    });
  }

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    if (submitting) {
      return;
    }
    // @ts-ignore
    const message = document.getElementById("question-input").value;
    // input validation
    if (!message) {
      return alert("Please enter your question");
    }
    setSubmitting(true);
    try {
      // call the function that handles the fetch request to our backend
      handleSubmitMessage(message).then((response) => {
        // add the chatbot's response to the DOM when the fetch request is complete
        addBotMessageToDialogueBox(response?.data || null);
        setSubmitting(false);
      });
    } catch (ex) {
      setSubmitting(false);
    }
  };

  const handleSelectChange = (value: string) => {
    setSite(value);
    messages = [...defaultMessages];
    // @ts-ignore
    document.getElementById(
      "dialogue"
    ).innerHTML = `<li class="bg-gray-100 rounded p-2 w-fit self-start break-words">
    Hi there 👋 I can help you with your questions!
  </li>`;
    // clear the input for the next response
    // @ts-ignore
    document.getElementById("question-input").value = "";
    // @ts-ignore
    document.getElementById("scrollArea").scroll({
      // @ts-ignore
      top: document.getElementById("scrollArea").scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div id="root" className="flex flex-col min-h-screen p-16">
      <ToastContainer />
      <main className="grow flex flex-col items-center justify-center">
        <h1 className="text-center  mt-0 my-4 text-4xl">
          OpenAI Chatbot Example
        </h1>
        {loading && (
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
        {!loading && (
          <div className="text-center text-2xl mt-0 font-bold mb-4">
            <div className="flex flex-col">
              {sites.map((x) => {
                return (
                  <Link
                    href={`/site/${x}`}
                    key={x}
                    className="text-blue-500 font-normal"
                  >
                    {x}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <br />
        <div>
          <Link
            href="/crawl"
            className="text-blue-500"
            style={{ marginRight: "15px" }}
          >
            Crawl Webpage
          </Link>

          <Link href="/file" className="text-blue-500">
            Upload File Example
          </Link>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/api/list`);
  const data = await res.json();
  return {
    props: {
      sites: data?.sites || [],
    },
  };
}
