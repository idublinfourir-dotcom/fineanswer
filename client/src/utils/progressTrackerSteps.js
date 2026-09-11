// Fixed 10 steps for Study Abroad Document Progress Tracker
export const PROGRESS_STEPS = [
  { step: 1, title: "Document Received" },
  { step: 2, title: "Document Dispatched from BD" },
  { step: 3, title: "Document Arrived in India" },
  { step: 4, title: "Document Submitted in VFS" },
  { step: 5, title: "Document Submitted to the Embassy" },
  { step: 6, title: "Document Collection Email Received" },
  { step: 7, title: "Doc Has Been Collected from VFS" },
  { step: 8, title: "Document Dispatched From India" },
  { step: 9, title: "Document Arrived in BD" },
  { step: 10, title: "Done" },
];

export const getInitialTimeline = () =>
  PROGRESS_STEPS.map(({ step, title }) => ({
    step,
    title,
    date: null,
    completed: false,
  }));

// Convert old format or API data to new format
export const normalizeTimeline = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return getInitialTimeline();
  }

  const stepMap = {};
  data.forEach((item, idx) => {
    const stepNum = item.step ?? (idx + 1);
    const stepIdx = Math.max(0, Math.min(stepNum - 1, 9));
    const def = PROGRESS_STEPS[stepIdx];
    if (def) {
      stepMap[stepIdx] = {
        step: def.step,
        title: def.title,
        date: item.date || null,
        completed: item.completed ?? !!(item.date || item.final),
      };
    }
  });

  return PROGRESS_STEPS.map(({ step, title }, idx) =>
    stepMap[idx]
      ? { ...stepMap[idx], step, title }
      : { step, title, date: null, completed: false },
  );
};
