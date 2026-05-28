import type {
  ActivityItem,
  NotificationItem,
  Priority,
  Project,
  StatItem,
  Ticket,
  TicketStatus,
  Workspace,
} from "./types";

export const workspaces: Workspace[] = [
  { id: "alpha", name: "Leela Robotics", role: "Engineering" },
  { id: "beta", name: "Orbit Lab", role: "Research" },
  { id: "gamma", name: "Nova Ops", role: "Operations" },
];

export const stats: StatItem[] = [
  { label: "Active Projects", value: "12", delta: "+2.4%", direction: "up" },
  { label: "Open Tickets", value: "48", delta: "+8.1%", direction: "up" },
  { label: "In Review", value: "9", delta: "-3.2%", direction: "down" },
  { label: "Completed", value: "128", delta: "+14.6%", direction: "up" },
];

export const projects: Project[] = [
  {
    id: "p1",
    name: "Autonomy Stack",
    description: "Navigation, planning, and recovery behaviors for field robots.",
    status: "active",
    progress: 72,
    dueDate: "Jun 18",
    members: [
      { name: "Aarav", initials: "AA" },
      { name: "Meera", initials: "ME" },
      { name: "Kabir", initials: "KB" },
    ],
  },
  {
    id: "p2",
    name: "Sensor Fusion",
    description: "IMU, GNSS, and vision fusion pipeline for localization.",
    status: "active",
    progress: 54,
    dueDate: "Jun 24",
    members: [
      { name: "Isha", initials: "IS" },
      { name: "Rohan", initials: "RH" },
    ],
  },
  {
    id: "p3",
    name: "Test Bench UI",
    description: "Operator dashboard for hardware bring-up and logs.",
    status: "paused",
    progress: 31,
    dueDate: "Jul 02",
    members: [{ name: "Dev", initials: "DV" }],
  },
];

export const tickets: Ticket[] = [
  {
    id: "t1",
    key: "LEL-101",
    title: "Add robot state timeline",
    summary: "Show battery, mode, pose, and alerts in one live timeline.",
    status: "in-progress",
    priority: "high",
    labels: ["UI", "Telemetry"],
    projectId: "p1",
    assignee: { name: "Aarav", initials: "AA" },
    updatedAt: "2h ago",
  },
  {
    id: "t2",
    key: "LEL-114",
    title: "Improve obstacle layer rendering",
    summary: "Make lane and obstacle overlays easier to inspect in debug mode.",
    status: "review",
    priority: "urgent",
    labels: ["ROS", "Visualization"],
    projectId: "p2",
    assignee: { name: "Meera", initials: "ME" },
    updatedAt: "5h ago",
  },
  {
    id: "t3",
    key: "LEL-122",
    title: "Create empty state for no active runs",
    summary: "Make the app feel alive even when nothing is connected.",
    status: "todo",
    priority: "medium",
    labels: ["UX"],
    projectId: "p3",
    assignee: { name: "Kabir", initials: "KB" },
    updatedAt: "1d ago",
  },
  {
    id: "t4",
    key: "LEL-128",
    title: "Refactor run controls",
    summary: "Group start, pause, and stop into one cleaner action area.",
    status: "backlog",
    priority: "low",
    labels: ["Controls"],
    projectId: "p1",
    assignee: { name: "Isha", initials: "IS" },
    updatedAt: "2d ago",
  },
];

export const activity: ActivityItem[] = [
  {
    id: "a1",
    actor: "Meera",
    action: "moved",
    target: "Obstacle layer rendering",
    time: "10m ago",
  },
  {
    id: "a2",
    actor: "Aarav",
    action: "commented on",
    target: "Robot state timeline",
    time: "42m ago",
  },
  {
    id: "a3",
    actor: "Kabir",
    action: "created",
    target: "Empty state for no active runs",
    time: "2h ago",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "2 tickets need review",
    description: "Autonomy Stack is waiting for your approval.",
    time: "Just now",
    unread: true,
  },
  {
    id: "n2",
    title: "Build passed",
    description: "Main branch successfully deployed to preview.",
    time: "31m ago",
  },
];

export const ticketStatuses: TicketStatus[] = [
  "backlog",
  "todo",
  "in-progress",
  "review",
  "done",
];

export const priorities: Priority[] = ["low", "medium", "high", "urgent"];