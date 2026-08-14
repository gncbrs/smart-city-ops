import { useEffect } from "react";
import { getOperationsHubConnection } from "../lib/signalRConnection";

// Aşama 3'te (real-time) backend'deki OperationsHub event'lerine burada abone olacağız.
export function useSignalRConnection() {
  useEffect(() => {
    const connection = getOperationsHubConnection(); //Singelton bağlantı.

    if (connection.state === "Disconnected") {
      connection.start().catch((error) => {
        console.error("SignalR connection failed", error);
      });
    }

    return () => {
      // Bağlantıyı burada kapatmıyoruz; uygulama boyunca tek bağlantı paylaşılır.
    };
  }, []);
}
