
export const quizThemes = {
  aws: {
    id: "aws",
    title: "Master the Cloud",
    subtitle: "Prepare for the AWS Certified Cloud Practitioner exam with our comprehensive practice suite.",
    badge: {
      text: "AWS CERTIFIED CLOUD PRACTITIONER",
      icon: "☁️",
      className: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400"
    },
    bgGradient: "bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950",
    titleGradient: "bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-800 dark:from-orange-400 dark:via-yellow-300 dark:to-orange-200",
    orb1: "bg-orange-500/20 dark:bg-orange-500/10",
    orb2: "bg-yellow-500/20 dark:bg-yellow-500/10",
    exam: {
      count: 65,
      duration: 90,
      passingScore: "70% (46/65 correct)",
      default: 65,
      options: [30, 50, 65]
    },
    questionTypes: ["MCQ", "Multiple Select"],
    practice: {
      default: "all" as number | "all",
      options: [30, 50, 65, 100],
      max: 1500,
      activeClass: "bg-orange-600 text-white shadow-lg shadow-orange-500/30",
      ringClass: "focus:ring-orange-500"
    },
    cards: {
      practice: {
        gradient: "from-orange-400 to-yellow-500",
        iconBgLight: "bg-orange-100",
        iconBgDark: "bg-orange-500",
        iconColorClass: "text-orange-600",
        icon: "☁️"
      },
      exam: {
        gradient: "from-red-500 to-orange-600",
        iconBgLight: "bg-red-100",
        iconBgDark: "bg-red-500",
        iconColorClass: "text-red-500",
        buttonColorClass: "text-red-700 dark:text-red-900"
      }
    }
  },
  azure: {
    id: "azure",
    title: "Master Azure Cloud",
    subtitle: "Choose how you want to prepare for Microsoft Azure Fundamentals certification.",
    badge: {
      text: "AZ-900 AZURE FUNDAMENTALS",
      icon: "🔷",
      className: "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400"
    },
    bgGradient: "bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950",
    titleGradient: "bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 dark:from-blue-400 dark:via-cyan-300 dark:to-blue-200",
    orb1: "bg-cyan-500/20 dark:bg-cyan-500/10",
    orb2: "bg-blue-500/20 dark:bg-blue-500/10",
    exam: {
      count: 40,
      duration: 45,
      passingScore: "700/1000 (~70%)",
      default: 40,
      options: [30, 40, 50]
    },
    questionTypes: ["MCQ", "Multiple Select", "Hotspot", "Drag & Drop", "Case Study"],
    practice: {
      default: "all" as number | "all",
      options: [30, 50, 65, 100],
      max: 500,
      activeClass: "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30",
      ringClass: "focus:ring-cyan-500"
    },
    cards: {
      practice: {
        gradient: "from-cyan-400 to-blue-500",
        iconBgLight: "bg-cyan-100",
        iconBgDark: "bg-cyan-500",
        iconColorClass: "text-cyan-600",
        icon: "🔷"
      },
      exam: {
        gradient: "from-blue-500 to-indigo-600",
        iconBgLight: "bg-blue-100",
        iconBgDark: "bg-blue-500",
        iconColorClass: "text-blue-500",
        buttonColorClass: "text-blue-700 dark:text-blue-900"
      }
    }
  },
  salesforce: {
    id: "salesforce",
    title: "Master Agentforce",
    subtitle: "Detailed questions for Salesforce Agentforce Specialist Certification.",
    badge: {
      text: "SALESFORCE AGENTFORCE",
      icon: "💼",
      className: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
    },
    bgGradient: "bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-blue-950 dark:to-cyan-950",
    titleGradient: "bg-gradient-to-r from-blue-900 via-cyan-700 to-blue-800 dark:from-white dark:via-cyan-200 dark:to-blue-200",
    orb1: "bg-blue-400/20 dark:bg-blue-500/10",
    orb2: "bg-cyan-400/20 dark:bg-cyan-500/10",
    exam: {
      count: 60,
      duration: 90,
      passingScore: "70%",
      default: 60,
      options: [30, 45, 60]
    },
    questionTypes: ["MCQ", "Multiple Select"],
    practice: {
      default: "all" as number | "all",
      options: [30, 60, 100],
      max: 500,
      activeClass: "bg-blue-600 text-white shadow-lg shadow-blue-500/30",
      ringClass: "focus:ring-blue-500"
    },
    cards: {
      practice: {
        gradient: "from-cyan-500 to-blue-500",
        iconBgLight: "bg-cyan-100",
        iconBgDark: "bg-cyan-500",
        iconColorClass: "text-cyan-600",
        icon: "💼"
      },
      exam: {
        gradient: "from-blue-600 to-indigo-600",
        iconBgLight: "bg-indigo-100",
        iconBgDark: "bg-indigo-500",
        iconColorClass: "text-indigo-600",
        buttonColorClass: "text-indigo-700 dark:text-indigo-900"
      }
    }
  },
  mongodb: {
    id: "mongodb",
    title: "Master MongoDB",
    subtitle: "Choose how you want to prepare for MongoDB certification.",
    badge: {
      text: "MONGODB CERTIFICATION PREP",
      icon: "🍃",
      className: "bg-green-500/10 border-green-500/30 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400"
    },
    bgGradient: "bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950",
    titleGradient: "bg-gradient-to-r from-green-600 via-teal-600 to-green-800 dark:from-green-400 dark:via-teal-300 dark:to-green-200",
    orb1: "bg-green-500/20 dark:bg-green-500/10",
    orb2: "bg-teal-500/20 dark:bg-teal-500/10",
    exam: {
      count: 60,
      duration: 90,
      passingScore: "70%",
      default: 60,
      options: [30, 50, 60]
    },
    questionTypes: ["MCQ with Code Snippets", "Multiple Select"],
    practice: {
      default: "all" as number | "all",
      options: [30, 50, 60, 100],
      max: 500, // Assuming default max if not strict
      activeClass: "bg-green-600 text-white shadow-lg shadow-green-500/30",
      ringClass: "focus:ring-green-500"
    },
    cards: {
      practice: {
        gradient: "from-green-400 to-teal-500",
        iconBgLight: "bg-green-100",
        iconBgDark: "bg-green-500",
        iconColorClass: "text-green-600",
        icon: "🍃"
      },
      exam: {
        gradient: "from-teal-500 to-emerald-600",
        iconBgLight: "bg-teal-100",
        iconBgDark: "bg-teal-500",
        iconColorClass: "text-teal-500",
        buttonColorClass: "text-teal-700 dark:text-teal-900"
      }
    }
  },
  pcap: {
    id: "pcap",
    title: "Master Python",
    subtitle: "Prepare for the Certified Associate in Python Programming exam with real scenarios and code challenges.",
    badge: {
      text: "PCAP PYTHON CERTIFICATION",
      icon: "🐍",
      className: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
    },
    bgGradient: "bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950",
    titleGradient: "bg-gradient-to-r from-blue-900 via-sky-800 to-yellow-600 dark:from-blue-100 dark:via-sky-200 dark:to-yellow-200",
    orb1: "bg-blue-500/20 dark:bg-blue-500/10",
    orb2: "bg-yellow-500/20 dark:bg-yellow-500/10",
    exam: {
      count: 40,
      duration: 90,
      passingScore: "70%",
      default: 40,
      options: [20, 30, 40]
    },
    questionTypes: ["Code-Based MCQ", "Multiple Select"],
    practice: {
      default: "all" as number | "all",
      options: [20, 40, 60, 100], // Extrapolated from page
      max: 500,
      activeClass: "bg-blue-600 text-white shadow-lg shadow-blue-500/30",
      ringClass: "focus:ring-blue-500"
    },
    cards: {
      practice: {
        gradient: "from-blue-500 to-sky-500",
        iconBgLight: "bg-blue-100",
        iconBgDark: "bg-blue-500",
        iconColorClass: "text-blue-500",
        icon: "🐍"
      },
      exam: {
        gradient: "from-yellow-400 to-orange-500",
        iconBgLight: "bg-yellow-100",
        iconBgDark: "bg-yellow-500",
        iconColorClass: "text-yellow-600",
        buttonColorClass: "text-yellow-700 dark:text-yellow-900"
      }
    }
  },
  oracle: {
    id: "oracle",
    title: "Master Java & SQL",
    subtitle: "Prepare for the Oracle certification exam with our comprehensive practice suite.",
    badge: {
      text: "ORACLE CERTIFIED ASSOCIATE",
      icon: "🗄️",
      className: "bg-red-500/10 border-red-500/30 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
    },
    bgGradient: "bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950",
    titleGradient: "bg-gradient-to-r from-red-600 via-orange-600 to-red-800 dark:from-red-400 dark:via-orange-300 dark:to-red-200",
    orb1: "bg-red-500/20 dark:bg-red-500/10",
    orb2: "bg-orange-500/20 dark:bg-orange-500/10",
    exam: {
      count: 50,
      duration: 90,
      passingScore: "65%",
      default: 50,
      options: [30, 50, 65]
    },
    questionTypes: ["Java MCQ", "SQL MCQ", "Multiple Select"],
    practice: {
      default: "all" as number | "all",
      options: [30, 50, 65, 100],
      max: 1500,
      activeClass: "bg-red-600 text-white shadow-lg shadow-red-500/30",
      ringClass: "focus:ring-red-500"
    },
    cards: {
      practice: {
        gradient: "from-red-400 to-orange-500",
        iconBgLight: "bg-red-100",
        iconBgDark: "bg-red-500",
        iconColorClass: "text-red-600",
        icon: "🗄️"
      },
      exam: {
        gradient: "from-orange-500 to-red-600",
        iconBgLight: "bg-orange-100",
        iconBgDark: "bg-orange-500",
        iconColorClass: "text-orange-500",
        buttonColorClass: "text-orange-700 dark:text-orange-900"
      }
    }
  }
};

export type QuizTheme = typeof quizThemes.aws;
