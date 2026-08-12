import * as signalR from "@microsoft/signalr";

const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL ?? "http://localhost:5080/hubs/operations";

let connection: signalR.HubConnection | null = null;

export function getOperationsHubConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();
  }
  return connection;
}
