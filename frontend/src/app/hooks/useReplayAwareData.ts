import type { Incident } from "../../features/incidents/types";
import type { FieldUnit } from "../../features/field-units/types";
import type { OperationalTask } from "../../features/operational-tasks/types";
import type { RestrictedZone } from "../../features/restricted-zones/types";
import type { OperationsSnapshot } from "../../features/operations-replay/types";
import type { useOperationsData } from "./useOperationsData";

interface ReplayAwareData {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  restrictedZones: RestrictedZone[];
}

export function useReplayAwareData(
  liveData: ReturnType<typeof useOperationsData>,
  replay: { isReplayMode: boolean },
  snapshot: OperationsSnapshot | null | undefined
): ReplayAwareData {
  const useSnapshot = replay.isReplayMode && !!snapshot;

  return {
    incidents: useSnapshot ? snapshot.incidents : liveData.incidents,
    fieldUnits: useSnapshot ? snapshot.fieldUnits : liveData.fieldUnits,
    operationalTasks: useSnapshot ? snapshot.activeTasks : liveData.operationalTasks,
    restrictedZones: liveData.restrictedZones,
  };
}
