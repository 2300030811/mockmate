
export const DAILY_PROBLEMS = [
  { 
    id: "p1", 
    title: "Array Intersection", 
    category: "Algorithms", 
    difficulty: "Easy", 
    points: 10,
    description: `Given two integer arrays \`nums1\` and \`nums2\`, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.`,
    examples: [
        { input: "nums1 = [1,2,2,1], nums2 = [2,2]", output: "[2]" },
        { input: "nums1 = [4,9,5], nums2 = [9,4,9,8,4]", output: "[4,9]" }
    ],
    starterCode: {
      javascript: "function intersection(nums1, nums2) {\n  // Type your solution here\n  \n}",
      python: "def intersection(nums1, nums2):\n    # Type your solution here\n    pass",
      cpp: "vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {\n    // Type your solution here\n    \n}"
    }
  },
  { 
    id: "p2", 
    title: "Longest Substring", 
    category: "Strings", 
    difficulty: "Medium", 
    points: 20,
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    examples: [
        { input: "s = \"abcabcbb\"", output: "3" },
        { input: "s = \"bbbbb\"", output: "1" }
  ],
    starterCode: {
      javascript: "function lengthOfLongestSubstring(s) {\n  \n}",
      python: "def lengthOfLongestSubstring(s):\n    pass"
    }
  },
  { 
    id: "p3", 
    title: "Merge K Lists", 
    category: "Hard", 
    difficulty: "Hard", 
    points: 50,
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    examples: [
        { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }
    ],
    starterCode: {
      javascript: "function mergeKLists(lists) {\n  \n}",
      python: "def mergeKLists(lists):\n    pass"
    }
  },
  { 
    id: "p4", 
    title: "Valid Palindrome", 
    category: "Strings", 
    difficulty: "Easy", 
    points: 10,
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    examples: [
        { input: "s = \"A man, a plan, a canal: Panama\"", output: "true" },
        { input: "s = \"race a car\"", output: "false" }
    ],
    starterCode: {
      javascript: "function isPalindrome(s) {\n  \n}",
      python: "def isPalindrome(s):\n    pass"
    }
  },
  { 
    id: "p5", 
    title: "Search in Rotated Array", 
    category: "Algorithms", 
    difficulty: "Medium", 
    points: 25,
    description: "Search for a target value in a sorted array that has been rotated at an unknown pivot.",
    examples: [
        { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" }
    ],
    starterCode: {
      javascript: "function search(nums, target) {\n  \n}",
      python: "def search(nums, target):\n    pass"
    }
  }
];
