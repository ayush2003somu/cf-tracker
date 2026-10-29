/**
 * Tag-to-DSA Mapping Dictionary
 * 
 * Codeforces tags can be fragmented, contest-oriented, or overly specific (e.g., 'dfs and similar', 'flows').
 * In technical interview preparation, companies evaluate candidates across standardized DSA categories.
 * 
 * This map normalizes raw Codeforces problem tags into standardized, industry-recognized DSA categories.
 */

export const TAG_TO_DSA_MAP = {
  // Dynamic Programming
  'dp': 'Dynamic Programming',

  // Graphs & Traversals
  'graphs': 'Graphs',
  'dfs and similar': 'Graph Traversals (DFS/BFS)',
  'shortest paths': 'Graphs',
  'flows': 'Advanced Graphs (Flows & Matchings)',
  'graph matchings': 'Advanced Graphs (Flows & Matchings)',
  '2-sat': 'Advanced Graphs (Flows & Matchings)',

  // Trees
  'trees': 'Trees',

  // Data Structures
  'data structures': 'Data Structures',
  'dsu': 'Disjoint Set Union (DSU)',
  'expression parsing': 'Data Structures (Stacks & Queues)',
  'hashing': 'Hashing',

  // Binary Search & Two Pointers
  'binary search': 'Binary Search',
  'ternary search': 'Binary Search',
  'two pointers': 'Two Pointers & Sliding Window',

  // Bit Manipulation
  'bitmasks': 'Bit Manipulation',

  // Greedy & Constructive
  'greedy': 'Greedy Algorithms',
  'constructive algorithms': 'Constructive Algorithms',
  'schedules': 'Greedy Algorithms',

  // Math & Number Theory
  'math': 'Math & Number Theory',
  'number theory': 'Math & Number Theory',
  'combinatorics': 'Combinatorics & Counting',
  'probabilities': 'Math & Probability',
  'matrices': 'Math & Number Theory',
  'chinese remainder theorem': 'Math & Number Theory',
  'geometry': 'Geometry',
  'fft': 'Advanced Math (FFT)',

  // Strings
  'strings': 'Strings',
  'string suffix structures': 'Strings',

  // Sorting & Divide and Conquer
  'sortings': 'Sorting & Searching',
  'divide and conquer': 'Divide and Conquer',
  'meet-in-the-middle': 'Divide and Conquer',

  // Game Theory & Miscellaneous
  'games': 'Game Theory',
  'interactive': 'Interactive',
  'brute force': 'Brute Force',
  'implementation': 'Implementation'
};

/**
 * Standard DSA topics prioritized for technical interviews and gap analysis.
 * This list is used to evaluate topic coverage and identify weak areas.
 */
export const STANDARD_DSA_TOPICS = [
  'Dynamic Programming',
  'Graph Traversals (DFS/BFS)',
  'Graphs',
  'Trees',
  'Data Structures',
  'Disjoint Set Union (DSU)',
  'Binary Search',
  'Two Pointers & Sliding Window',
  'Bit Manipulation',
  'Greedy Algorithms',
  'Math & Number Theory',
  'Strings',
  'Sorting & Searching'
];
