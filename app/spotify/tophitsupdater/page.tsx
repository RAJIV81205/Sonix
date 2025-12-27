"use client";

import React, { useState } from "react";
import { Upload, RefreshCw, ClipboardCheck, FileText } from "lucide-react";

interface ParsedSection {
  section: string | null;
  items: ParsedItem[];
}

interface ParsedItem {
  id: string | null;
  name: string | null;
  description: string | null;
  image: string | null;
}

const TopHitsHindiUpdater: React.FC = () => {
  const [apiResponse, setApiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ParsedSection[]>([]);
  const [copied, setCopied] = useState(false);

  /* helpers ---------------------------------------------------------------- */

  const addLog = (msg: string) =>
    setLogs((l) => [...l, `${new Date().toLocaleTimeString()}  ${msg}`]);

  /* parse api response ----------------------------------------------------- */

  const parseApiResponse = async () => {
    if (!apiResponse.trim()) {
      addLog("❌  Please paste the API response first");
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    setParsedData([]);

    addLog("🚀  Starting to parse API response...");

    try {
      // Validate JSON
      const jsonData = JSON.parse(apiResponse);
      addLog("✅  Valid JSON detected");

      // Parse using the provided parser logic
      const sections = jsonData?.data?.browse?.sections?.items || [];
      
      if (sections.length === 0) {
        addLog("⚠️  No sections found in the API response");
        setIsProcessing(false);
        return;
      }

      const parsed = sections.map((section: any) => {
        const sectionName = section?.data?.title?.transformedLabel || null;
        const items = section?.sectionItems?.items || [];
        
        addLog(`📂  Processing section: ${sectionName || 'Unnamed'} (${items.length} items)`);
        
        return {
          section: sectionName,
          items: items.map((item: any) => {
            const data = item?.content?.data || {};
            return {
              id: data?.uri ? data.uri.split(":").pop() : null,
              name: data?.name || null,
              description: data?.description || null,
              image: data?.images?.items?.[0]?.sources?.[0]?.url || null,
            };
          }),
        };
      });

      setParsedData(parsed);
      const totalItems = parsed.reduce((acc: number, section: ParsedSection) => acc + section.items.length, 0);
      addLog(`🎉  Successfully parsed ${parsed.length} sections with ${totalItems} total items`);
      
    } catch (error) {
      addLog(`❌  Error parsing API response: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /* copy-to-clipboard ------------------------------------------------------ */

  const exportString = `export const topHitsHindi = ${JSON.stringify(parsedData, null, 2)};`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(exportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* clear data ------------------------------------------------------------- */

  const clearAll = () => {
    setApiResponse("");
    setParsedData([]);
    setLogs([]);
    setCopied(false);
  };

  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* header ----------------------------------------------------------- */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Top Hits Hindi Updater
          </h1>
          <p className="text-gray-300">
            Paste Spotify Browse API response to parse topHitsHindi data
          </p>
          <div className="mt-4">
            <a 
              href="/spotifydataupdater" 
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Artist Data Updater
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* input panel ---------------------------------------------------- */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              API Response Input
            </h2>

            <textarea
              value={apiResponse}
              onChange={(e) => setApiResponse(e.target.value)}
              placeholder="Paste your Spotify Browse API response JSON here..."
              className="w-full h-64 bg-black rounded-lg p-4 text-green-400 font-mono text-xs resize-none border border-gray-600 focus:border-purple-500 focus:outline-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={parseApiResponse}
                disabled={isProcessing || !apiResponse.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Parse Response
                  </>
                )}
              </button>

              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"
              >
                Clear All
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p>Characters: {apiResponse.length}</p>
              <p>Parsed Sections: {parsedData.length}</p>
              {parsedData.length > 0 && (
                <p className="text-purple-400 mt-2">
                  ✨ Ready to copy parsed data!
                </p>
              )}
            </div>
          </div>

          {/* logs ----------------------------------------------------------- */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
            <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <span className="text-gray-600">Paste API response and click "Parse Response"</span>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className="text-purple-400">
                    {l}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* parsed data preview & action buttons ------------------------------ */}
        {parsedData.length > 0 && (
          <div className="mt-8 bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Parsed Data Preview</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
              >
                <ClipboardCheck className="w-4 h-4" />
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            {/* sections summary */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parsedData.map((section, index) => (
                <div key={index} className="bg-black/50 rounded-lg p-3">
                  <h3 className="font-semibold text-purple-300 truncate">
                    {section.section || `Section ${index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {section.items.length} items
                  </p>
                </div>
              ))}
            </div>

            {/* full code preview */}
            <details className="bg-black rounded-lg">
              <summary className="p-4 cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
                View Full Generated Code
              </summary>
              <pre className="p-4 overflow-auto text-purple-400 text-xs border-t border-gray-700">
                {exportString}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopHitsHindiUpdater;