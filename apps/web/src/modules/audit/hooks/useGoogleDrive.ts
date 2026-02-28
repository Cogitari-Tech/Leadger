import { useState, useCallback } from "react";
import type { AuditReport } from "../types/audit.types";

/**
 * Google Drive integration for saving audit reports.
 *
 * IMPORTANT: This hook requires a Google Cloud Project with the
 * Drive API enabled and an OAuth 2.0 Client ID configured.
 * See the manual setup guide at the bottom of this file.
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ?? "";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FOLDER_NAME = "Cogitari Governance Reports";

interface DriveState {
  connected: boolean;
  uploading: boolean;
  error: string | null;
  lastUploadUrl: string | null;
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("google-gsi")) return resolve();
    const script = document.createElement("script");
    script.id = "google-gsi";
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export function useGoogleDrive() {
  const [state, setState] = useState<DriveState>({
    connected: false,
    uploading: false,
    error: null,
    lastUploadUrl: null,
  });

  const [accessToken, setAccessToken] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!GOOGLE_CLIENT_ID) {
      setState((s) => ({
        ...s,
        error: "VITE_GOOGLE_CLIENT_ID não configurado. Veja a documentação.",
      }));
      return;
    }

    try {
      await loadGoogleScript();

      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (response: google.accounts.oauth2.TokenResponse) => {
          if (response.error) {
            setState((s) => ({
              ...s,
              error: `OAuth error: ${response.error}`,
              connected: false,
            }));
            return;
          }
          setAccessToken(response.access_token);
          setState((s) => ({ ...s, connected: true, error: null }));
        },
      });

      client.requestAccessToken();
    } catch (err) {
      setState((s) => ({
        ...s,
        error:
          err instanceof Error ? err.message : "Erro ao conectar com Google",
      }));
    }
  }, []);

  const findOrCreateFolder = useCallback(
    async (token: string): Promise<string> => {
      // Search for existing folder
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&key=${GOOGLE_API_KEY}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const searchData = await searchRes.json();
      if (searchData.files?.length > 0) return searchData.files[0].id;

      // Create folder
      const createRes = await fetch(
        "https://www.googleapis.com/drive/v3/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: DRIVE_FOLDER_NAME,
            mimeType: "application/vnd.google-apps.folder",
          }),
        },
      );
      const folder = await createRes.json();
      return folder.id;
    },
    [],
  );

  const uploadReport = useCallback(
    async (report: AuditReport) => {
      if (!accessToken) {
        setState((s) => ({ ...s, error: "Não conectado ao Google Drive" }));
        return;
      }

      setState((s) => ({ ...s, uploading: true, error: null }));

      try {
        const folderId = await findOrCreateFolder(accessToken);
        const clientSlug = (report.client_name || "Cliente").replace(
          /\s+/g,
          "_",
        );
        const dateStr = new Date().toISOString().split("T")[0];
        const fileName = `Relatorio_Auditoria_${clientSlug}_${dateStr}.json`;

        const metadata = {
          name: fileName,
          mimeType: "application/json",
          parents: [folderId],
        };

        const boundary = "cogitari_boundary_" + Date.now();
        const body =
          `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
          JSON.stringify(metadata) +
          `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
          JSON.stringify(report, null, 2) +
          `\r\n--${boundary}--`;

        const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        });

        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
        }

        const file = await res.json();
        const fileUrl = `https://drive.google.com/file/d/${file.id}/view`;

        setState((s) => ({
          ...s,
          uploading: false,
          lastUploadUrl: fileUrl,
          error: null,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          uploading: false,
          error: err instanceof Error ? err.message : "Erro no upload",
        }));
      }
    },
    [accessToken, findOrCreateFolder],
  );

  const disconnect = useCallback(() => {
    setAccessToken(null);
    setState({
      connected: false,
      uploading: false,
      error: null,
      lastUploadUrl: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    uploadReport,
  };
}

// ─── Type declarations for Google Identity Services ──────
declare global {
  const google: {
    accounts: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: google.accounts.oauth2.TokenResponse) => void;
        }) => { requestAccessToken: () => void };
      };
    };
  };
  namespace google.accounts.oauth2 {
    interface TokenResponse {
      access_token: string;
      error?: string;
    }
  }
}
