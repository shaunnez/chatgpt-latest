import { FormEvent, useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Crawl() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [results, setResults] = useState(null as any);

  const validateUrl = (url: string) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateUrl(url) || !name) {
      toast.error("Please enter a valid URL and name");
      return;
    }
    setSubmitting(true);
    toast.info(
      "Crawling has started. Please come back and check the results in a few minutes. "
    );
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crawl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, url }),
      });
      const results = await res.json();
      if (results.data) {
        toast.success("Crawling has finished.");
      }
    } catch (ex) {
      toast.error("Something went wrong. Please try again later.");
    }
    setSubmitting(false);
  };

  return (
    <div id="root" className="flex flex-col min-h-screen p-16">
      <ToastContainer />
      <main className="grow flex flex-col items-center justify-center">
        <h1 className="text-center mt-0 my-4 text-4xl">OpenAI Crawler</h1>
        <div className="max-w-3xl mx-auto m-8 space-y-8 text-gray-800">
          <div className="">
            Please enter in a URL to crawl and we will use OpenAI embeddings and
            GPT to find answers from
          </div>
          <section className="my-4 w-full max-w-3xl">
            <form
              id="form"
              onSubmit={handleFormSubmit}
              className="flex flex-row"
            >
              <input
                placeholder="e.g. nimblecat"
                type="text"
                name="name"
                id="name"
                className={`appearance-none border-2 border-gray-200 rounded w-full py-2 px-3  text-gray-700 ${
                  submitting ? "disabled:opacity-25" : ""
                }`}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <input
                placeholder="e.g. https://www.nimblecat.co.nz"
                type="text"
                name="url"
                id="url"
                className={`appearance-none border-2 border-gray-200 rounded w-full py-2 px-3 mx-2 text-gray-700 ${
                  submitting ? "disabled:opacity-25" : ""
                }`}
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                className={` bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded ${
                  submitting ? "disabled:opacity-25" : ""
                }`}
              >
                Crawl
              </button>
            </form>
          </section>
        </div>

        <br />
        <br />
        <Link href="/" className="text-blue-500">
          Chatbot Example
        </Link>
      </main>
    </div>
  );
}
