"use client";

import React, { useState } from "react";
import { Play, RefreshCw, ClipboardCheck, Save, CheckCircle } from "lucide-react";
import { topArtists as seedArtists } from "@/lib/constant";

interface Artist {
  id: string;
  name: string;
  genre: string;
  img: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
}

const SPOTIFY_TOKEN = "BQCRjkhAmN3PlARqPinveYF3NHDpP642dlQYH64zZgg3xYsaWp-hzffLkFRRr72aJ4ZQa58qYpuNa_rW5-vY82vlJMCCWpjue4lcDUa9KrdSYTyFkexKEx5Uha3R-8ytGbRu42F6YyKPbHu3PYAg1ZWCaa_hzun4dAn3b2c-NnJ1UQ6Ot_7ReF8cS64QWJWuMB3zZkHgFAeMXyRdy3l-J9yhv6Gllenv_lQqoe6ny68vLCYU8fFXg69JRZ25iTNAfXpo_-M-n79oWhCwim-p5vo-jY8UvfMVEjk_RZmFYEO5CdDX1u70BiAmhpB5IJPSCVGJjkXmJ5lHYMBqJ7sHmBG-gzm1KZsdUBC_tQeZAk91TuhFcz1JlVgiwHC6Zn0F-o0";  // ⚠️ keep it outside the repo!

const SpotifyArtistUpdater: React.FC = () => {
  const [artists] = useState<Artist[]>(seedArtists.filter(Boolean));
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [updatedArtists, setUpdatedArtists] = useState<Artist[]>([]);
  const [copied, setCopied] = useState(false);
  const [isAutoUpdating, setIsAutoUpdating] = useState(false);
  const [autoUpdateSuccess, setAutoUpdateSuccess] = useState(false);

  /* helpers ---------------------------------------------------------------- */

  const addLog = (msg: string) =>
    setLogs((l) => [...l, `${new Date().toLocaleTimeString()}  ${msg}`]);

  const fetchSpotifyArtist = async (
    artistName: string
  ): Promise<SpotifyArtist | null> => {
    try {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        artistName
      )}&type=artist&limit=10`;

      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${SPOTIFY_TOKEN}` },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      const data = await r.json();

      // ----- ONLY keep exact (case-insensitive) name matches ---------------
      const match = data.artists.items.find(
        (a: SpotifyArtist) => a.name.toLowerCase() === artistName.toLowerCase()
      );
      return match ?? null;
    } catch (e) {
      addLog(`❌  error fetching ${artistName}: ${(e as Error).message}`);
      return null;
    }
  };

  /* main worker ------------------------------------------------------------ */

  const updateArtistData = async () => {
    setIsUpdating(true);
    setProgress(0);
    setLogs([]);
    setUpdatedArtists([]);

    addLog("🚀  start updating …");

    const next: Artist[] = [];

    for (let i = 0; i < artists.length; i++) {
      const a = artists[i];
      addLog(`🔍  ${a.name}`);

      const sp = await fetchSpotifyArtist(a.name);

      if (sp) {
        const img = sp.images?.[0]?.url ?? "";
        next.push({ ...a, id: sp.id, img });
        addLog(`✅  updated ${a.name}`);
      } else {
        // leave id & img blank when no exact match
        next.push({ ...a, id: "", img: "" });
        addLog(`⚠️  no exact match for ${a.name}`);
      }

      setProgress(((i + 1) / artists.length) * 100);
      await new Promise((res) => setTimeout(res, 120)); // tiny delay
    }

    setUpdatedArtists(next);
    addLog("🎉  all done!");
    setIsUpdating(false);
  };

  /* copy-to-clipboard ------------------------------------------------------ */

  const exportString = `export const topArtists = ${JSON.stringify(
    updatedArtists,
    null,
    2
  )};`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(exportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* auto-update constant file ---------------------------------------------- */

  const autoUpdateConstantFile = async () => {
    if (updatedArtists.length === 0) {
      addLog("❌  No updated artists to save");
      return;
    }

    setIsAutoUpdating(true);
    setAutoUpdateSuccess(false);
    addLog("🔄  Updating constant file...");

    try {
      const response = await fetch('/api/update-artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updatedArtists }),
      });

      const result = await response.json();

      if (response.ok) {
        addLog(`✅  Successfully updated ${result.updatedCount} artists in constant file`);
        setAutoUpdateSuccess(true);
        setTimeout(() => setAutoUpdateSuccess(false), 3000);
      } else {
        addLog(`❌  Failed to update constant file: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌  Error updating constant file: ${(error as Error).message}`);
    } finally {
      setIsAutoUpdating(false);
    }
  };

  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* header ----------------------------------------------------------- */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Spotify Artist Data Updater
          </h1>
          <p className="text-gray-300">
            Updates artist data and automatically saves to constant file
          </p>
          <div className="mt-4">
            <a 
              href="/tophitsupdater" 
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Top Hits Hindi Updater
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* control panel -------------------------------------------------- */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Control Panel
            </h2>

            <button
              onClick={updateArtistData}
              disabled={isUpdating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Update All Artists
                </>
              )}
            </button>

            {isUpdating && (
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-400">
              <p>Total Artists: {artists.length}</p>
              <p>Updated: {updatedArtists.length}</p>
              {updatedArtists.length > 0 && (
                <p className="text-green-400 mt-2">
                  ✨ Ready to auto-update constant file!
                </p>
              )}
            </div>
          </div>

          {/* logs ----------------------------------------------------------- */}
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
            <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <span className="text-gray-600">click “Update All Artists”</span>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className="text-green-400">
                    {l}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* code preview & action buttons ----------------------------------- */}
        {updatedArtists.length > 0 && (
          <div className="mt-8 bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Updated Code</h2>
              <div className="flex gap-3">
                <button
                  onClick={autoUpdateConstantFile}
                  disabled={isAutoUpdating}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {isAutoUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating File...
                    </>
                  ) : autoUpdateSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Updated!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Auto Update File
                    </>
                  )}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <pre className="bg-black rounded-lg p-4 overflow-auto text-green-400 text-xs">
              {exportString}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyArtistUpdater;
