import type { UserProfile } from "./profile-types";

export const currentUser: UserProfile = {
  id: "1",

  name: "Narayan Mishra",

  role: "head",

  email: "narayan@ugvdtu.in",

  rollNo: "2K24/EC/001",

  department: "Electronics",

  skills: [
    "ROS",
    "ROS2",
    "Embedded Systems",
    "Computer Vision",
    "Autonomous Navigation",
  ],

  stats: {
    ticketsAssigned: 24,
    ticketsCompleted: 17,
    activeProjects: 4,
  },

  headStats: {
    ticketsAssignedByMe: 51,
    membersManaged: 9,
    teamTicketsClosed: 38,
  },

  activity: [
    {
      id: "1",
      action: "Assigned Sensor Fusion debugging task",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      action: "Reviewed Navigation stack ticket",
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      action: "Closed Rover UI bug",
      timestamp: "Yesterday",
    },
  ],
};