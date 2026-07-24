import type { ProfileExtras } from "./profile-types";

export const profileExtras: ProfileExtras = {
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