import { useEffect, useMemo, useState } from "react";
import { meetings as mockMeetings, users } from "@/data/mockData";
import type { Meeting } from "@/types/meeting";

const LS_KEY = "clove_meetings_v1";

type LsActionItem = {
  id?: string;
  description?: string;
  dueDate?: string;
  status?: "pending" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  responsiblePerson?: { id?: string; name?: string };
  followUpPerson?: { id?: string; name?: string };
  responsiblePersonId?: string;
  followUpPersonId?: string;

  // ✅ new/manual fields support (from your NewMeeting)
  responsiblePersonName?: string;
  followUpPersonName?: string;
};

type LsMeeting = Partial<Meeting> & {
  id: string;

  attendees?: Array<string | { id?: string; name?: string; department?: string }>;
  attendeeIds?: string[];

  actionItems?: LsActionItem[];

  preparedByName?: string; // ✅ from NewMeeting

  // ✅ NEW: from NewMeeting
  agenda?: string;
  meetingWith?: string[];
};

function getSavedMeetings(): LsMeeting[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LsMeeting[]) : [];
  } catch {
    return [];
  }
}

function mergeMeetings(mock: Meeting[], saved: LsMeeting[]): LsMeeting[] {
  const map = new Map<string, LsMeeting>();
  [...mock, ...saved].forEach((m) => {
    if (m?.id) map.set(m.id, m);
  });
  return Array.from(map.values());
}

function safeIsoDate(v?: string) {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function normalizeAttendees(input: LsMeeting["attendees"]): Meeting["attendees"] {
  const list = input ?? [];

  // already objects
  if (list.length > 0 && typeof list[0] === "object") {
    return (list as Array<any>).map((a, idx) => ({
      id: a?.id ?? `att-${idx}`,
      name: a?.name ?? "Unknown",
      department: a?.department ?? "General",
    }));
  }

  // string[] (names)
  if (list.length > 0 && typeof list[0] === "string") {
    return (list as string[]).map((name, idx) => ({
      id: `local-att-${idx}`,
      name,
      department: "General",
    }));
  }

  return [];
}

function normalizeActionItems(input: LsActionItem[] | undefined): Meeting["actionItems"] {
  const items = Array.isArray(input) ? input : [];

  return items.map((item, idx) => {
    const responsibleFromId =
      item?.responsiblePersonId
        ? users.find((u) => u.id === item.responsiblePersonId)
        : undefined;

    const followUpFromId =
      item?.followUpPersonId
        ? users.find((u) => u.id === item.followUpPersonId)
        : undefined;

    // ✅ if manually saved names exist, prefer them
    const responsible =
      item?.responsiblePersonName?.trim()
        ? { id: "local", name: item.responsiblePersonName.trim() }
        : item?.responsiblePerson ?? responsibleFromId ?? { id: "na", name: "Not Assigned" };

    const followUp =
      item?.followUpPersonName?.trim()
        ? { id: "local", name: item.followUpPersonName.trim() }
        : item?.followUpPerson ?? followUpFromId ?? { id: "na", name: "Not Assigned" };

    return {
      id: item?.id ?? `ai-${idx}`,
      description: item?.description ?? "",
      dueDate: safeIsoDate(item?.dueDate),
      status: item?.status ?? "pending",
      priority: item?.priority ?? "medium",
      responsiblePerson: {
        id: responsible?.id ?? "na",
        name: responsible?.name ?? "Not Assigned",
      },
      followUpPerson: {
        id: followUp?.id ?? "na",
        name: followUp?.name ?? "Not Assigned",
      },
    };
  });
}

function normalizeMeeting(m: LsMeeting): Meeting {
  const normalized = {
    id: m.id,
    title: m.title ?? "Untitled Meeting",
    description: m.description ?? "",
    date: m.date ?? safeIsoDate(m.date),
    time: m.time ?? "—",
    department: (m.department ?? "General") as Meeting["department"],
    isApproved: Boolean((m as any)?.isApproved),
    createdAt: safeIsoDate((m as any)?.createdAt),
    createdBy:
      (m as any)?.createdBy ??
      ({
        name: "AICCC",
        email: "aiccc@organization.in",
      } as Meeting["createdBy"]),
    attendees: normalizeAttendees(m.attendees),
    summaryPoints: Array.isArray((m as any)?.summaryPoints) ? ((m as any).summaryPoints as string[]) : [],
    keyPoints: Array.isArray((m as any)?.keyPoints) ? ((m as any).keyPoints as string[]) : [],
    actionItems: normalizeActionItems(m.actionItems),

    // @ts-expect-error (only if your Meeting type doesn't include it; used in MeetingDetail)
    preparedByName: (m as any)?.preparedByName ?? "",

    // ✅ NEW: persist-through fields for MeetingDetail
    // @ts-expect-error (only if your Meeting type doesn't include it; used in MeetingDetail)
    agenda: typeof (m as any)?.agenda === "string" ? (m as any).agenda : "",

    // @ts-expect-error (only if your Meeting type doesn't include it; used in MeetingDetail)
    meetingWith: Array.isArray((m as any)?.meetingWith) ? (m as any).meetingWith : [],
  } as Meeting;

  return normalized;
}

export function useMeetings(): Meeting[] {
  const [mergedRaw, setMergedRaw] = useState<LsMeeting[]>(() =>
    mergeMeetings(mockMeetings as unknown as Meeting[], getSavedMeetings())
  );

  useEffect(() => {
    const refresh = () => {
      const saved = getSavedMeetings();
      setMergedRaw(mergeMeetings(mockMeetings as unknown as Meeting[], saved));
    };

    refresh();

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) refresh();
    };

    const onCustom = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener("clove:meetingsUpdated", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("clove:meetingsUpdated", onCustom);
    };
  }, []);

  return useMemo(() => mergedRaw.map(normalizeMeeting), [mergedRaw]);
}

export function useMeetingById(id?: string) {
  const meetings = useMeetings();
  return useMemo(() => meetings.find((m) => m.id === id) ?? null, [meetings, id]);
}
