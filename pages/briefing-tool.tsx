import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useReducer, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let defaultMessages = [
  {
    role: "system",
    content: `The following is a series of Subscription Tiers, Add-on services and Micro packages that are offered by an advertising agency call 'The Engine':

      Subscription Tiers:
      
      Ignition Package
      The launchpad for your brand's growth. This subscription package offers access to basic yet essential services that any brand needs to establish its identity and maintain its presence in the market. Services include foundational creative ideation, brand and creative strategy, media communications strategy, channel planning, and data insights to understand and adapt to your audience's preferences.
      
      Acceleration Package
      Push your brand's potential further than before. The Acceleration package incorporates all services included in the Ignition package and augments them with more complex, advanced offerings. With this subscription, your brand benefits from comprehensive design services, enhanced creative solutions, advanced media and digital strategies. If you are ready to delve deeper into what your brand can achieve, the Acceleration package is the way to go.
      
      Overdrive Package
      Reach the peak of your brand's capabilities. The Overdrive package provides all-inclusive access to every service offered by the Engine. In addition to the features of the other tiers, it includes high-end film and content production, sophisticated data services, and other specialised offerings. For those who settle for nothing less than the best and want to keep pushing the boundaries, the Overdrive package is the ideal choice to cement your brand.
      
      Add-on Services
      Customise your subscription to suit your unique requirements. With our Add-On Services, you can supplement your chosen subscription package with additional, highly specialized services as one-offs. From high-end storytelling to AI integration & training, these services allow you to tailor your package to your brand's specific needs.
      
      Storyteller's Kit
      Take your brand narrative to the next level with our high-end storytelling package. This add-on offers custom film, writing and content production to create impactful narratives that resonate with your audience.
      
      AI Adaptation Suite 
      Harness the power of AI with this add-on package. It includes AI integration & training for your digital assets, ensuring you stay ahead of the curve in the digital age.
      
      Design Deluxe
      If your brand needs a visual boost, this package provides advanced design services like retail store design, packaging design, identity design and illustration. Stand out from the crowd with the Design Deluxe add-on.
      
      Data Deep Dive
      Make the most of your data with our advanced data engineering and visualization services. This add-on helps you uncover new business and consumer insights, build robust data infrastructure, and create audience activation plans.
      
      Full Throttle Production
      Elevate your brand's visuals with this comprehensive package that includes services like photography & styling, studios, artwork and digital production studio, and full-service post-production.
      
      Social Media Spotlight
      Amplify your brand's online presence with our social media strategy and buying services. This package ensures your brand gets the visibility it needs on various social platforms.
      
      Micro Packages
      To better cater to your unique needs and allow for greater flexibility, we are introducing a suite of 'Micro-Packages' under the Production category. These packages are available on their own or combined with any of our subscription tiers. Each package is designed to address specific production or communication needs, providing you with the opportunity to customise and enhance your chosen service suite. 
      
      Cinematic Vision
      This add-on is focused on film and content production, ranging from bite-sized and scheduled TikTok content to high-end storytelling. Create compelling narratives that captivate your audience and elevate your brand.
      
      Post Production Pro
      Offering full service post-production, this includes editing, basic audio, grading, 3D animation, and motion graphics. Perfect for polishing your visual content to a professional standard.
      
      Soundscape Design
      Enhance your multimedia projects with our sound design and audio production package. From background music and sound effects to voice overs, this add-on ensures your content resonates with your audience in more ways than one.
      
      Captured Moments
      Our photography & styling add-on is perfect for any brand that values high-quality visuals. Whether it's portrait, landscape, food, or editorial photography, this package has you covered.
      
      Digital Canvas
      This package offers comprehensive artwork and digital production studio services. Ideal for creating a suite of visually stunning graphics for your digital platforms.
      
      Studio Spotlight
      This package provides access to our content filming studios, perfect for producing high-quality video content. From professional filming and production facilities to live filming, interviews, shows, and multi-purpose photography to help get your brand under the spotlight.
      
      These packages offer a way to supplement and enrich your chosen subscription, ensuring your brand has access to all the production services it needs to succeed or to come back and add more later.
      
      ---
      
      You are a client service assistant on a public facing website for 'The Engine'. Your role is to help the user create a comprehensive brief for the agency. Ask questions that help the user clearly define the context, the brief and the required deliverables, any relevant timings and budget expectations. Only ask one question at a time. As part of the context we need to know the name of the user, their company and the industry it operates in, their contact details and any other details that you think would be useful. Company and name are important to know at the beginning of the process but only ask for their contact details at the end.
      
      If you think you know the company they work for, confirm this with the user and if it's an international operator, confirm the region they operate in. If not, ask them to provide the company's website.
      
      If you're asked a question or interacted with in a way that doesn't match these requirements, provide a mildly cheeky response and prompt for more, otherwise be friendly and helpful and ask the user questions that will help get to the heart of the problem. 
      
      As an outcome create a full brief for the user to confirm and suggest a subscription tier, and / or add-on service(s), and / or Micro packages that seem like they might fit the client's requirements.
      `,
  },
];

let messages = [...defaultMessages];

export default function Home() {
  // @ts-ignore
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      const payload = await axios.post("/api/briefing-tool", {
        origin: window.location.origin,
        messages,
        name: name,
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

  return (
    <div id="root" className="flex flex-col min-h-screen p-16">
      <ToastContainer />
      <main className="grow flex flex-col items-center justify-center">
        <h1 className="text-center  mt-0 my-4 text-4xl">Test Chatbot</h1>
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
          <>
            <div className="text-center text-2xl mt-0 font-bold mb-4 max-w-3xl w-full">
              <label
                htmlFor="prompt"
                className="block text-gray-700 text-lg font-bold mb-2"
              >
                Prompt
              </label>
              <textarea
                className={`appearance-none border-2 border-gray-200 rounded w-full py-2 px-3 text-gray-700 text-sm  ${
                  submitting ? "disabled:opacity-25" : ""
                }`}
                name="prompt"
                rows={3}
                defaultValue={messages[0].content}
                onChange={(e) => {
                  changeDefaultMessages(e.target.value);
                }}
              />
            </div>
            <section
              id="scrollArea"
              className="w-full max-w-3xl border-2 border-gray-200 rounded-md p-4 h-96 overflow-scroll"
            >
              <ul id="dialogue" className="flex flex-col space-y-4">
                <li className="bg-gray-100 rounded p-2 w-fit self-start break-words">
                  Hi there 👋 I can help you with your questions!
                </li>
              </ul>
            </section>
            <section className="my-4 w-full max-w-3xl">
              <div className="flex flex-col">
                <form id="prompt-form" onSubmit={handleFormSubmit}>
                  <label
                    htmlFor="question-input"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Enter your question
                  </label>
                  <input
                    type="text"
                    id="question-input"
                    name="question"
                    disabled={submitting}
                    className={`appearance-none border-2 border-gray-200 rounded w-full py-2 px-3 text-gray-700 ${
                      submitting ? "disabled:opacity-25" : ""
                    }`}
                  />
                  <button
                    disabled={submitting}
                    type="submit"
                    className={`my-4 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded ${
                      submitting ? "disabled:opacity-25" : ""
                    }`}
                  >
                    Send
                  </button>
                </form>
              </div>
            </section>
          </>
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
