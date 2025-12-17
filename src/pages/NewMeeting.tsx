import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Calendar, Clock, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/** ✅ localStorage key (MUST match other pages) */
const LS_KEY = "clove_meetings_v1";

type Priority = "low" | "medium" | "high";
type Status = "pending" | "in-progress" | "completed";

type ActionItemForm = {
  id: string;
  description: string;
  dueDate: string; // yyyy-mm-dd
  priority: Priority;
  status: Status;

  /** ✅ names directly (manual entry) */
  responsiblePersonName: string; // Assigned To
  followUpPersonName: string; // Inform / Follow up
};

type MeetingToSave = {
  id: string;
  title: string;
  description: string;
  date: string; // yyyy-mm-dd
  time: string; // hh:mm

  /** ✅ manual attendees (names) */
  attendees: string[];

  /** ✅ NEW: meeting with */
  meetingWith: string[];

  /** ✅ NEW: agenda */
  agenda: string;

  summaryPoints: string[];
  keyPoints: string[];

  /** ✅ prepared by (manual) */
  preparedByName: string;

  actionItems: ActionItemForm[];

  status: "pending" | "approved" | "rejected";
  createdAt: string;

  /** safe defaults for MeetingDetail */
  isApproved?: boolean;
  createdBy?: { name: string; email: string };
};

function getSavedMeetings(): MeetingToSave[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MeetingToSave[]) : [];
  } catch {
    return [];
  }
}

function upsertMeetingToLocalStorage(meeting: MeetingToSave) {
  const saved = getSavedMeetings();
  const map = new Map<string, MeetingToSave>();
  saved.forEach((m) => map.set(m.id, m));
  map.set(meeting.id, meeting);
  localStorage.setItem(LS_KEY, JSON.stringify(Array.from(map.values())));

  window.dispatchEvent(new Event("clove:meetingsUpdated"));
}

function toDateInputValue(v?: string) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function compactFilled(arr?: string[]) {
  return (arr ?? []).map((x) => x?.trim()).filter(Boolean) as string[];
}

export default function NewMeeting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  const existingMeeting = useMemo(() => {
    if (!id) return null;
    return getSavedMeetings().find((m) => m.id === id) ?? null;
  }, [id]);

  /**
   * ✅ Attendees behavior:
   * - Create mode: start with few empty inputs
   * - Edit mode: show only filled names (no empty 10 rows)
   */
  const [attendees, setAttendees] = useState<string[]>(
    Array.from({ length: 5 }, () => "")
  );

  /** ✅ NEW: Meeting With list */
  const [meetingWith, setMeetingWith] = useState<string[]>(
    Array.from({ length: 2 }, () => "")
  );

  /** ✅ NEW: Agenda */
  const [agenda, setAgenda] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    preparedByName: "",
    summaryPoints: [""],
    keyPoints: [""],
  });

  const [actionItems, setActionItems] = useState<ActionItemForm[]>([]);

  /* =======================
     Prefill on Edit
  ======================= */
  useEffect(() => {
    if (!isEditMode) return;

    if (!existingMeeting) {
      toast({
        title: "Meeting not found",
        description: "Cannot edit because this meeting does not exist.",
        variant: "destructive",
      });
      navigate("/meetings");
      return;
    }

    setFormData({
      title: existingMeeting.title ?? "",
      description: existingMeeting.description ?? "",
      date: toDateInputValue(existingMeeting.date),
      time: existingMeeting.time ?? "",
      preparedByName: existingMeeting.preparedByName ?? "",
      summaryPoints:
        existingMeeting.summaryPoints?.length > 0
          ? existingMeeting.summaryPoints
          : [""],
      keyPoints:
        existingMeeting.keyPoints?.length > 0 ? existingMeeting.keyPoints : [""],
    });

    // ✅ Edit mode: show only filled attendees (but keep at least 1 input)
    const filledAtt = compactFilled(existingMeeting.attendees);
    setAttendees(filledAtt.length > 0 ? filledAtt : [""]);

    // ✅ Edit mode: meetingWith filled only
    const filledMW = compactFilled(existingMeeting.meetingWith);
    setMeetingWith(filledMW.length > 0 ? filledMW : [""]);

    // ✅ agenda
    setAgenda(existingMeeting.agenda ?? "");

    setActionItems(
      (existingMeeting.actionItems ?? []).map((a, idx) => ({
        id: a.id ?? `ai-${idx}`,
        description: a.description ?? "",
        dueDate: toDateInputValue(a.dueDate),
        priority: (a.priority ?? "medium") as Priority,
        status: (a.status ?? "pending") as Status,
        responsiblePersonName: a.responsiblePersonName ?? "",
        followUpPersonName: a.followUpPersonName ?? "",
      }))
    );
  }, [isEditMode, existingMeeting, navigate, toast]);

  /* =======================
     Attendees
  ======================= */
  const updateAttendee = (index: number, value: string) => {
    setAttendees((prev) => prev.map((a, i) => (i === index ? value : a)));
  };

  const addAttendeeRow = () => setAttendees((prev) => [...prev, ""]);

  const removeAttendeeRow = (index: number) => {
    setAttendees((prev) => {
      if (prev.length <= 1) return prev; // keep at least 1 row in edit/create
      return prev.filter((_, i) => i !== index);
    });
  };

  /* =======================
     Meeting With
  ======================= */
  const updateMeetingWith = (index: number, value: string) => {
    setMeetingWith((prev) => prev.map((a, i) => (i === index ? value : a)));
  };

  const addMeetingWithRow = () => setMeetingWith((prev) => [...prev, ""]);

  const removeMeetingWithRow = (index: number) => {
    setMeetingWith((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  /* =======================
     Summary / Key Points
  ======================= */
  const addSummaryPoint = () =>
    setFormData((p) => ({ ...p, summaryPoints: [...p.summaryPoints, ""] }));

  const updateSummaryPoint = (index: number, value: string) =>
    setFormData((p) => ({
      ...p,
      summaryPoints: p.summaryPoints.map((x, i) => (i === index ? value : x)),
    }));

  const removeSummaryPoint = (index: number) =>
    setFormData((p) => ({
      ...p,
      summaryPoints: p.summaryPoints.filter((_, i) => i !== index),
    }));

  const addKeyPoint = () =>
    setFormData((p) => ({ ...p, keyPoints: [...p.keyPoints, ""] }));

  const updateKeyPoint = (index: number, value: string) =>
    setFormData((p) => ({
      ...p,
      keyPoints: p.keyPoints.map((x, i) => (i === index ? value : x)),
    }));

  const removeKeyPoint = (index: number) =>
    setFormData((p) => ({
      ...p,
      keyPoints: p.keyPoints.filter((_, i) => i !== index),
    }));

  /* =======================
     Action Items
  ======================= */
  const addActionItem = () => {
    setActionItems((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        description: "",
        dueDate: "",
        priority: "medium",
        status: "pending",
        responsiblePersonName: "",
        followUpPersonName: "",
      },
    ]);
  };

  const updateActionItem = <K extends keyof ActionItemForm>(
    itemId: string,
    field: K,
    value: ActionItemForm[K]
  ) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  };

  const removeActionItem = (itemId: string) =>
    setActionItems((prev) => prev.filter((item) => item.id !== itemId));

  /* =======================
     Submit (Create / Update)
  ======================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedAttendees = compactFilled(attendees);
    const cleanedMeetingWith = compactFilled(meetingWith);

    const meetingId =
      isEditMode && existingMeeting?.id ? existingMeeting.id : `local-${Date.now()}`;

    const createdAt =
      isEditMode && existingMeeting?.createdAt
        ? existingMeeting.createdAt
        : new Date().toISOString();

    const preparedBy = formData.preparedByName.trim();

    const meetingToSave: MeetingToSave = {
      id: meetingId,
      title: formData.title.trim(),
      description: formData.description?.trim() || "",
      date: formData.date,
      time: formData.time,

      attendees: cleanedAttendees,
      meetingWith: cleanedMeetingWith,
      agenda: agenda?.trim() || "",

      preparedByName: preparedBy,

      summaryPoints: compactFilled(formData.summaryPoints),
      keyPoints: compactFilled(formData.keyPoints),

      actionItems: actionItems.map((a) => ({
        ...a,
        description: a.description.trim(),
        responsiblePersonName: a.responsiblePersonName.trim(),
        followUpPersonName: a.followUpPersonName.trim(),
      })),

      status: existingMeeting?.status ?? "pending",
      createdAt,

      isApproved: existingMeeting?.isApproved ?? false,
      createdBy: {
        name: preparedBy || existingMeeting?.createdBy?.name || "AICCC",
        email: existingMeeting?.createdBy?.email || "aiccc@organization.in",
      },
    };

    upsertMeetingToLocalStorage(meetingToSave);

    toast({
      title: isEditMode ? "Meeting updated" : "Meeting created",
      description: isEditMode ? "Changes saved successfully." : "Meeting saved successfully.",
    });

    navigate(isEditMode ? `/meetings/${meetingId}` : "/meetings");
  };

  return (
    <MainLayout
      title={isEditMode ? "Edit Meeting" : "New Meeting"}
      subtitle={isEditMode ? "Update meeting and MOM details" : "Create a new meeting and MOM"}
    >
      <Link
        to={isEditMode && id ? `/meetings/${id}` : "/meetings"}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Meeting Details */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h3 className="font-display font-semibold text-lg">Meeting Details</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Sprint Planning"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the meeting purpose..."
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Date *</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <div className="relative mt-1.5">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="preparedByName">Prepared By *</Label>
              <Input
                id="preparedByName"
                value={formData.preparedByName}
                onChange={(e) => setFormData({ ...formData, preparedByName: e.target.value })}
                placeholder="Enter name (e.g., Ganesh)"
                required
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Organization will be shown as <b>AICCC</b> in MeetingDetail.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Agenda */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Agenda</h3>
          <Textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="Write meeting agenda here..."
            rows={4}
          />
        </div>

        {/* Attendees */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-lg">Attendees</h3>
          </div>

          <div className="space-y-3">
            {attendees.map((name, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => updateAttendee(idx, e.target.value)}
                  placeholder={`Attendee ${idx + 1}`}
                />
                {attendees.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttendeeRow(idx)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Remove attendee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addAttendeeRow} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Attendee
          </Button>
        </div>

        {/* Summary Points */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Summary Points</h3>

          <div className="space-y-3">
            {formData.summaryPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={point}
                  onChange={(e) => updateSummaryPoint(index, e.target.value)}
                  placeholder={`Summary point ${index + 1}`}
                />
                {formData.summaryPoints.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSummaryPoint(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addSummaryPoint} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Summary Point
          </Button>
        </div>

        {/* Key Points */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Key Points</h3>

          <div className="space-y-3">
            {formData.keyPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={point}
                  onChange={(e) => updateKeyPoint(index, e.target.value)}
                  placeholder={`Key point ${index + 1}`}
                />
                {formData.keyPoints.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKeyPoint(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addKeyPoint} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Key Point
          </Button>
        </div>

        {/* Action Items */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Action Items</h3>

          {actionItems.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-muted-foreground">
                  Action Item #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeActionItem(item.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateActionItem(item.id, "description", e.target.value)}
                  placeholder="What needs to be done?"
                  className="mt-1.5"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => updateActionItem(item.id, "dueDate", e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select
                    value={item.priority}
                    onValueChange={(value) =>
                      updateActionItem(item.id, "priority", value as Priority)
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Assigned To (Responsible)</Label>
                  <Input
                    value={item.responsiblePersonName}
                    onChange={(e) =>
                      updateActionItem(item.id, "responsiblePersonName", e.target.value)
                    }
                    placeholder="Enter name"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Follow Up / Inform Person</Label>
                  <Input
                    value={item.followUpPersonName}
                    onChange={(e) =>
                      updateActionItem(item.id, "followUpPersonName", e.target.value)
                    }
                    placeholder="Enter name"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={item.status}
                    onValueChange={(value) =>
                      updateActionItem(item.id, "status", value as Status)
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addActionItem} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Action Item
          </Button>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to={isEditMode && id ? `/meetings/${id}` : "/meetings"}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">{isEditMode ? "Update Meeting" : "Create Meeting"}</Button>
        </div>
      </form>
    </MainLayout>
  );
}
