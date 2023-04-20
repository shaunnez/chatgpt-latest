import { useState } from "react";

import FileQandAArea from "../components/FileQandAArea";
import { FileLite } from "../types/file";
import FileUploadArea from "../components/FileUploadArea";
import Link from "next/link";

export default function FileQandA() {
  const [files, setFiles] = useState<FileLite[]>([]);

  return (
    <div id="root" className="flex flex-col min-h-screen p-16">
      <main className="grow flex flex-col items-center justify-center">
        <h1 className="text-center text-2xl mt-0 my-4 text-4xl">
          OpenAI File Example
        </h1>
        <div className="max-w-3xl mx-auto m-8 space-y-8 text-gray-800">
          <div className="">
            To search for answers from the content in your files, upload them
            here and we will use OpenAI embeddings and GPT to find answers from
            the relevant documents.
          </div>

          <FileUploadArea
            handleSetFiles={setFiles}
            maxNumFiles={75}
            maxFileSizeMB={30}
          />

          <FileQandAArea files={files} />
        </div>
        <br />
        <Link href="/" className="text-blue-500">
          Chatbot Example
        </Link>
      </main>
    </div>
  );
}
