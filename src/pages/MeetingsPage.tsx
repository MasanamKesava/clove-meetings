import React, { useEffect, useMemo, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/hooks/useMeetingDetails";
import { Link } from "react-router-dom";
import { Calendar, Clock, Download, Mail, Plus, ChevronRight } from "lucide-react";
import { format, parse } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ===============================
   Utils
================================ */
function safeFileName(name: string) {
  return (name || "file").replace(/[^\w\-]+/g, "_").slice(0, 80);
}

function safeDate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthKeyFromDate(d: Date) {
  return format(d, "yyyy-MM");
}

function monthLabelFromKey(k: string) {
  const [y, m] = k.split("-").map(Number);
  return format(new Date(y, (m ?? 1) - 1, 1), "MMMM yyyy");
}

function initials(name?: string) {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "N") + (parts[1]?.[0] ?? "A")).toUpperCase();
}

function compactFilled(arr?: string[]) {
  return (arr ?? []).map((x) => x?.trim()).filter(Boolean) as string[];
}

function attendeeNames(meeting: any): string[] {
  const raw = meeting?.attendees;
  if (!Array.isArray(raw)) return [];
  if (raw.length === 0) return [];
  if (typeof raw[0] === "string") return compactFilled(raw as string[]);
  return (raw as any[]).map((a) => a?.name).filter(Boolean);
}

/** ✅ consistent Date + Time formatting */
function formatMeetingDate(meeting: any) {
  const d = safeDate(meeting?.date);
  return d ? format(d, "EEEE, dd MMMM yyyy") : "Not specified";
}
function formatMeetingTime(meeting: any) {
  const t = String(meeting?.time ?? "").trim();
  if (!t) return "Not specified";
  // expects "HH:mm" from your form; convert to "h:mm a"
  try {
    const parsedTime = parse(t, "HH:mm", new Date());
    return format(parsedTime, "h:mm a");
  } catch {
    return t;
  }
}

/** ===============================
 *  Department-wise CC mapping
 *  (Edit these emails as per your office)
================================= */
const DEPARTMENT_CC: Record<string, string[]> = {
  General: ["aiccc@organization.in"],
  Engineering: ["engineering@organization.in", "aiccc@organization.in"],
  Planning: ["planning@organization.in", "aiccc@organization.in"],
  Finance: ["finance@organization.in", "aiccc@organization.in"],
};

function ccForDepartment(dept?: string) {
  const key = String(dept ?? "General").trim() || "General";
  return (DEPARTMENT_CC[key] ?? DEPARTMENT_CC.General ?? []).filter(Boolean);
}

function buildReferenceNo(meeting: any) {
  const d = safeDate(meeting?.date) ?? new Date();
  const id = meeting?.id ?? "NA";
  // Example: AICCC/MOM/2025/12/17/local-123
  return meeting?.referenceNo ?? `AICCC/MOM/${format(d, "yyyy/MM/dd")}/${id}`;
}

/** ✅ SINGLE SOURCE OF TRUTH: MOM text used for Email + PDF */
function buildMomText(meeting: any) {
  const dateStr = formatMeetingDate(meeting);
  const timeStr = formatMeetingTime(meeting);

  const attendees = attendeeNames(meeting);

  const agendaRaw = meeting?.agenda;
  const agenda = String(agendaRaw ?? "").trim();

  const meetingWith = Array.isArray(meeting?.meetingWith)
    ? compactFilled(meeting.meetingWith)
    : [];

  const referenceNo = buildReferenceNo(meeting);
  const meetingId = meeting?.id ?? "NA";

  const preparedByName =
    String(meeting?.preparedByName ?? "").trim() ||
    String(meeting?.preparedBy ?? "").trim() ||
    "AICCC";

  // ✅ Auto Approved By
  const approvedByName =
    String(meeting?.approvedByName ?? "").trim() ||
    String(meeting?.approvedBy ?? "").trim() ||
    (meeting?.isApproved ? "Approved Authority" : "Pending Approval");

  const statusText = meeting?.isApproved ? "Approved" : "Pending Approval";

  const summaryPoints: string[] = Array.isArray(meeting?.summaryPoints)
    ? compactFilled(meeting.summaryPoints)
    : [];

  const keyPoints: string[] = Array.isArray(meeting?.keyPoints)
    ? compactFilled(meeting.keyPoints)
    : [];

  const actions = Array.isArray(meeting?.actionItems) ? meeting.actionItems : [];

  const actionLines =
    actions.length > 0
      ? actions
          .map((it: any, idx: number) => {
            const desc = String(it?.description ?? it?.title ?? "Action item").trim() || "Action item";
            const due = it?.dueDate ? format(new Date(it.dueDate), "dd MMM yyyy") : "Not specified";
            const status = String(it?.status ?? "pending").trim();
            const assigned =
              String(it?.responsiblePersonName ?? "").trim() ||
              String(it?.responsiblePerson?.name ?? "").trim() ||
              "Not assigned";

            const followUp =
              String(it?.followUpPersonName ?? "").trim() ||
              String(it?.followUpPerson?.name ?? "").trim() ||
              "Not assigned";

            // ✅ Key Points after each Action Item status
            const kp = keyPoints[idx] ? `• ${keyPoints[idx]}` : "• Timely follow-up required as per agreed timeline";

            return (
              `${idx + 1}. ${desc}\n` +
              `   Assigned To : ${assigned}\n` +
              `   Follow Up   : ${followUp}\n` +
              `   Due Date    : ${due}\n` +
              `   Status      : ${status}\n` +
              `   Key Points  :\n` +
              `   ${kp}`
            );
          })
          .join("\n\n")
      : "No action items were recorded for this meeting.";

  const ccList = ccForDepartment(meeting?.department);

  // ✅ Blank line rules:
  // ✔ One empty line after “Dear Team,”
  // ✔ One empty line before Participants
  // ✔ One empty line before Agenda
  // ✔ One empty line before Action Items
  // ✔ One empty line before Summary Points
  // ✔ Added Key Points section after Status
  // ✔ One empty line after each section block (participants, agenda, summary, action items, key points)
  const lines: string[] = [
    "Dear Team,",
    "", // ✅ empty after Dear Team,
    "Please find below the Minutes of Meeting (MoM) for your kind information and necessary action:",
    "",
    `Reference Number : ${referenceNo}`,
    `Meeting ID       : ${meetingId}`,
    "",
    `Meeting Title    : ${meeting?.title ?? "Meeting"}`,
    `Department       : ${meeting?.department ?? "General"}`,
    `Status           : ${statusText}`,
    "",
    // ✅ Key Points section after Status
    "Key Points:",
    ...(keyPoints.length
      ? keyPoints.map((k) => `• ${k}`)
      : ["• Not specified"]),
    "", // ✅ one empty line after key points
    `Date             : ${dateStr}`,
    `Time             : ${timeStr}`,
    `Venue            : AICCC Room, APCRDA Project Office, Lingayapalem`,
    meetingWith.length ? `Meeting With     : ${meetingWith.join(", ")}` : `Meeting With     : ${meeting?.title ?? "Meeting"}`,
    "",
    `CC (Department-wise): ${ccList.length ? ccList.join(", ") : "Not specified"}`,
    "",
    "", // ✅ empty line before Participants
    "Participants:",
    ...(attendees.length ? attendees.map((p) => `• ${p}`) : ["• Not specified"]),
    "", // ✅ empty line after participants
    "", // ✅ empty line before Agenda
    "Agenda:",
    agenda || "No specific agenda was documented.",
    "", // ✅ empty line after agenda
    "", // ✅ empty line before Action Items
    "Action Items:",
    actionLines,
    "", // ✅ empty line after action items
    "", // ✅ empty line before Summary Points
    "Summary Points:",
    ...(summaryPoints.length ? summaryPoints.map((s) => `• ${s}`) : ["• Not specified"]),
    "", // ✅ empty line after summary
    `Prepared By      : ${preparedByName} (Organization: AICCC)`,
    `Approved By      : ${approvedByName}`,
    "",
    "This MoM is issued for information and compliance.",
    "",
    "Regards,",
    "AICCC Team",
  ];

  return lines.join("\n");
}

/* ===============================
   PDF helpers (JPEG to avoid PNG signature errors + non-empty file)
================================ */
async function elementToCanvas(el: HTMLElement) {
  return await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
}

/** ✅ robust file creation (prevents “empty attachment”) */
async function elementToPdfFile(el: HTMLElement, filenameBase: string) {
  const canvas = await elementToCanvas(el);

  // ✅ Use JPEG (fixes PNG signature errors)
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  let position = 0;
  let heightLeft = pdfHeight;

  pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = heightLeft - pdfHeight;
    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }

  // ✅ create non-empty attachment reliably
  const arrayBuffer = pdf.output("arraybuffer");
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const file = new File([blob], `${filenameBase}.pdf`, { type: "application/pdf" });

  return { pdf, file };
}

async function exportMonthPdf(
  monthMeetings: any[],
  getRef: (id: string) => HTMLDivElement | null,
  filenameBase: string
) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let first = true;

  for (const m of monthMeetings) {
    const el = getRef(m.id);
    if (!el) continue;

    const canvas = await elementToCanvas(el);
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (!first) pdf.addPage();
    first = false;

    let position = 0;
    let heightLeft = pdfHeight;

    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      pdf.addPage();
      position = heightLeft - pdfHeight;
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(`${filenameBase}.pdf`);
}

/* ===============================
   UI: Compact Card (like screenshot)
   - action items count ABOVE action buttons ✅
================================ */
function MeetingCardCompact({
  meeting,
  href,
  onShare,
  onDownload,
}: {
  meeting: any;
  href: string;
  onShare: () => void;
  onDownload: () => void;
}) {
  const d = safeDate(meeting?.date);
  const dateLabel = d ? format(d, "MMM d, yyyy") : "—";

  const people = attendeeNames(meeting);
  const shown = people.slice(0, 4);
  const extra = Math.max(0, people.length - shown.length);

  return (
    <div className="relative rounded-xl border border-border bg-card px-4 py-3">
      <Link to={href} className="block">
        {/* top row */}
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            {meeting?.department ?? "General"}
          </span>

          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* title + desc */}
        <h3 className="mt-2 text-base font-semibold leading-snug line-clamp-1">
          {meeting?.title ?? "Untitled Meeting"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {meeting?.description ?? ""}
        </p>

        {/* date/time row */}
        <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{meeting?.time ?? "—"}</span>
          </div>
        </div>

        {/* avatars + action items count */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            {shown.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="h-8 w-8 rounded-full border border-white bg-emerald-50 flex items-center justify-center text-xs font-semibold text-emerald-700"
                title={name}
              >
                {initials(name)}
              </div>
            ))}
            {extra > 0 && (
              <div className="h-8 w-8 rounded-full border border-white bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                +{extra}
              </div>
            )}
          </div>

          {/* ✅ above action buttons */}
          <span className="text-sm text-muted-foreground">
            {(meeting?.actionItems?.length ?? 0)} action items
          </span>
        </div>
      </Link>

      {/* icon-only actions */}
      <div className="mt-2 flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          title="Share PDF"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onShare();
          }}
        >
          <Mail className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Download PDF"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDownload();
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ===============================
   Page
================================ */
export default function MeetingsPage() {
  const meetings = useMeetings();
  const printRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // group meetings by month (desc)
  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();

    (meetings ?? []).forEach((m: any) => {
      const d = safeDate(m?.date) ?? new Date();
      const key = monthKeyFromDate(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });

    for (const [k, list] of map.entries()) {
      list.sort((a: any, b: any) => {
        const da = safeDate(a?.date)?.getTime() ?? 0;
        const db = safeDate(b?.date)?.getTime() ?? 0;
        return db - da;
      });
      map.set(k, list);
    }

    const keys = Array.from(map.keys()).sort((a, b) => (a > b ? -1 : 1));
    return { map, keys };
  }, [meetings]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    grouped.keys[0] ?? monthKeyFromDate(new Date())
  );

  // keep selected month valid when meetings change
  useEffect(() => {
    if (!grouped.keys.includes(selectedMonth)) {
      setSelectedMonth(grouped.keys[0] ?? monthKeyFromDate(new Date()));
    }
  }, [grouped.keys, selectedMonth]);

  const monthMeetings = grouped.map.get(selectedMonth) ?? [];
  const getRef = (id: string) => printRefs.current[id] ?? null;

  const handleDownloadSingle = async (meeting: any) => {
    const el = getRef(meeting.id);
    if (!el) return;

    const filenameBase = safeFileName(`Meeting-${meeting.title || meeting.id}`);
    const { pdf } = await elementToPdfFile(el, filenameBase);
    pdf.save(`${filenameBase}.pdf`);
  };

  const handleShareSingle = async (meeting: any) => {
    const el = getRef(meeting.id);
    if (!el) return;

    const filenameBase = safeFileName(`Meeting-${meeting.title || meeting.id}`);
    const { pdf, file } = await elementToPdfFile(el, filenameBase);

    // ✅ Email body uses same MOM content as PDF
    const text = buildMomText(meeting);

    // ✅ Web Share with attachment (mobile / supported browsers)
    // @ts-ignore
    const canShareFiles =
      navigator.share &&
      (navigator.canShare ? navigator.canShare({ files: [file] }) : true);

    if (canShareFiles) {
      await navigator.share({
        title: `MoM: ${meeting.title ?? "Meeting"}`,
        text,
        files: [file],
      });
      return;
    }

    // ✅ Desktop fallback: DOWNLOAD + MAILTO (manual attach)
    pdf.save(`${filenameBase}.pdf`);

    const subject = encodeURIComponent(`MoM: ${meeting.title ?? "Meeting"}`);
    const body = encodeURIComponent(
      text +
        "\n\nIMPORTANT:\n" +
        "The meeting PDF has been downloaded to your device.\n" +
        "Please attach the PDF manually before sending this email."
    );

    // optional: add cc on desktop mailto
    const cc = encodeURIComponent(ccForDepartment(meeting?.department).join(","));
    window.location.href = `mailto:?subject=${subject}&cc=${cc}&body=${body}`;
  };

  const handleDownloadMonth = async () => {
    await exportMonthPdf(
      monthMeetings,
      getRef,
      safeFileName(`Meetings-${monthLabelFromKey(selectedMonth)}`)
    );
  };

  return (
    <MainLayout
      title="Meetings"
      subtitle="Month-wise meetings"
      actions={
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {grouped.keys.map((m) => (
              <option key={m} value={m}>
                {monthLabelFromKey(m)}
              </option>
            ))}
          </select>

          {/* icon-only Month PDF */}
          <Button
            variant="outline"
            size="icon"
            title="Download Month PDF"
            onClick={handleDownloadMonth}
          >
            <Download className="h-4 w-4" />
          </Button>

          <Link to="/meetings/new">
            <Button size="icon" title="New Meeting">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      }
    >
      {/* cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {monthMeetings.map((m: any) => {
          const href = `/meetings/${m.id}`; // ✅ link to MeetingCompactPage.tsx route

          return (
            <div key={m.id}>
              <MeetingCardCompact
                meeting={m}
                href={href}
                onShare={() => handleShareSingle(m)}
                onDownload={() => handleDownloadSingle(m)}
              />

              {/* Printable block (used for PDF) */}
              <div
                ref={(el) => {
                  printRefs.current[m.id] = el;
                }}
                className="absolute left-[-99999px] top-0 w-[794px] bg-white text-black p-6"
              >
                {/* ✅ PDF format = same MOM content (single source of truth) */}
                <div className="border border-black/10 p-6">
                  <div className="text-center">
                    <div className="text-xl font-bold">MINUTES OF MEETING (MoM)</div>
                    <div className="text-sm text-black/70 mt-1">
                      Reference Number: {buildReferenceNo(m)} | Meeting ID: {m.id ?? "NA"}
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="text-sm whitespace-pre-wrap leading-6">
                    {buildMomText(m)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}
