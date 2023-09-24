import logo from "../../assets/images/logo_md.png";
import { CodeBlock } from "./CodeBlock";
import { IMessageWithResults } from "../Library/types";
import { DynamicTable } from "../Library/DynamicTable";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { SelectedTablesDisplay } from "../Library/SelectedTablesDisplay";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Message = (initialMessage: IMessageWithResults) => {
  const [loadingQuery, setLoadingQuery] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [message, setMessage] = useState<IMessageWithResults>(initialMessage);

  function runQuery(code: string) {
    try {
      // Display loading result instead of PlayIcon and disable button
      setLoadingQuery(true);
      setQueryResult(null);

      // Fetch result from API
      const executeSQL = async () => {
        if (initialMessage.conversation_id === undefined) return;
        const data = await api.runSQL(initialMessage.conversation_id, code);
        setQueryResult(data.data.content);
      };
      executeSQL();

      // Re-enable the button
      setLoadingQuery(false);
    } catch (error) {
      // Handle any errors that occurred during the backend communication
      setLoadingQuery(false);
      alert("Error running query");
    }
  }

  useEffect(() => {
    // Add query result to results
    if (message.results !== undefined && queryResult !== null) {
      // Remove data result from results if any
      let newResults = message.results?.filter(
        (result) => result.type !== "data"
      );

      const updatedMessage = {
        ...message,
        results: [
          ...newResults,
          {
            type: "data",
            content: queryResult,
            result_id: "1",
          },
        ],
      } as IMessageWithResults;
      setMessage(updatedMessage);
    }
  }, [queryResult]);

  return (
    <div
      className={classNames(
        message.role === "assistant" ? "dark:bg-gray-800" : "dark:bg-gray-900",
        "w-full text-gray-800 dark:text-gray-100 bg-gray-50"
      )}
    >
      <div className="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-xl xl:max-w-3xl md:py-6 lg:px-0 m-auto">
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div className="">
            <div className="relative p-1 rounded-sm text-white flex items-center justify-center">
              {/* TODO: Replace with user image */}
              {message.role === "assistant" ? (
                <img src={logo} className="h-7 w-7" />
              ) : (
                <img
                  className="h-7 w-7 rounded-sm bg-gray-800"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)] scrollbar-hide">
          {message.content && (
            <div className="flex flex-grow flex-col gap-3">
              <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
                <div className="markdown prose w-full break-words dark:prose-invert dark">
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          )}

          {/** RESULTS: QUERY, DATA, PLOTS */}
          {/** Sort results as selected_tables first, data second, code third using tertiary if **/}
          {message.results
            ?.sort((a, b) => {
              if (a.type === "selected_tables") return -1;
              if (b.type === "selected_tables") return 1;
              if (a.type === "data") return -1;
              if (b.type === "data") return 1;
              if (a.type === "sql") return -1;
              if (b.type === "sql") return 1;
              return 0;
            })
            .map(
              (result, index) =>
                (result.type === "selected_tables" && (
                  <SelectedTablesDisplay
                    tables={result.content as string}
                    key={`message-${message.message_id}-selectedtables-${index}`}
                  />
                )) ||
                (result.type === "data" && (
                  <DynamicTable
                    key={`message-${message.message_id}-table-${index}`}
                    data={result.content}
                  />
                )) ||
                (result.type === "sql" && (
                  <CodeBlock
                    key={`message-${message.message_id}-code-${index}`}
                    language="sql"
                    code={result.content as string}
                    runQuery={runQuery}
                    runnable={!loadingQuery}
                  />
                ))
            )}

          <div className="flex justify-between lg:block">
            <div className="text-xs flex items-center justify-center gap-1 self-center pt-2 !invisible">
              <button
                disabled={false}
                className="dark:text-white disabled:text-gray-300 dark:disabled:text-gray-400"
              >
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <span className="flex-grow flex-shrink-0">1 / 1</span>
              <button
                disabled={false}
                className="dark:text-white disabled:text-gray-300 dark:disabled:text-gray-400"
              >
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};