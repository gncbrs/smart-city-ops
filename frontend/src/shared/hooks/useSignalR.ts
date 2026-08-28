import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getOperationsHubConnection } from "../lib/signalRConnection";

export function useSignalRConnection() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const connection = getOperationsHubConnection(); // Singleton connection

    const handleOperationsUpdated = () => {
      // On signal, invalidate these caches so fresh data is fetched:
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["field-unit-location-histories"] });
      queryClient.invalidateQueries({ queryKey: ["field-unit-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["restricted-zones"] });
      queryClient.invalidateQueries({ queryKey: ["operational-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["incident-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["field-unit-movement-history"] });
    };

    // 1. Register the listener
    connection.on("OperationsUpdated", handleOperationsUpdated);

    // 2. Start the connection if it's closed
    if (connection.state === "Disconnected") {
      connection.start()
        .catch((error) => {
          console.error("SignalR connection failed", error);
        });
    }

    // 3. Cleanup: remove the listener to prevent memory leaks and double-firing
    return () => {
      connection.off("OperationsUpdated", handleOperationsUpdated);
    };
  }, [queryClient]);
}