import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getOperationsHubConnection } from "../lib/signalRConnection";

export function useSignalRConnection() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const connection = getOperationsHubConnection(); // Singleton bağlantı

    const handleOperationsUpdated = () => {
      // Sinyal geldiğinde bu 4 önbelleği geçersiz kılıp taze veriyi çek:
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["field-unit-location-histories"] });
    };

    // 1. Dinleyiciyi kaydet
    connection.on("OperationsUpdated", handleOperationsUpdated);

    // 2. Bağlantı kapalıysa başlat
    if (connection.state === "Disconnected") {
      connection.start()
        .then(() => console.log("SignalR connected, state:", connection.state))
        .catch((error) => {
          console.error("SignalR connection failed", error);
        });
    }

    // 3. Temizleme (Cleanup): Hafıza sızıntısı ve çift tetiklenmeyi engellemek için dinleyiciyi kaldır
    return () => {
      connection.off("OperationsUpdated", handleOperationsUpdated);
    };
  }, [queryClient]);
}