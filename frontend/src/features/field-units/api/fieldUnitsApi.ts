import { httpClient } from "../../../shared/lib/httpClient";
import type { FieldUnit } from "../types";

export async function fetchFieldUnits(): Promise<FieldUnit[]> 
{
  const response = await httpClient.get<FieldUnit[]>("/field-units");
  return response.data;
}